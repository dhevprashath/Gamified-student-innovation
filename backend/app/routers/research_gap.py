from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.project import Project
from app.models.research_gap import ResearchGap
from app.schemas.research_gap import ResearchGapAnalyzeRequest, ResearchGapResponse
from app.services.ai_service import AIService
from app.services.journey_service import JourneyService

router = APIRouter(prefix="/api/research-gap", tags=["AI Research Gap Finder"])

@router.post("/analyze", response_model=ResearchGapResponse, status_code=status.HTTP_201_CREATED)
async def analyze_research_gap(payload: ResearchGapAnalyzeRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    gap_data = await AIService.analyze_research_gap(
        topic=payload.research_topic,
        problem=payload.problem_area,
        solution=payload.existing_solution or "",
        domain=payload.target_domain or ""
    )

    gap_rec = ResearchGap(
        project_id=payload.project_id,
        research_topic=payload.research_topic,
        problem_area=payload.problem_area,
        existing_solution=payload.existing_solution,
        target_domain=payload.target_domain,
        gap_data=gap_data
    )
    db.add(gap_rec)
    db.commit()
    db.refresh(gap_rec)

    # Auto-complete Research stage in journey
    try:
        JourneyService.complete_stage(payload.project_id, "Research", db)
    except Exception:
        pass

    return gap_rec

@router.get("/{project_id}", response_model=ResearchGapResponse)
def get_research_gap(project_id: int, db: Session = Depends(get_db)):
    gap = db.query(ResearchGap).filter(
        ResearchGap.project_id == project_id
    ).order_by(ResearchGap.created_at.desc()).first()

    if not gap:
        raise HTTPException(status_code=404, detail="No research gap analysis found for this project.")
    return gap
