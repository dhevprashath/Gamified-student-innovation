from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse
from app.services.journey_service import JourneyService

router = APIRouter(prefix="/api/projects", tags=["Projects"])

DEFAULT_PROJECT_TEMPLATES = [
    {
        "title": "EcoTrack - Smart Waste Routing",
        "description": "IoT waste bin sensor network with real-time route optimization for municipal collection vehicles.",
        "domain": "Smart Cities & Sustainability",
        "problem_statement": "Municipal waste collection in urban areas relies on static schedules, leading to overfilled public trash bins, inefficient collection truck routes, excess fuel consumption, and increased carbon emissions.",
        "target_users": "Municipalities, City Operations, Waste Management Agencies",
        "expected_impact": "30% reduction in truck fuel usage and zero bin overflow."
    },
    {
        "title": "AgriSense - AI Crop Disease Detection",
        "description": "Computer vision mobile application for early plant disease diagnosis using smartphone camera imagery.",
        "domain": "AgriTech & Computer Vision",
        "problem_statement": "Smallholder farmers lose up to 40% of annual crop yields due to undetected fungal and bacterial plant diseases because manual inspections are slow and expert agricultural advice is inaccessible in rural areas.",
        "target_users": "Smallholder Farmers, Agronomists, Agricultural Cooperatives",
        "expected_impact": "25% increase in crop yield and early disease detection within 24 hours."
    },
    {
        "title": "HealthPulse - Remote Patient Monitor",
        "description": "Wearable ECG sensor telemetry connected to real-time arrhythmia alerting cloud dashboard.",
        "domain": "HealthTech & Wearables",
        "problem_statement": "Patients with intermittent cardiac arrhythmias lack continuous, low-cost remote monitoring options outside hospital settings, delaying emergency clinical intervention during sudden cardiac events.",
        "target_users": "Outpatients, Elderly Individuals, Rural Health Centers",
        "expected_impact": "50% faster emergency response time for abnormal heart rate events."
    },
    {
        "title": "EduQuest - Gamified STEM Adaptive Learning",
        "description": "Interactive learning workspace providing real-time AI guidance and gamified milestone tracking for student innovators.",
        "domain": "EdTech & Gamification",
        "problem_statement": "STEM and engineering students experience high project abandonment rates (over 70%) due to unstructured guidance, lack of real-time technical feedback, and absent gamified progress incentives.",
        "target_users": "Engineering Students, Incubators, University Accelerators",
        "expected_impact": "45% higher project completion rate and faster transition to MVP."
    },
    {
        "title": "CyberShield - Automated Vulnerability Scanner",
        "description": "Lightweight CI/CD security pipeline scanner detecting OWASP Top 10 web vulnerabilities.",
        "domain": "Cybersecurity & Cloud",
        "problem_statement": "Early-stage student tech startups deploy web applications containing unpatched OWASP security vulnerabilities because commercial enterprise scanners are cost-prohibitive and complex to configure.",
        "target_users": "Student Developers, Startup Founders, DevOps Engineers",
        "expected_impact": "90% security scan coverage prior to production release."
    },
    {
        "title": "AquaFlow - IoT Water Leak Detection",
        "description": "Distributed sensor node network monitoring pipe pressure anomalies and contamination levels.",
        "domain": "Environmental IoT",
        "problem_statement": "Campus and municipal water distribution networks lose thousands of gallons of clean water daily due to undetected underground pipe leaks and unmonitored contamination risks.",
        "target_users": "Campus Facility Management, Public Utility Authorities",
        "expected_impact": "35% reduction in clean water wastage and rapid leak notification."
    }
]

def resolve_project_defaults(title: str, description: str = "", domain: str = "", problem_statement: str = "", target_users: str = "", expected_impact: str = ""):
    """Find matching template by title or generate title-relevant defaults."""
    # Match template by case-insensitive title prefix/substring
    title_lower = title.lower()
    matched_tpl = next((t for t in DEFAULT_PROJECT_TEMPLATES if t["title"].lower() in title_lower or title_lower in t["title"].lower()), None)

    final_desc = description or (matched_tpl["description"] if matched_tpl else f"Innovative solution for {title}.")
    final_domain = domain or (matched_tpl["domain"] if matched_tpl else "General Innovation")

    if problem_statement:
        final_problem = problem_statement
    elif matched_tpl:
        final_problem = matched_tpl["problem_statement"]
    else:
        domain_part = f" within the {final_domain} domain" if final_domain else ""
        final_problem = (
            f"Current operational workflows for '{title}'{domain_part} rely on fragmented, manual processes "
            f"that lack real-time automated guidance, causing significant delays, high costs, and operational bottlenecks for users."
        )

    final_users = target_users or (matched_tpl["target_users"] if matched_tpl else "Student Innovators & Target End-Users")
    final_impact = expected_impact or (matched_tpl["expected_impact"] if matched_tpl else "Improved efficiency and measurable user impact.")

    return {
        "description": final_desc,
        "domain": final_domain,
        "problem_statement": final_problem,
        "target_users": final_users,
        "expected_impact": final_impact
    }

def get_or_create_default_user(db: Session) -> User:
    user = db.query(User).first()
    if not user:
        user = User(name="Student Innovator", email="innovator@student.edu")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    defaults = resolve_project_defaults(
        title=payload.title,
        description=payload.description or "",
        domain=payload.domain or "",
        problem_statement=payload.problem_statement or "",
        target_users=payload.target_users or "",
        expected_impact=payload.expected_impact or ""
    )

    project = Project(
        user_id=user.id,
        title=payload.title,
        description=defaults["description"],
        domain=defaults["domain"],
        problem_statement=defaults["problem_statement"],
        target_users=defaults["target_users"],
        expected_impact=defaults["expected_impact"]
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Initialize journey stages and progress
    JourneyService.get_or_create_journey(project.id, db)
    return project

@router.get("", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    
    if not projects:
        # Seed default project templates for testing and checking purposes
        seeded_projects = []
        for tpl in DEFAULT_PROJECT_TEMPLATES:
            proj = Project(
                user_id=user.id,
                title=tpl["title"],
                description=tpl["description"],
                domain=tpl["domain"],
                problem_statement=tpl["problem_statement"],
                target_users=tpl["target_users"],
                expected_impact=tpl["expected_impact"]
            )
            db.add(proj)
            db.flush()
            JourneyService.get_or_create_journey(proj.id, db)
            seeded_projects.append(proj)
        db.commit()
        for p in seeded_projects:
            db.refresh(p)
        return seeded_projects

    # Backfill missing problem_statement for existing projects
    updated = False
    for proj in projects:
        if not proj.problem_statement:
            defaults = resolve_project_defaults(proj.title, proj.description or "", proj.domain or "")
            proj.problem_statement = defaults["problem_statement"]
            if not proj.target_users:
                proj.target_users = defaults["target_users"]
            if not proj.expected_impact:
                proj.expected_impact = defaults["expected_impact"]
            updated = True
    if updated:
        db.commit()
        for proj in projects:
            db.refresh(proj)

    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Backfill if problem_statement missing
    if not project.problem_statement:
        defaults = resolve_project_defaults(project.title, project.description or "", project.domain or "")
        project.problem_statement = defaults["problem_statement"]
        if not project.target_users:
            project.target_users = defaults["target_users"]
        if not project.expected_impact:
            project.expected_impact = defaults["expected_impact"]
        db.commit()
        db.refresh(project)

    return project
