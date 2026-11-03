import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.module_suggestion import ProjectModule
from app.models.project import Project
from app.schemas.module_suggestion import (
    ModuleSuggestionListResponse,
    ModuleSuggestionRequest,
)
from app.services.ai_service import AIService
from app.services.module_suggestions import save_modules, sample_modules_for

logger = logging.getLogger("innoquest")

router = APIRouter(prefix="/api/modules", tags=["Module Suggestions"])


def _response_for(db: Session, project: Project) -> ModuleSuggestionListResponse:
    mods = (
        db.query(ProjectModule)
        .filter(ProjectModule.project_id == project.id)
        .order_by(ProjectModule.id.asc())
        .all()
    )
    source = "Sample" if any(m.status == "Sample" for m in mods) else "AI"
    return ModuleSuggestionListResponse(project_id=project.id, modules=mods, is_fallback=False, source=source)


def _get_project(project_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("/suggest", response_model=ModuleSuggestionListResponse)
async def generate_module_suggestions(payload: ModuleSuggestionRequest, db: Session = Depends(get_db)):
    """AI-generate module ideas for a project and store them.

    Replaces the seeded sample set (or any previous set) with the fresh,
    project-specific AI result. This is the only AI path and is triggered
    explicitly by the user via 'Regenerate Ideas'."""
    project = _get_project(payload.project_id, db)

    try:
        result = await AIService.suggest_modules(
            title=project.title,
            description=(project.description or "").strip()[:1200],
            domain=(project.domain or "").strip()[:255],
            problem_statement=(project.problem_statement or "").strip()[:1200],
            target_users=(project.target_users or "").strip()[:255],
        )
    except Exception as exc:
        logger.warning("Module suggestion generation failed: %s", exc)
        result = {}

    raw_modules = result.get("modules") if isinstance(result, dict) else None
    if not isinstance(raw_modules, list) or not raw_modules:
        # AI unavailable: fall back to the matching starter sample set,
        # never to an empty list.
        raw_modules = sample_modules_for(
            project.title, project.domain or "", project.description or ""
        )["modules"]

    save_modules(db, project, raw_modules, status="AI Suggested")
    return _response_for(db, project)


@router.get("/{project_id}", response_model=ModuleSuggestionListResponse)
def get_module_suggestions(project_id: int, db: Session = Depends(get_db)):
    """Return stored module ideas for a project - the sample set seeded at
    creation, or the AI set after regeneration. Never triggers an AI call."""
    project = _get_project(project_id, db)
    return _response_for(db, project)
