from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pitch import Pitch
from app.models.project import Project
from app.schemas.pitch import PitchGenerateRequest, PitchResponse
from app.services.ai_service import AIService
from app.services.journey_service import JourneyService

router = APIRouter(prefix="/api/pitch", tags=["AI Pitch Generator"])

@router.post("/generate", response_model=PitchResponse, status_code=status.HTTP_201_CREATED)
async def generate_pitch(payload: PitchGenerateRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    pitch_data = await AIService.generate_pitch(
        project_title=project.title,
        description=project.description or "",
        domain=project.domain or ""
    )

    pitch_rec = Pitch(
        project_id=payload.project_id,
        pitch_data=pitch_data
    )
    db.add(pitch_rec)
    db.commit()
    db.refresh(pitch_rec)

    # Auto-complete Pitch stage in journey
    try:
        JourneyService.complete_stage(payload.project_id, "Pitch", db)
    except Exception:
        pass

    return pitch_rec

@router.get("/{project_id}", response_model=PitchResponse)
def get_pitch(project_id: int, db: Session = Depends(get_db)):
    pitch_rec = db.query(Pitch).filter(
        Pitch.project_id == project_id
    ).order_by(Pitch.created_at.desc()).first()

    if not pitch_rec:
        raise HTTPException(status_code=404, detail="No generated pitch found for this project.")
    return pitch_rec
