from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.advisor import AdvisorSubmission
from app.schemas.advisor import AdvisorRequest, AdvisorResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/advisor", tags=["AI Innovation Advisor"])

@router.post("/analyze", response_model=AdvisorResponse, status_code=status.HTTP_201_CREATED)
async def analyze_idea(payload: AdvisorRequest, db: Session = Depends(get_db)):
    ai_feedback = await AIService.analyze_innovation_idea(
        title=payload.title,
        description=payload.description,
        target_market=payload.target_market or ""
    )
    
    submission = AdvisorSubmission(
        title=payload.title,
        description=payload.description,
        target_market=payload.target_market,
        ai_feedback=ai_feedback
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@router.get("/history", response_model=List[AdvisorResponse])
def get_history(limit: int = 10, db: Session = Depends(get_db)):
    return db.query(AdvisorSubmission).order_by(AdvisorSubmission.created_at.desc()).limit(limit).all()
