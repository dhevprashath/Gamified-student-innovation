from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse
from app.services.journey_service import JourneyService

router = APIRouter(prefix="/api/projects", tags=["Projects"])

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
    project = Project(
        user_id=user.id,
        title=payload.title,
        description=payload.description or "",
        domain=payload.domain or "General Innovation"
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Initialize journey stages and progress
    JourneyService.get_or_create_journey(project.id, db)
    return project

@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    get_or_create_default_user(db)
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    if not projects:
        # Create default initial project if empty
        default_proj = Project(
            user_id=1,
            title="EcoTrack - Smart Waste Routing",
            description="IoT waste bin sensor network with real-time routing.",
            domain="Smart Cities & Sustainability"
        )
        db.add(default_proj)
        db.commit()
        db.refresh(default_proj)
        JourneyService.get_or_create_journey(default_proj.id, db)
        return [default_proj]
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
