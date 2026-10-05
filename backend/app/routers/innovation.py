import hashlib
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
from app.services.reference_service import ReferenceService

logger = logging.getLogger("innoquest")

router = APIRouter(prefix="/api/innovation", tags=["AI Innovation Advisor"])

# Bump when the stored analysis_data gains a new section. Rows cached before the
# bump hold no "references" key, so without this a cache hit would keep serving
# them with the References section silently missing.
ANALYSIS_CACHE_VERSION = "v3-references-3cat"


def compute_input_hash(payload: InnovationAnalyzeRequest) -> str:
    """Stable fingerprint of everything the AI scores. Re-analyzing unchanged
    text reuses the stored result instead of spending another API call."""
    parts = [
        ANALYSIS_CACHE_VERSION,
        payload.project_title or "",
        payload.problem_statement or "",
        payload.proposed_solution or "",
        payload.target_users or "",
        payload.technology_domain or "",
        payload.expected_impact or "",
    ]
    return hashlib.sha256("\x1f".join(parts).encode("utf-8")).hexdigest()


@router.post("/analyze", response_model=InnovationResponse, status_code=status.HTTP_201_CREATED)
async def analyze_innovation(payload: InnovationAnalyzeRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Reuse a previous genuine analysis of identical text. Editing any field
    # changes the hash, so a revised project still gets a fresh evaluation.
    input_hash = compute_input_hash(payload)
    if not payload.force:
        cached = db.query(InnovationAnalysis).filter(
            InnovationAnalysis.project_id == payload.project_id,
            InnovationAnalysis.is_fallback == False,  # noqa: E712
            InnovationAnalysis.input_hash == input_hash,
        ).order_by(InnovationAnalysis.created_at.desc()).first()
        if cached:
            logger.info(
                "Cache hit for project %s (hash=%s); skipping AI call.", payload.project_id, input_hash[:12]
            )
            return cached

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
    novelty_info = None
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

    # Novelty is only meaningful when it was actually measured. Reporting 100
    # when nothing was compared would tell the user their idea is maximally
    # novel on the basis of no evidence at all.
    if novelty_info:
        novelty_score = novelty_info["novelty_score"]
        novelty_rating = novelty_info["novelty_rating"]
        novelty_level = novelty_info["novelty_level"]
    else:
        novelty_score = None
        novelty_rating = "Not Assessed"
        novelty_level = None

    semantic_analysis = {
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "embedding_dimension": len(new_embedding) if new_embedding else None,
        "search_status": search_status,
        "error_message": "Unable to retrieve external sources right now. Please try again." if (not top_similar_ideas and (search_error or not online_candidates)) else None,
        "novelty_score": novelty_score,
        "novelty_rating": novelty_rating,
        "novelty_level": novelty_level,
        # Only report a similarity when something was actually compared. A
        # default of 0.0 would read as "nothing similar exists" and imply
        # maximal novelty, which is the opposite of "not measured".
        "max_similarity_score": round(float(max_similarity), 4) if novelty_info else None,
        "max_similarity_percentage": round(float(max_similarity) * 100, 1) if novelty_info else None,
        "top_similar_ideas": top_similar_ideas
    }

    # Integrate semantic_analysis cleanly into analysis_data structure
    analysis_data["semantic_analysis"] = semantic_analysis

    # 4. References, in three categories the student can actually act on:
    #    academic papers (evidence), GitHub projects (prior art to run or beat)
    #    and blog articles (implementation detail). Everything is fetched from
    #    live indexes, so nothing here is model-generated. Like the search
    #    above, this only runs on a cache miss.
    try:
        references_block = await ReferenceService.fetch_all(
            payload.problem_statement or "",
            payload.technology_domain or "",
            embedder=EmbeddingService,
        )
    except Exception as e:
        logger.warning(f"Reference lookup failed: {e}")
        references_block = {
            "papers": {"items": [], "count": 0, "status": "failed"},
            "projects": {"items": [], "count": 0, "status": "failed"},
            "articles": {"items": [], "count": 0, "status": "failed"},
            "total": 0,
        }

    analysis_data["references"] = references_block
    logger.info(
        "References attached: %d paper(s), %d project(s), %d article(s)",
        references_block["papers"]["count"],
        references_block["projects"]["count"],
        references_block["articles"]["count"],
    )

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
        is_fallback=bool(analysis_data.get("is_fallback")),
        input_hash=input_hash,
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
    # Genuine analyses sort ahead of fallback ones so a degraded run can never
    # hide a real score that was produced earlier.
    analysis = db.query(InnovationAnalysis).filter(
        InnovationAnalysis.project_id == project_id
    ).order_by(
        InnovationAnalysis.is_fallback.asc(),
        InnovationAnalysis.created_at.desc()
    ).first()

    if not analysis:
        raise HTTPException(status_code=404, detail="No innovation analysis found for this project.")
    return analysis
