from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.research import ResearchGapAnalysis
from app.schemas.research import ResearchRequest, ResearchResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/research", tags=["AI Research Gap Finder"])

@router.post("/analyze-gaps", response_model=ResearchResponse, status_code=status.HTTP_201_CREATED)
async def analyze_gaps(payload: ResearchRequest, db: Session = Depends(get_db)):
    analysis_result = await AIService.find_research_gaps(
        domain=payload.domain,
        topic=payload.topic,
        abstract_text=payload.abstract_text or ""
    )
    
    record = ResearchGapAnalysis(
        domain=payload.domain,
        topic=payload.topic,
        abstract_text=payload.abstract_text,
        analysis_result=analysis_result
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/history", response_model=List[ResearchResponse])
def get_history(limit: int = 10, db: Session = Depends(get_db)):
    return db.query(ResearchGapAnalysis).order_by(ResearchGapAnalysis.created_at.desc()).limit(limit).all()
