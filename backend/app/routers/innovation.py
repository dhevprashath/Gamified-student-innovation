import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.innovation import InnovationAnalysis
from app.models.project import Project
from app.schemas.innovation import InnovationAnalyzeRequest, InnovationResponse
from app.services.ai_service import AIService
from app.services.embedding_service import EmbeddingService
from app.services.journey_service import JourneyService
from app.services.online_search_service import OnlineSearchService

logger = logging.getLogger("innoquest")

router = APIRouter(prefix="/api/innovation", tags=["AI Innovation Advisor"])

@router.post("/analyze", response_model=InnovationResponse, status_code=status.HTTP_201_CREATED)
async def analyze_innovation(payload: InnovationAnalyzeRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 1. Existing LLM Advisor analysis
    analysis_data = await AIService.analyze_innovation(
        title=payload.project_title,
        problem=payload.problem_statement,
        solution=payload.proposed_solution,
        users=payload.target_users or "",
        domain=payload.technology_domain or "",
        impact=payload.expected_impact or ""
    )

    # 2. Dynamic Online Source Search based on Student Problem Statement
    online_candidates = []
    search_error = None
    try:
        online_candidates = await OnlineSearchService.search_candidate_sources(payload.problem_statement)
    except Exception as e:
        logger.error(f"Online source search failed: {e}")
        search_error = str(e)

    # 3. MiniLM Semantic Embeddings & Cosine Similarity Ranking (Student Problem vs Online Solutions)
    top_similar_ideas = []
    max_similarity = 0.0
    novelty_info = {"novelty_score": 100, "novelty_rating": "High Novelty", "novelty_level": "High"}
    new_embedding = None

    # Generate 384-dim embedding for student problem statement
    try:
        student_problem_text = f"Title: {payload.project_title}\nProblem: {payload.problem_statement}\nSolution: {payload.proposed_solution}"
        new_embedding = EmbeddingService.get_embedding(student_problem_text)
    except Exception as e:
        logger.warning(f"Failed to generate MiniLM embedding: {e}")

    if online_candidates and EmbeddingService.is_available():
        top_similar_ideas = EmbeddingService.rank_online_sources(
            student_problem_statement=payload.problem_statement,
            candidates=online_candidates,
            min_similarity=0.35,  # Configurable threshold
            top_k=5
        )
        if top_similar_ideas:
            max_similarity = top_similar_ideas[0]["similarity_score"]
            novelty_info = EmbeddingService.calculate_novelty_score(max_similarity)

    search_status = "success" if top_similar_ideas else ("failed" if search_error else "no_results_above_threshold")

    semantic_analysis = {
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "embedding_dimension": len(new_embedding) if new_embedding else 384,
        "search_status": search_status,
        "error_message": "Unable to retrieve external sources right now. Please try again." if (not top_similar_ideas and (search_error or not online_candidates)) else None,
        "novelty_score": novelty_info["novelty_score"],
        "novelty_rating": novelty_info["novelty_rating"],
        "novelty_level": novelty_info["novelty_level"],
        "max_similarity_score": round(float(max_similarity), 4),
        "max_similarity_percentage": round(float(max_similarity) * 100, 1),
        "top_similar_ideas": top_similar_ideas
    }

    # Integrate semantic_analysis cleanly into analysis_data structure
    analysis_data["semantic_analysis"] = semantic_analysis

    # Save innovation analysis record with 384-dim embedding
    analysis_rec = InnovationAnalysis(
        project_id=payload.project_id,
        project_title=payload.project_title,
        problem_statement=payload.problem_statement,
        proposed_solution=payload.proposed_solution,
        target_users=payload.target_users,
        technology_domain=payload.technology_domain,
        expected_impact=payload.expected_impact,
        embedding=new_embedding,
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
