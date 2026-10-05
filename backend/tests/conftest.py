"""Test isolation.

Two things this file exists to stop:

1. Tests writing to the developer's real database. `app.database` calls
   `load_dotenv()` and builds the engine at *import* time, and `app.main` runs
   schema DDL plus a data backfill at import too. Since the test modules do
   `from app.main import app` at module scope, merely collecting the tests used
   to rewrite `innoquest.db` and insert junk projects on every run.
2. Tests spending real Gemini quota. The LLM and online-search calls are stubbed
   by default; pass `--run-llm` when you deliberately want the live providers.

The database URL has to be set here, at module scope, because pytest imports
conftest.py before it imports any test module. `load_dotenv()` defaults to
`override=False`, so a real environment variable wins over `.env`.
"""

import os
from pathlib import Path

import pytest
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
TEST_DB_PATH = BACKEND_DIR / "test_innoquest.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_PATH}"

# Load the developer's real .env first so --run-llm has genuine keys to restore.
# Nothing is clobbered here (load_dotenv defaults to override=False).
load_dotenv(BACKEND_DIR / ".env")
REAL_AI_API_KEY = os.environ.get("AI_API_KEY", "")
REAL_AI_FALLBACK_API_KEY = os.environ.get("AI_FALLBACK_API_KEY", "") or os.environ.get("GROQ_API_KEY", "")

# Must happen before `app.database` is imported anywhere.
os.environ["DATABASE_URL"] = TEST_DB_URL

# A distinctive key so a stubbed-out call that somehow escapes the fixture
# fails loudly instead of quietly spending the real key's quota. `--run-llm`
# puts the real keys back before any provider call happens.
os.environ["AI_API_KEY"] = "test-key-not-real"
os.environ["AI_FALLBACK_API_KEY"] = "test-key-not-real"


def restore_real_provider_keys():
    """Undo the sentinel-key override so live tests reach real providers."""
    if REAL_AI_API_KEY:
        os.environ["AI_API_KEY"] = REAL_AI_API_KEY
    else:
        os.environ.pop("AI_API_KEY", None)
    if REAL_AI_FALLBACK_API_KEY:
        os.environ["AI_FALLBACK_API_KEY"] = REAL_AI_FALLBACK_API_KEY
    else:
        os.environ.pop("AI_FALLBACK_API_KEY", None)


@pytest.fixture(scope="session")
def real_provider_key():
    """Exposes the developer's real key to tests.

    Deliberately a fixture rather than an import: importing conftest a second
    time re-runs the module-level sentinel override and would clobber the
    restored key partway through the session.
    """
    return REAL_AI_API_KEY


def pytest_addoption(parser):
    parser.addoption(
        "--run-llm",
        action="store_true",
        default=False,
        help="Call the real LLM providers instead of using canned responses.",
    )


# A valid innovation analysis, matching what INNOVATION_SCHEMA asks for.
CANNED_INNOVATION = {
    "problem_clarity": 72,
    "technical_feasibility": 65,
    "market_potential": 58,
    "financial_feasibility": 61,
    "ethical_score": 80,
    "privacy_security_score": 74,
    "overall_risk": "Medium",
    "recommendation": "Promising for a student team, but validate demand before building.",
    "strengths": ["Clear problem statement", "Feasible with a small team"],
    "weaknesses": ["Unclear monetisation", "No user research yet"],
    "improvements": ["Interview ten target users", "Cut the feature list to one core flow"],
    "recommended_technologies": ["React", "FastAPI", "PostgreSQL"],
    "mvp_suggestions": ["Single-page form that records the problem", "Manual analysis behind it"],
}

# A real Crossref record plus a real arXiv preprint, so tests assert against
# plausible metadata rather than invented placeholders.
CANNED_REFERENCES = [
    {
        "title": "An IoT Based Efficient Waste Collection System with Smart Bins",
        "authors": ["Khandaker Foysal Haque", "Rifat Zabin", "Kumar Yelamarthi"],
        "year": 2020,
        "venue": "2020 IEEE 6th World Forum on Internet of Things (WF-IoT)",
        "doi": "10.1109/wf-iot48130.2020.9221251",
        "url": "https://doi.org/10.1109/wf-iot48130.2020.9221251",
        "source": "Crossref",
        "is_preprint": False,
        "abstract_snippet": "Smart bins report fill level to avoid unnecessary collection trips.",
    },
    {
        "title": "Dynamic Waste Collection Model for Smart Bins",
        "authors": ["Asmit Roy Burman", "Urusha Goswami", "Hitesh Sharma"],
        "year": 2022,
        "venue": "arXiv preprint (cs.CY)",
        "doi": None,
        "url": "https://arxiv.org/abs/2201.01234",
        "source": "arXiv",
        "is_preprint": True,
        "abstract_snippet": "Predictive collection scheduling using predicted fill rates.",
    },
]

# A real repository and a real-style article, so the GitHub and blog paths are
# exercised with realistic metadata (stars, language, reading time).
CANNED_PROJECTS = [
    {
        "kind": "project",
        "title": "wazuh/wazuh",
        "source_name": "wazuh/wazuh",
        "description": "Security monitoring and file integrity checking.",
        "url": "https://github.com/wazuh/wazuh",
        "stars": 17000,
        "language": "C",
        "topics": ["security", "monitoring"],
        "last_pushed": "2026-09-01",
        "abstract_snippet": "Security monitoring and file integrity checking.",
    },
]

CANNED_ARTICLES = [
    {
        "kind": "article",
        "title": "How to set up a self-hosted WAF for Webapps",
        "source_name": "Jane Dev",
        "description": "A practical walkthrough of deploying a web application firewall.",
        "url": "https://dev.to/example/self-hosted-waf",
        "reading_time_min": 6,
        "reactions": 24,
        "published": "2026-05-02",
        "tags": ["cybersecurity", "webdev"],
        "abstract_snippet": "A practical walkthrough of deploying a web application firewall.",
    },
]


@pytest.fixture(autouse=True)
def stub_outbound_ai(request, monkeypatch):
    """Replaces network-backed AI with canned data unless --run-llm is passed."""
    if request.config.getoption("--run-llm"):
        # The sentinel keys above are still installed at this point; without
        # this the live run would send "test-key-not-real" to Gemini/Groq and
        # quietly fall back to heuristics, which is what a stubbed run looks like.
        restore_real_provider_keys()
        yield
        return

    from app.services.ai_service import AIService
    from app.services.online_search_service import OnlineSearchService
    from app.services.reference_service import ReferenceService

    async def fake_call_llm_json(prompt, temperature=0.7, schema=None):
        # The gap and pitch prompts name their expected keys explicitly, so
        # return those rather than an approximation.
        if "research_gap" in prompt:
            return {
                "existing_solution_summary": "Current sensors are static and degrade quickly.",
                "existing_limitations": ["High maintenance", "Poor wet-weather accuracy"],
                "research_gap": "No self-calibrating sensor survives monsoon conditions.",
                "why_gap_matters": "Reliable sensing is needed for safe autonomy.",
                "innovation_opportunity": "A student project can prototype adaptive sensing.",
                "suggested_features": ["Auto-calibration", "Weather-aware thresholds"],
                "research_questions": ["Can calibration be learned online?"],
                "future_scope": ["Multi-sensor fusion"],
            }, "stub-model"
        if "pitch_script" in prompt:
            return {
                "project_introduction": "Introducing our solution.",
                "problem": "The current process is slow and error-prone.",
                "solution": "We automate the tedious parts.",
                "innovation": "Adaptive, low-cost sensing.",
                "target_users": "Students and campus teams.",
                "market_opportunity": "A large student market.",
                "business_model": "Freemium with campus licences.",
                "social_environmental_impact": "Reduces waste.",
                "future_scope": "Expand to more campuses.",
                "pitch_script": "Good morning. Here is our two-minute pitch.",
            }, "stub-model"
        return dict(CANNED_INNOVATION), "stub-model"

    async def fake_search(*args, **kwargs):
        # Note: the real method returns a bare list of candidate dicts, not a
        # tuple. Returning a tuple here makes it truthy and breaks the ranker.
        return []

    monkeypatch.setattr(AIService, "_call_llm_json", staticmethod(fake_call_llm_json))
    monkeypatch.setattr(
        OnlineSearchService, "search_candidate_sources", staticmethod(fake_search)
    )

    async def fake_fetch_references(*args, **kwargs):
        return [dict(r) for r in CANNED_REFERENCES], "success"

    async def fake_fetch_projects(*args, **kwargs):
        return [dict(r) for r in CANNED_PROJECTS], "success"

    async def fake_fetch_blogs(*args, **kwargs):
        return [dict(r) for r in CANNED_ARTICLES], "success"

    # Crossref / GitHub / dev.to are all external HTTP, so the default suite
    # must not reach any of them. Ranking still runs for real, since MiniLM is
    # local. Stubbing fetch_references/projects/blogs individually keeps
    # fetch_all itself under test rather than replacing it wholesale.
    monkeypatch.setattr(
        ReferenceService, "fetch_references", staticmethod(fake_fetch_references)
    )
    monkeypatch.setattr(
        ReferenceService, "fetch_projects", staticmethod(fake_fetch_projects)
    )
    monkeypatch.setattr(
        ReferenceService, "fetch_blogs", staticmethod(fake_fetch_blogs)
    )
    yield


@pytest.fixture(scope="session", autouse=True)
def isolated_database():
    """Points every session at the test DB and deletes the file afterwards."""
    # Importing app.database here builds the engine against TEST_DB_URL.
    from app.database import Base, engine

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    engine.dispose()
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()
    # Restore the real value so anything else in this process is unaffected.
    os.environ.pop("DATABASE_URL", None)