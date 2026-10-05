import asyncio
import json
import logging
import os
import re
from typing import Any

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("innoquest")

SCORE_KEYS = [
    "problem_clarity",
    "technical_feasibility",
    "market_potential",
    "financial_feasibility",
    "ethical_score",
    "privacy_security_score",
]

# The configured model is tried first, then these in order. A single hardcoded
# model is fragile: the provider returns 503/429/404 for a given model fairly
# often, so we fail over instead of silently degrading to a canned answer.
MODEL_FALLBACKS = [
    "gemini-3.1-flash-lite-preview,gemini-flash-lite-latest,gemini-3.6-flash",
]

MAX_ATTEMPTS_PER_MODEL = 3

# Groq's Structured Outputs supports strict:true (guaranteed schema match) on
# these models only. Llama was moved to Enterprise-only on free plans, so these
# are the free-tier models that still accept a strict schema.
GROQ_STRICT_SCHEMA_MODELS = {
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
}


def _request_timeout() -> float:
    return float(os.getenv("AI_TIMEOUT_SECONDS", "90"))


def _model_fallbacks() -> list[str]:
    return [
        os.getenv(
            "AI_MODEL_FALLBACKS",
            "gemini-3.1-flash-lite-preview,gemini-flash-lite-latest,gemini-3.6-flash",
        )
    ]


def _secondary_models() -> list[str]:
    """Second provider, so a dead or quota-limited Gemini key cannot end the demo.

    Only needed if AI_FALLBACK_URL and AI_FALLBACK_API_KEY are both set; until
    then behaviour is unchanged.
    """
    models = os.getenv("AI_FALLBACK_MODELS", "")
    return [m.strip() for m in models.split(",") if m.strip()]


def _secondary_route() -> tuple[str, str] | None:
    """Returns (url, api_key) for the fallback provider, or None if unconfigured."""
    url = os.getenv("AI_FALLBACK_URL", "").strip()
    key = os.getenv("AI_FALLBACK_API_KEY", "").strip() or os.getenv("GROQ_API_KEY", "").strip()
    if url and key and _secondary_models():
        return url, key
    return None


def _api_key() -> str | None:
    return (
        os.getenv("AI_API_KEY")
        or os.getenv("LLM_API_KEY")
        or os.getenv("GEMINI_API_KEY")
        or os.getenv("OPENAI_API_KEY")
    )


def _model_chain() -> list[str]:
    models: list[str] = []
    primary = os.getenv("AI_MODEL")
    if primary:
        models.append(primary)
    for group in _model_fallbacks():
        for m in group.split(","):
            m = m.strip()
            if m and m not in models:
                models.append(m)
    return models


def _provider() -> str:
    """Resolves which wire format to speak.

    `gemini-native` uses Google's generateContent endpoint, which accepts a
    strict responseSchema and is the better-supported path. `openai-compat`
    keeps the existing behaviour and is what OpenAI/Groq/OpenRouter need.
    """
    configured = (os.getenv("AI_PROVIDER") or "auto").strip().lower()
    if configured in ("gemini-native", "gemini", "native"):
        return "gemini-native"
    if configured in ("openai-compat", "openai", "compat"):
        return "openai-compat"

    url = os.getenv("AI_API_URL", "")
    if "generativelanguage.googleapis.com" in url and "/openai/" not in url:
        return "gemini-native"
    return "openai-compat"


def _int_score(description: str) -> dict[str, Any]:
    return {"type": "integer", "minimum": 0, "maximum": 100, "description": description}


# Only used on the native endpoint, where the provider enforces it. The
# OpenAI-compat path has no equivalent, so it relies on prompt wording plus
# _finalize_innovation validation.
INNOVATION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "problem_clarity": _int_score("Specificity and measurability of the stated problem."),
        "technical_feasibility": _int_score("Whether a student team can build this in a semester."),
        "market_potential": _int_score("Size and growth of the addressable market."),
        "financial_feasibility": _int_score("Build and run cost versus realistic revenue."),
        "ethical_score": _int_score("Societal benefit, fairness and accessibility."),
        "privacy_security_score": _int_score("Personal data handling, consent and surveillance risk."),
        "overall_risk": {"type": "string", "enum": ["Low", "Medium", "High"]},
        "recommendation": {"type": "string"},
        "strengths": {"type": "array", "items": {"type": "string"}},
        "weaknesses": {"type": "array", "items": {"type": "string"}},
        "improvements": {"type": "array", "items": {"type": "string"}},
        "recommended_technologies": {"type": "array", "items": {"type": "string"}},
        "mvp_suggestions": {"type": "array", "items": {"type": "string"}}
    },
    "required": [
        "problem_clarity", "technical_feasibility", "market_potential",
        "financial_feasibility", "ethical_score", "privacy_security_score",
        "overall_risk", "recommendation", "strengths", "weaknesses",
        "improvements", "recommended_technologies", "mvp_suggestions"
    ]
}


INNOVATION_RUBRIC = """You are a SENIOR INNOVATION REVIEWER for a student innovation showcase. Judge each submission on its own merits against the criteria below. Most ideas are average, a few are poor, and genuinely excellent ones do exist - so use the whole scale.

SCORING SCALE:
- 90-100: exceptional - best-in-class, proven demand, defensible differentiation. Very rare.
- 75-89: strong - credible and well-reasoned, only minor gaps.
- 60-74: solid - plausible and workable, but has clear unaddressed weaknesses.
- 45-59: average - workable idea held back by unproven assumptions or real gaps.
- 30-44: weak - significant flaws, or a crowded market with little differentiation.
- 15-29: poor - largely restates existing commercial products, or is not buildable.
- 0-14: fundamentally flawed or incoherent.

METRIC DEFINITIONS:
- problem_clarity: Is a specific, measurable, real pain described, with identifiable victims? Vague goals like "improve efficiency" score LOW (under 50). A quantified pain affecting a named group scores HIGH (70+).
- technical_feasibility: Can a small student team realistically build this in a semester using standard, available tools? Give full credit (70+) for well-scoped software builds using proven libraries and free-tier cloud services. Penalize custom hardware, training ML models from scratch, and regulatory approval dependencies.
- market_potential: Real size and growth of the addressable market. Give full credit (70+) for large, growing, under-served segments. Penalize tiny niches, and penalize heavily if many strong commercial products already serve this space (generic attendance apps, to-do lists, chatbots, note-taking, food-delivery).
- financial_feasibility: Cost to build and run versus realistic revenue. Student projects that run on free tiers, student time, and modest cloud spend score HIGH (70+). Penalize expensive hardware, licensed data, or paid third-party APIs at scale.
- ethical_score: Societal benefit, fairness, accessibility, and honest use of data. Ideas that help people or reduce harm score HIGH (70+). Ideas that are neutral score MID (45-65). Ideas that risk harm, exclusion, or manipulation score LOW (under 40).
- privacy_security_score: Handling of personal data, user consent, and surveillance risk. Standard, consented, minimal-data collection scores HIGH (70+). Any biometrics, facial recognition, location tracking, or covert monitoring REQUIRES strong safeguards; without them score LOW (under 40).

CALIBRATION (mandatory):
- Use the FULL 0-100 range across the six metrics; do not give six near-identical numbers.
- Judge only from the SPECIFIC text provided. If the submission is thin, vague, or generic, score it low - that is the correct and honest answer.
- A well-specified, focused, buildable idea SHOULD be able to score 70+. Do not artificially cap scores. If the idea genuinely earns a high score, award it."""


class AIService:

    @staticmethod
    async def analyze_innovation(
        title: str,
        problem: str,
        solution: str,
        users: str,
        domain: str,
        impact: str
    ) -> dict[str, Any]:
        prompt = f"""{INNOVATION_RUBRIC}

=== STUDENT SUBMISSION ===
Title: {title}
Problem Statement: {problem}
Proposed Solution: {solution}
Target Users: {users}
Technology/Domain: {domain}
Expected Impact: {impact}
=== END SUBMISSION ===

Reason step by step about THIS specific submission: who exactly suffers this problem, how large that group is, what already exists that solves it, what it would cost a student team to build in one semester, and what would most likely make it fail.

Then return ONLY a valid JSON object with exactly these keys:
{{
  "problem_clarity": <int 0-100>,
  "technical_feasibility": <int 0-100>,
  "market_potential": <int 0-100>,
  "financial_feasibility": <int 0-100>,
  "ethical_score": <int 0-100>,
  "privacy_security_score": <int 0-100>,
  "overall_risk": "Low" | "Medium" | "High",
  "recommendation": "<2-3 sentences citing specifics from this submission>",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "recommended_technologies": ["...", "..."],
  "mvp_suggestions": ["...", "..."]
}}
Integers only. No markdown. No key other than those listed. Do not output an "innovation_score" key - it is computed separately from the six metrics."""

        raw, model = await AIService._call_llm_json(prompt, temperature=0.35, schema=INNOVATION_SCHEMA)
        if raw:
            return AIService._finalize_innovation(raw, title, problem, solution, users, domain, impact, is_fallback=False, model=model)

        return AIService._heuristic_innovation(title, problem, solution, users, domain, impact)

    @staticmethod
    def _derive_risk(scores: dict[str, int]) -> str:
        """overall_risk is derived from the metrics so the badge can never
        contradict the numbers shown next to it."""
        avg = sum(scores[k] for k in SCORE_KEYS) / len(SCORE_KEYS)
        floor = min(scores[k] for k in SCORE_KEYS)
        if avg < 45 or floor < 25:
            return "High"
        if avg < 65:
            return "Medium"
        return "Low"

    @staticmethod
    def _coerce_score(value: Any) -> int | None:
        if isinstance(value, bool):
            return None
        if isinstance(value, (int, float)):
            return max(0, min(100, int(round(value))))
        if isinstance(value, str):
            m = re.search(r"-?\d+(?:\.\d+)?", value)
            if m:
                return max(0, min(100, int(round(float(m.group())))))
        return None

    @staticmethod
    def _coerce_list(value: Any, limit: int = 5) -> list[str]:
        if isinstance(value, list):
            items = [str(v).strip() for v in value if str(v).strip()]
            return items[:limit]
        if isinstance(value, str) and value.strip():
            return [value.strip()[:400]]
        return []

    @staticmethod
    def _finalize_innovation(
        raw: dict[str, Any],
        title: str,
        problem: str,
        solution: str,
        users: str,
        domain: str,
        impact: str,
        is_fallback: bool,
        model: str | None = None,
    ) -> dict[str, Any]:
        """Clamp, validate and complete the model's JSON. The overall score is
        always the mean of the six metrics, so it can never drift away from the
        breakdown the user is looking at."""
        scores: dict[str, int] = {}
        for key in SCORE_KEYS:
            coerced = AIService._coerce_score(raw.get(key))
            if coerced is None:
                # A missing metric means an incomplete response; fall back to
                # the pessimistic midpoint rather than inventing a high score.
                coerced = 50
            scores[key] = coerced

        overall = int(round(sum(scores[k] for k in SCORE_KEYS) / len(SCORE_KEYS)))

        data: dict[str, Any] = dict(scores)
        data["innovation_score"] = overall
        data["overall_risk"] = AIService._derive_risk(scores)

        recommendation = str(raw.get("recommendation") or "").strip()
        if not recommendation:
            recommendation = (
                f"'{title}' scores {overall}/100 overall. Review the metric breakdown "
                f"to see which dimensions are limiting this idea."
            )
        data["recommendation"] = recommendation

        data["strengths"] = AIService._coerce_list(raw.get("strengths"))
        data["weaknesses"] = AIService._coerce_list(raw.get("weaknesses"))
        data["improvements"] = AIService._coerce_list(raw.get("improvements"))
        data["recommended_technologies"] = AIService._coerce_list(raw.get("recommended_technologies"), 6)
        data["mvp_suggestions"] = AIService._coerce_list(raw.get("mvp_suggestions"))

        data["is_fallback"] = is_fallback
        if model:
            data["model_used"] = model
        return data

    @staticmethod
    def _heuristic_innovation(
        title: str,
        problem: str,
        solution: str,
        users: str,
        domain: str,
        impact: str,
    ) -> dict[str, Any]:
        """Used only when the LLM is unreachable after every model and retry.

        This derives its scores from the actual submission text instead of
        returning one fixed number for every project, and flags itself via
        `is_fallback` so the UI can say the analysis is not AI-generated.
        """
        text = " ".join([title, problem, solution, users, domain, impact]).lower()
        word_count = len((problem + " " + solution).split())

        specificity = min(100, 25 + word_count * 2)
        if re.search(r"\d+\s*(%|percent|users|students|patients|tonnes|kg|litres|hours|minutes|days)", text):
            specificity = min(100, specificity + 25)

        high_risk_tech = ["quantum", "blockchain", "metaverse", "neural", "brain-computer", "holographic", "fusion"]
        heavy_hardware = ["robot", "sensor network", "hardware", "iot device", "drone", "satellite", "chip"]
        risky_tech = sum(1 for k in high_risk_tech if k in text)
        hardware = sum(1 for k in heavy_hardware if k in text)

        technical = max(20, 78 - risky_tech * 22 - hardware * 12)
        if re.search(r"\b(react|python|flask|django|fastapi|node|sql|mysql|mongodb|tailwind|api)\b", text):
            technical += 8

        crowded = ["attendance", "recipe", "todo", "to-do", "note-taking", "notes app", "chatbot", "messaging app",
                   "fitness tracker", "weather app", "calculator", "ecommerce", "e-commerce", "social media"]
        market = 70 - sum(20 for k in crowded if k in text)
        if users and len(users.split()) > 2:
            market += 8
        market = max(10, min(95, market))

        financial = max(20, 75 - risky_tech * 18 - hardware * 14)
        if re.search(r"\b(free|open[- ]source|student|low[- ]cost|affordable)", text):
            financial += 8
        financial = max(15, min(95, financial))

        privacy_risky = ["face recognition", "facial", "biometric", "surveillance", "track employees", "geofenc",
                         "track users", "monitor employees"]
        privacy = 70 - sum(25 for k in privacy_risky if k in text)
        if re.search(r"\b(consent|encrypt|anonym|opt[- ]in|gdpr|compliance)\b", text):
            privacy += 15
        privacy = max(10, min(95, privacy))

        if re.search(r"\b(health|patient|safety|disaster|rural|disab|educat|farmer|environment|climate)\b", text):
            ethical = 82
        else:
            ethical = 60

        if re.search(r"\b(student|students|smallholder|teachers|patients|elderly|municipal|farmer|worker)\b", text):
            ethical += 5
        ethical = max(20, min(95, ethical))

        clarity = max(10, min(95, specificity))

        raw = {
            "problem_clarity": clarity,
            "technical_feasibility": technical,
            "market_potential": market,
            "financial_feasibility": financial,
            "ethical_score": ethical,
            "privacy_security_score": privacy,
            "overall_risk": "Medium",
            "recommendation": (
                f"Automated analysis is temporarily unavailable, so these scores were estimated locally from "
                f"the text of '{title}' and are NOT a full AI review. Re-run the analysis when the AI service "
                f"is reachable for a proper evaluation."
            ),
            "strengths": [
                f"The submission provides {word_count} words of problem and solution detail, which was used to derive these scores.",
                f"Target audience is identified as '{users}'." if users else "No target audience was specified.",
            ],
            "weaknesses": [
                "These are locally derived estimates produced because the AI analysis service could not be reached.",
                "Novelty against existing literature was not verified for this submission.",
            ],
            "improvements": [
                "Re-run the AI analysis once the service is available to get a full rubric-based review.",
                "Add quantified evidence of the problem (numbers, affected population, current cost) to raise problem clarity.",
            ],
            "recommended_technologies": [domain] if domain else [],
            "mvp_suggestions": [],
        }
        return AIService._finalize_innovation(raw, title, problem, solution, users, domain, impact, is_fallback=True)

    @staticmethod
    async def analyze_innovation_idea(title: str, description: str, target_market: str = "") -> dict[str, Any]:
        return await AIService.analyze_innovation(
            title=title,
            problem=description,
            solution=description,
            users=target_market,
            domain=target_market,
            impact=""
        )

    @staticmethod
    async def analyze_research_gap(
        topic: str,
        problem: str,
        solution: str,
        domain: str
    ) -> dict[str, Any]:
        prompt = f"""You are an AI Academic Research Gap Finder. Analyze:
Research Topic: {topic}
Problem Area: {problem}
Existing Solution: {solution}
Target Domain: {domain}

You MUST return a valid JSON object with the exact keys:
{{
  "existing_solution_summary": "Summary of current state of art...",
  "existing_limitations": ["Limitation 1", "Limitation 2"],
  "research_gap": "The identified unaddressed research gap...",
  "why_gap_matters": "Why solving this gap is crucial...",
  "innovation_opportunity": "How your student project seizes this opportunity...",
  "suggested_features": ["Feature 1", "Feature 2"],
  "research_questions": ["Question 1?", "Question 2?"],
  "future_scope": ["Future Scope 1", "Future Scope 2"]
}}
"""
        result, _ = await AIService._call_llm_json(prompt)
        if result:
            return result

        # Intelligent Fallback
        return {
            "existing_solution_summary": f"Current approaches in {domain or 'this field'} rely on static rules or fragmented tools, leading to operational bottlenecks.",
            "existing_limitations": [
                "High manual intervention requirements.",
                "Lack of real-time adaptive feedback loops.",
                "Limited scalability across heterogeneous environments."
            ],
            "research_gap": f"Lack of automated, low-latency contextual optimization algorithms specifically designed for {topic}.",
            "why_gap_matters": "Closing this gap unlocks higher operational efficiency, reduces resource consumption, and improves end-user satisfaction.",
            "innovation_opportunity": "Integrating real-time event-driven API pipelines with student-led rapid prototyping to demonstrate measurable performance gains.",
            "suggested_features": [
                "Automated telemetry anomaly detection.",
                "Dynamic workflow optimization engine.",
                "Interactive visual analytics dashboard."
            ],
            "research_questions": [
                f"How does real-time contextual feedback alter efficiency metrics in {topic}?",
                "What structural performance trade-offs occur when scaling dynamic API endpoints under peak loads?"
            ],
            "future_scope": [
                "Cross-institutional pilot deployments.",
                "Integration with edge hardware sensors for decentralized execution."
            ]
        }

    @staticmethod
    async def generate_pitch(
        project_title: str,
        description: str,
        domain: str,
        innovation_data: dict[str, Any] = None,
        gap_data: dict[str, Any] = None
    ) -> dict[str, Any]:
        prompt = f"""You are an AI Pitch Specialist. Generate a comprehensive startup pitch deck script for:
Project Title: {project_title}
Description: {description}
Domain: {domain}

You MUST return a valid JSON object with the exact keys:
{{
  "project_introduction": "Engaging introduction...",
  "problem": "Clear problem statement...",
  "solution": "Compelling solution pitch...",
  "innovation": "Key innovation highlights...",
  "target_users": "Target market definition...",
  "market_opportunity": "Market size and opportunity...",
  "business_model": "Revenue / sustainability model...",
  "social_environmental_impact": "Impact statement...",
  "future_scope": "Product roadmap and expansion...",
  "pitch_script": "Comprehensive 2-Minute Pitch Script for presentation..."
}}
"""
        result, _ = await AIService._call_llm_json(prompt)
        if result:
            return result

        # Intelligent Fallback
        return {
            "project_introduction": f"Welcome! We are introducing '{project_title}', an innovative platform transforming how {domain or 'users'} tackle real-world challenges.",
            "problem": "Current market solutions are clunky, fragmented, and fail to provide actionable real-time guidance, resulting in wasted time and resources.",
            "solution": f"'{project_title}' provides a unified, intelligent software platform built to automate analysis, optimize workflows, and guide users step-by-step.",
            "innovation": "Our key breakthrough is combining event-driven software architecture with gamified user engagement and AI-powered decision support.",
            "target_users": "Student innovators, university incubators, and tech-forward research teams.",
            "market_opportunity": "Operating in a fast-growing global edtech and student innovation market valued at over $10 Billion.",
            "business_model": "Freemium tier for individual students, with B2B SaaS licensing for university incubation programs and accelerators.",
            "social_environmental_impact": "Accelerates student entrepreneurship, reduces project failure rates, and fosters sustainable technological innovation.",
            "future_scope": "Expanding API integrations, launching mobile apps, and partnering with venture funds for student seed grants.",
            "pitch_script": f"Hi everyone! Did you know that 80% of student innovation projects stall due to lack of structured guidance? I'm excited to present '{project_title}'. We solve this by bringing automated AI analysis and gamified milestones directly into one seamless workspace. With '{project_title}', student teams transform raw ideas into launch-ready ventures 5x faster. Join us in shaping the next generation of innovators! Thank you."
        }

    @staticmethod
    def _extract_json(content: str) -> dict[str, Any] | None:
        """Parses the model reply. Handles fenced code blocks and truncated JSON,
        both of which providers occasionally return despite json_object mode."""
        if not content:
            return None
        text = content.strip()

        fenced = re.search(r"```(?:json)?\s*(.+?)```", text, re.DOTALL)
        if fenced:
            text = fenced.group(1).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        start = text.find("{")
        if start == -1:
            return None

        # Walk to the matching close brace, tracking nesting and string state.
        stack: list[str] = []
        in_string = False
        escape = False
        for idx in range(start, len(text)):
            ch = text[idx]
            if in_string:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == '"':
                    in_string = False
                continue
            if ch == '"':
                in_string = True
            elif ch in "{[":
                stack.append("}" if ch == "{" else "]")
            elif ch in "}]":
                if stack:
                    stack.pop()
                if not stack and ch == "}":
                    try:
                        return json.loads(text[start:idx + 1])
                    except json.JSONDecodeError:
                        return None

        # Truncated response: close the dangling string/brackets and retry.
        salvaged = re.sub(r",\s*$", "", text[start:])
        if escape:
            salvaged = salvaged[:-1]
        if in_string:
            salvaged += '"'
        salvaged += "".join(reversed(stack))
        try:
            return json.loads(salvaged)
        except json.JSONDecodeError:
            return None

    @staticmethod
    def _error_detail(resp: httpx.Response) -> str:
        """The provider returns errors as a JSON *array*, not an object."""
        try:
            payload = resp.json()
            if isinstance(payload, list) and payload:
                err = payload[0].get("error", {})
                return f"{resp.status_code} {err.get('code', '')} {err.get('message', '')[:160]}".strip()
            if isinstance(payload, dict):
                err = payload.get("error", {})
                if isinstance(err, dict):
                    return f"{resp.status_code} {err.get('code', '')} {err.get('message', '')[:160]}".strip()
        except Exception:
            pass
        return f"{resp.status_code} {resp.text[:160]}"

    @staticmethod
    def _strict_schema(schema: dict[str, Any]) -> dict[str, Any]:
        """Adds additionalProperties:false, which Groq's strict mode requires."""
        strict = json.loads(json.dumps(schema))
        strict["additionalProperties"] = False
        return strict

    @staticmethod
    def _build_compat_request(
        model: str, api_key: str, prompt: str, temperature: float, schema: dict | None
    ) -> tuple[str, dict, dict]:
        """OpenAI-compatible shape. Also used for Gemini via Google's shim."""
        url = os.getenv("AI_API_URL", "https://api.openai.com/v1/chat/completions")
        body: dict[str, Any] = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are a rigorous evaluator. Output ONLY valid raw JSON, with no markdown fences and no commentary."},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature
        }
        if schema and model in GROQ_STRICT_SCHEMA_MODELS:
            body["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": "innovation_analysis",
                    "strict": True,
                    "schema": AIService._strict_schema(schema),
                },
            }
        else:
            body["response_format"] = {"type": "json_object"}
        return url, {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, body

    @staticmethod
    def _build_native_request(
        model: str, api_key: str, prompt: str, temperature: float, schema: dict | None
    ) -> tuple[str, dict, dict]:
        """Native Google generateContent shape. Uses responseSchema when one is
        supplied, which makes the provider enforce the types for us."""
        base = os.getenv(
            "AI_NATIVE_URL",
            "https://generativelanguage.googleapis.com/v1beta/models",
        ).rstrip("/")
        url = f"{base}/{model}:generateContent?key={api_key}"
        gen_config: dict[str, Any] = {"temperature": temperature}
        if schema:
            gen_config["responseMimeType"] = "application/json"
            gen_config["responseSchema"] = schema
        body = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": gen_config
        }
        return url, {"Content-Type": "application/json"}, body

    @staticmethod
    def _parse_response(resp: httpx.Response) -> dict[str, Any] | None:
        """Handles both provider response shapes, with a fallback to the
        OpenAI shape in case a shim returns that for the native endpoint."""
        try:
            payload = resp.json()
        except ValueError:
            return None

        content = None
        if isinstance(payload, dict):
            candidates = payload.get("candidates")
            if isinstance(candidates, list) and candidates:
                parts = candidates[0].get("content", {}).get("parts") or []
                if parts:
                    content = parts[0].get("text")
            if content is None:
                try:
                    content = payload["choices"][0]["message"]["content"]
                except (KeyError, IndexError, TypeError):
                    return None
        if content is None:
            return None
        if not isinstance(content, str):
            content = json.dumps(content)
        return AIService._extract_json(content)

    @staticmethod
    async def _call_llm_json(
        prompt: str,
        temperature: float = 0.7,
        schema: dict | None = None,
    ) -> tuple[dict[str, Any] | None, str | None]:
        """Returns (parsed_json, model_used). parsed_json is None if the model
        could not be reached or did not return usable JSON."""
        api_key = _api_key()
        models = _model_chain()
        provider = _provider()
        primary_build = (
            AIService._build_native_request
            if provider == "gemini-native"
            else AIService._build_compat_request
        )

        # Every (provider, model) pair we may try, in order. The primary provider
        # is tried first; the secondary exists so an exhausted or rejected
        # primary key cannot leave the app without a real AI answer.
        # Entries are (label, builder, api_key, model, url_override).
        targets: list[tuple[str, Any, str, str, str | None]] = []
        if api_key:
            for model in models:
                targets.append((f"{provider}:{model}", primary_build, api_key, model, None))
        else:
            logger.error("AI analysis unavailable: no primary API key found in environment.")

        secondary = _secondary_route()
        if secondary:
            sec_url, sec_key = secondary
            for model in _secondary_models():
                targets.append((f"fallback:{model}", AIService._build_compat_request, sec_key, model, sec_url))

        if not targets:
            logger.error("AI analysis unavailable: no model configured.")
            return None, None

        logger.info("AI provider=%s models=%s", provider, models)
        if secondary:
            logger.info("AI fallback provider active, models=%s", _secondary_models())

        last_error = "unknown"
        timeout = _request_timeout()
        async with httpx.AsyncClient(timeout=timeout) as client:
            for label, build, target_key, model, url_override in targets:
                url, headers, body = build(model, target_key, prompt, temperature, schema)
                if url_override:
                    url = url_override
                for attempt in range(1, MAX_ATTEMPTS_PER_MODEL + 1):
                    try:
                        resp = await client.post(url, headers=headers, json=body)

                        if resp.status_code == 200:
                            parsed = AIService._parse_response(resp)
                            if isinstance(parsed, dict) and parsed:
                                logger.info("LLM %s responded OK on attempt %d", label, attempt)
                                return parsed, model

                            last_error = "response was not valid JSON"
                            logger.warning("LLM %s attempt %d: %s", label, attempt, last_error)
                            break

                        last_error = AIService._error_detail(resp)

                        if resp.status_code == 400 and schema:
                            # This model rejects the strict response schema. Drop
                            # it and let the prompt plus _extract_json carry the
                            # load, rather than giving up on the model.
                            logger.warning("LLM %s rejected responseSchema, retrying without it.", label)
                            _, _, fallback_body = build(model, target_key, prompt, temperature, None)
                            try:
                                resp2 = await client.post(url, headers=headers, json=fallback_body)
                                if resp2.status_code == 200:
                                    parsed = AIService._parse_response(resp2)
                                    if isinstance(parsed, dict) and parsed:
                                        return parsed, model
                            except Exception as exc:
                                logger.warning("LLM %s schema-less retry failed: %s", label, exc)
                            break

                        if resp.status_code in (400, 404):
                            # Model is wrong for this endpoint; try the next one.
                            logger.warning("LLM %s unusable: %s", label, last_error)
                            break

                        if resp.status_code in (401, 403):
                            # Bad credentials for this provider. Do not keep
                            # hammering it; try the next target instead.
                            logger.error("LLM %s auth rejected: %s", label, last_error)
                            break

                        if resp.status_code == 429:
                            # Almost always a plan/quota ceiling, which retrying
                            # the same model cannot fix. Fail over right away
                            # instead of burning the request budget.
                            logger.warning("LLM %s quota-limited, trying next: %s", label, last_error)
                            break

                        logger.warning("LLM %s attempt %d/%d: %s", label, attempt, MAX_ATTEMPTS_PER_MODEL, last_error)
                        if attempt < MAX_ATTEMPTS_PER_MODEL:
                            await asyncio.sleep(min(2 ** attempt, 8))
                        else:
                            break

                    except httpx.TimeoutException:
                        last_error = f"timeout after {timeout}s"
                        logger.warning("LLM %s attempt %d/%d: %s", label, attempt, MAX_ATTEMPTS_PER_MODEL, last_error)
                        if attempt < MAX_ATTEMPTS_PER_MODEL:
                            await asyncio.sleep(min(2 ** attempt, 8))
                    except Exception as exc:
                        last_error = f"{type(exc).__name__}: {exc}"
                        logger.warning("LLM %s attempt %d/%d: %s", label, attempt, MAX_ATTEMPTS_PER_MODEL, last_error)
                        if attempt < MAX_ATTEMPTS_PER_MODEL:
                            await asyncio.sleep(min(2 ** attempt, 8))

        logger.error("AI analysis failed for all %d target(s). Last error: %s", len(targets), last_error)
        return None, None
