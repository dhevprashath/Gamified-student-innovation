from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.schemas.journey import CompleteStageRequest, JourneyResponse
from app.services.journey_service import JourneyService

router = APIRouter(prefix="/api/journey", tags=["Gamified Innovation Journey"])

@router.get("/{project_id}", response_model=JourneyResponse)
def get_journey(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return JourneyService.get_or_create_journey(project_id, db)

@router.post("/{project_id}/complete-stage", response_model=JourneyResponse)
def complete_stage(project_id: int, payload: CompleteStageRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        return JourneyService.complete_stage(project_id, payload.stage_name, db)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))
