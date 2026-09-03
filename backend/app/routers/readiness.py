from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.schemas.readiness import ReadinessResponse
from app.services.readiness_service import ReadinessService

router = APIRouter(prefix="/api/readiness", tags=["AI Project Readiness"])

@router.get("/{project_id}", response_model=ReadinessResponse)
def get_readiness(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return ReadinessService.calculate_readiness(project_id, db)
