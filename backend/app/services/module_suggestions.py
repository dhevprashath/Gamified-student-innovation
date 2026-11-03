"""Fast, AI-free sample module ideas for projects.

Every project is seeded with a Starter Sample Set at creation time so the
Dashboard always has relevant module ideas immediately - no network call,
no API cost. AI via /api/modules/suggest replaces the set only when the
user explicitly asks for it ("Regenerate Ideas" in the UI).
"""

from typing import Any

from sqlalchemy.orm import Session

from app.models.module_suggestion import ProjectModule


def _mod(
    name: str,
    description: str,
    category: str,
    priority: str,
    complexity: str,
    duration: str,
    tech: list[str],
    features: list[str],
    deliverable: str,
) -> dict[str, Any]:
    return {
        "name": name,
        "category": category,
        "description": description,
        "priority": priority,
        "complexity": complexity,
        "estimated_duration": duration,
        "tech_stack": tech,
        "key_features": features,
        "deliverable": deliverable,
    }


# Matched against the project's domain + title text, best keyword hit wins.
SAMPLE_SETS: list[dict[str, Any]] = [
    {
        "keywords": ["iot", "sensor", "smart", "dustbin", "vehicle", "track", "city", "water", "energy", "monitor"],
        "label": "IoT / Smart Systems",
        "modules": [
            _mod(
                "Sensor Data Ingestion Gateway",
                "Receives readings from field devices over HTTP/MQTT, validates payloads and stores them for processing.",
                "Integration", "Critical", "Intermediate", "1-2 Weeks",
                ["FastAPI", "MQTT", "MySQL"],
                ["Device message validation", "MQTT topic routing", "Batch write to DB"],
                "Live readings from at least 2 devices stored end-to-end.",
            ),
            _mod(
                "Device Registry & Provisioning",
                "Administers every physical unit: unique IDs, pairing to a location, and secure credential issuance.",
                "Core Architecture", "Critical", "Beginner", "1 Week",
                ["JWT", "SQLAlchemy", "QR Codes"],
                ["Register/retire devices", "Pair device to location", "API key per device"],
                "Devices paired via QR scan appear in the registry.",
            ),
            _mod(
                "Realtime Status Dashboard",
                "Live map and status tiles showing each unit's latest state - the operations staff's daily screen.",
                "UX & Frontend", "High", "Intermediate", "2 Weeks",
                ["React", "Tailwind CSS", "WebSocket"],
                ["Live WebSocket updates", "Map view of units", "Status filter tiles"],
                "Dashboard shows live updates for every registered unit.",
            ),
            _mod(
                "Alerting & Notification Module",
                "Fires push/email alerts the moment a unit crosses a threshold, so no anomaly is missed.",
                "Integration", "High", "Beginner", "1 Week",
                ["SMTP", "React Toasts", "Cron"],
                ["Threshold triggers", "Email digest", "In-app toasts"],
                "Threshold breach produces an email + in-app alert.",
            ),
            _mod(
                "Analytics & Reporting Engine",
                "Historical charts, trends and weekly reports that turn raw telemetry into decisions.",
                "Data & Analytics", "Recommended", "Advanced", "2 Weeks",
                ["Pandas", "Recharts", "Celery"],
                ["Utilization trends", "Weekly PDF report", "Anomaly snapshots"],
                "Weekly report email generated from real history.",
            ),
            _mod(
                "Mobile Companion App",
                "Field-staff app for viewing routes, marking work done and reporting on-site issues.",
                "UX & Frontend", "Optional", "Advanced", "2-3 Weeks",
                ["React Native", "Expo", "REST API"],
                ["Route checklist", "Photo capture of issues", "Offline-first store"],
                "Staff member completes a checklist item from the field.",
            ),
        ],
    },
    {
        "keywords": ["ai", "ml", "predict", "detect", "classif", "recommend", "vision", "nlp", "chatbot", "model"],
        "label": "AI / ML Product",
        "modules": [
            _mod(
                "Dataset Pipeline",
                "Collects, cleans and version-tracks the labelled data that all model work depends on.",
                "Data & Analytics", "Critical", "Intermediate", "1-2 Weeks",
                ["Pandas", "SQLAlchemy", "DVC"],
                ["Cleaning rules", "Train/test split", "Label schema validation"],
                "Versioned, split dataset reproducible by one script.",
            ),
            _mod(
                "Model Training & Evaluation",
                "Baseline model + metrics dashboard so every experiment is comparable and honest.",
                "AI/ML Core", "Critical", "Advanced", "2-3 Weeks",
                ["scikit-learn", "PyTorch", "MLflow"],
                ["Baseline first", "Precision/recall/F1 report", "Experiment logging"],
                "Two models compared on identical metrics.",
            ),
            _mod(
                "Inference REST API",
                "Serves trained models behind one validated endpoint with latency and confidence output.",
                "AI/ML Core", "Critical", "Intermediate", "1 Week",
                ["FastAPI", "Pydantic", "Uvicorn"],
                ["Batch + single predict", "Confidence score field", "Explainable output"],
                "API call returns scored prediction under 1s.",
            ),
            _mod(
                "User Management & Auth",
                "Sign-up, login and roles so real users can safely use the product.",
                "Core Architecture", "High", "Beginner", "1 Week",
                ["FastAPI", "JWT", "MySQL"],
                ["Email/password auth", "Role-based access", "Session refresh"],
                "Protected route responds differently per role.",
            ),
            _mod(
                "Prediction Dashboard",
                "Upload -> predict -> visualize experience that makes the model tangible to users.",
                "UX & Frontend", "High", "Intermediate", "2 Weeks",
                ["React", "Tailwind CSS", "Recharts"],
                ["File upload with progress", "Result cards & charts", "Prediction history"],
                "Uploaded file yields scored results on screen.",
            ),
            _mod(
                "Feedback & Improvement Loop",
                "Users flag wrong predictions; flags are stored and reviewed to improve future models.",
                "Integration", "Recommended", "Beginner", "1 Week",
                ["React", "FastAPI", "MySQL"],
                ["Thumbs up/down capture", "Flag review queue", "Export flagged set"],
                "Flagged records exportable for the next training run.",
            ),
        ],
    },
    {
        "keywords": ["learn", "edu", "course", "student", "quiz", "tutor", "attend", "college", "campus", "library"],
        "label": "EdTech / Campus",
        "modules": [
            _mod(
                "User Management & Roles",
                "Students, faculty and admins each get the right view - the backbone of any campus platform.",
                "Core Architecture", "Critical", "Beginner", "1 Week",
                ["FastAPI", "JWT", "MySQL"],
                ["Role-based access", "Profile pages", "Password reset"],
                "Three roles log in and see distinct dashboards.",
            ),
            _mod(
                "Content & Course Manager",
                "Publishers upload, structure and schedule learning content in organized units.",
                "Core Architecture", "Critical", "Intermediate", "2 Weeks",
                ["FastAPI", "S3", "React"],
                ["Rich content upload", "Unit/chapter ordering", "Publish draft flow"],
                "A course browseable end-to-end with 3 units.",
            ),
            _mod(
                "Quiz & Assessment Engine",
                "Auto-graded quizzes with instant scoring - the engagement engine of the platform.",
                "AI/ML Core", "High", "Intermediate", "2 Weeks",
                ["FastAPI", "React", "MySQL"],
                ["MCQ + timed mode", "Auto grading", "Score history"],
                "Student completes a 5-question quiz and sees a score.",
            ),
            _mod(
                "Progress & Gamification",
                "XP, badges and streaks that keep students coming back to finish what they start.",
                "UX & Frontend", "High", "Beginner", "1 Week",
                ["React", "Recharts", "Tailwind CSS"],
                ["XP per completion", "Badge unlock rules", "Weekly streaks"],
                "Completing content fires XP + a toast.",
            ),
            _mod(
                "Notifications & Reminders",
                "Deadlines and nudges delivered where students actually look.",
                "Integration", "Recommended", "Beginner", "1 Week",
                ["SMTP", "Cron", "Web Push"],
                ["Deadline reminders", "In-app inbox", "Email digest"],
                "Scheduled reminder email sent from live data.",
            ),
            _mod(
                "Analytics & Reports",
                "Cohort dashboards for faculty: who is on track, at risk, and what is working.",
                "Data & Analytics", "Optional", "Intermediate", "1-2 Weeks",
                ["Pandas", "Recharts", "FastAPI"],
                ["At-risk student list", "Cohort trends", "CSV export"],
                "Faculty exports a genuine class report.",
            ),
        ],
    },
]

# Used when no keyword set matches - a solid generic product skeleton.
GENERIC_SET: list[dict[str, Any]] = [
    _mod(
        "User Authentication & Profiles",
        "Secure sign-up, login and role handling so every feature has identifiable users.",
        "Core Architecture", "Critical", "Beginner", "1 Week",
        ["FastAPI", "JWT", "MySQL"],
        ["Email/password auth", "Session refresh", "Role-based access"],
        "Login flow works with protected routes.",
    ),
    _mod(
        "Core Data Pipeline",
        "Ingest, validate and store the primary data that powers the product.",
        "Data & Analytics", "Critical", "Intermediate", "2 Weeks",
        ["Python", "Pydantic", "SQLAlchemy"],
        ["Input validation", "Batch upload API", "Quality checks"],
        "Database populated with validated records.",
    ),
    _mod(
        "Main Application Dashboard",
        "The screen users open every day - summaries, primary actions and latest activity.",
        "UX & Frontend", "High", "Intermediate", "2 Weeks",
        ["React", "Tailwind CSS", "Recharts"],
        ["Role-aware widgets", "Quick actions bar", "Activity feed"],
        "Dashboard fully wired to backend endpoints.",
    ),
    _mod(
        "Automation Engine",
        "Rule/recommendation layer that saves manual work and drives core value.",
        "AI/ML Core", "High", "Advanced", "2-3 Weeks",
        ["Python", "Cron", "LLM API"],
        ["Trigger-based tasks", "Structured outputs", "Fallback handling"],
        "One automated job runs against live data.",
    ),
    _mod(
        "Notifications & Alerts",
        "Push/email notifications that keep users engaged between visits.",
        "Integration", "Recommended", "Beginner", "1 Week",
        ["SMTP", "Web Push", "React Toasts"],
        ["Event triggers", "Email digest", "In-app alerts"],
        "Alert fires end-to-end on a key event.",
    ),
    _mod(
        "Export & Sharing",
        "Downloadable reports and shareable views so results can reach stakeholders.",
        "Integration", "Optional", "Beginner", "1 Week",
        ["WeasyPrint", "React", "REST API"],
        ["PDF/CSV export", "Public share links", "Themed templates"],
        "Stakeholder receives a genuine PDF export.",
    ),
]


def sample_modules_for(title: str, domain: str, description: str = "") -> dict[str, Any]:
    """Pick the sample set whose keywords best match the project text."""
    haystack = f"{title} {domain} {description}".lower()
    best, best_score = None, 0
    for s in SAMPLE_SETS:
        score = sum(1 for k in s["keywords"] if k in haystack)
        if score > best_score:
            best, best_score = s, score
    if best:
        return {"modules": best["modules"], "label": best["label"], "is_fallback": False}
    return {"modules": GENERIC_SET, "label": "Generic Product", "is_fallback": False}


def _clean(value: Any, limit: int) -> str:
    return str(value or "").strip()[:limit]


def save_modules(
    db: Session,
    project,
    raw_modules: list[dict[str, Any]],
    status: str = "Suggested",
) -> list[ProjectModule]:
    """Replace a project's module list with the given set and persist it."""
    db.query(ProjectModule).filter(ProjectModule.project_id == project.id).delete()
    saved = []
    for raw in raw_modules:
        name = _clean(raw.get("name"), 255)
        if not name:
            continue
        mod = ProjectModule(
            project_id=project.id,
            name=name,
            category=_clean(raw.get("category"), 100) or "Core Architecture",
            description=_clean(raw.get("description"), 400),
            priority=_clean(raw.get("priority"), 50) or "High",
            complexity=_clean(raw.get("complexity"), 50) or "Medium",
            estimated_duration=_clean(raw.get("estimated_duration"), 50) or "1-2 Weeks",
            tech_stack=[str(t).strip()[:120] for t in (raw.get("tech_stack") or []) if str(t).strip()][:6],
            key_features=[str(v).strip()[:120] for v in (raw.get("key_features") or []) if str(v).strip()][:6],
            deliverable=_clean(raw.get("deliverable"), 255),
            status=status,
        )
        db.add(mod)
        saved.append(mod)
    db.commit()
    return saved


def seed_sample_modules(project, db: Session) -> list[ProjectModule]:
    """Seed a fresh project with its related starter sample set instantly."""
    result = sample_modules_for(project.title, project.domain or "", project.description or "")
    return save_modules(db, project, result["modules"], status="Sample")
