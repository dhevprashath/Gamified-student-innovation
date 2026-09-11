from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.innovation import InnovationAnalysis
from app.models.project import Project
from app.schemas.innovation import InnovationAnalyzeRequest, InnovationResponse
from app.services.ai_service import AIService
from app.services.journey_service import JourneyService

router = APIRouter(prefix="/api/innovation", tags=["AI Innovation Advisor"])

@router.post("/analyze", response_model=InnovationResponse, status_code=status.HTTP_201_CREATED)
async def analyze_innovation(payload: InnovationAnalyzeRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    analysis_data = await AIService.analyze_innovation(
        title=payload.project_title,
        problem=payload.problem_statement,
        solution=payload.proposed_solution,
        users=payload.target_users or "",
        domain=payload.technology_domain or "",
        impact=payload.expected_impact or ""
    )

    analysis_rec = InnovationAnalysis(
        project_id=payload.project_id,
        project_title=payload.project_title,
        problem_statement=payload.problem_statement,
        proposed_solution=payload.proposed_solution,
        target_users=payload.target_users,
        technology_domain=payload.technology_domain,
        expected_impact=payload.expected_impact,
        analysis_data=analysis_data
    )
    db.add(analysis_rec)
    db.commit()
    db.refresh(analysis_rec)

    # Auto-complete Idea stage in journey
    try:
        JourneyService.complete_stage(payload.project_id, "Idea", db)
    except Exception:
        pass

    return analysis_rec

@router.get("/{project_id}", response_model=InnovationResponse)
def get_innovation_analysis(project_id: int, db: Session = Depends(get_db)):
    analysis = db.query(InnovationAnalysis).filter(
        InnovationAnalysis.project_id == project_id
    ).order_by(InnovationAnalysis.created_at.desc()).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="No innovation analysis found for this project.")
    return analysis
