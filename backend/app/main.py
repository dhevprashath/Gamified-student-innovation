from contextlib import asynccontextmanager
import json
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import (
    innovation_router,
    journey_router,
    pitch_router,
    projects_router,
    readiness_router,
    research_gap_router,
)
from app.services.embedding_service import EmbeddingService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("innoquest")

from sqlalchemy import bindparam, text

try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    
    # Auto-add embedding column to existing tables if missing
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE innovation_analyses ADD COLUMN embedding JSON NULL"))
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE advisor_submissions ADD COLUMN embedding JSON NULL"))
        except Exception:
            pass
        # is_fallback / input_hash back a per-column cache and ordering, so
        # both are added additively to keep existing databases working.
        try:
            conn.execute(text("ALTER TABLE innovation_analyses ADD COLUMN is_fallback BOOLEAN NOT NULL DEFAULT 0"))
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE innovation_analyses ADD COLUMN input_hash VARCHAR(64) NULL"))
        except Exception:
            pass
        for stmt in (
            "CREATE INDEX IF NOT EXISTS ix_innovation_analyses_is_fallback ON innovation_analyses (is_fallback)",
            "CREATE INDEX IF NOT EXISTS ix_innovation_analyses_input_hash ON innovation_analyses (input_hash)",
        ):
            try:
                conn.execute(text(stmt))
            except Exception:
                pass

        # One-time cleanup: rows written before is_fallback existed were stamped
        # with a single hardcoded score set whenever the AI call failed. Mark
        # them so they stop being served as if they were genuine analyses.
        # Done in Python because the JSON blob formatting is DB-dependent, so a
        # SQL LIKE would be unreliable.
        try:
            legacy_signature = {
                "innovation_score": 84,
                "problem_clarity": 88,
                "technical_feasibility": 82,
                "market_potential": 85,
                "financial_feasibility": 78,
                "ethical_score": 92,
                "privacy_security_score": 86,
            }
            rows = conn.execute(
                text("SELECT id, analysis_data FROM innovation_analyses WHERE is_fallback = 0")
            ).fetchall()
            stale_ids = []
            for row_id, blob in rows:
                if isinstance(blob, (str, bytes)):
                    try:
                        blob = json.loads(blob)
                    except (ValueError, TypeError):
                        continue
                if not isinstance(blob, dict):
                    continue
                if all(blob.get(k) == v for k, v in legacy_signature.items()):
                    stale_ids.append(row_id)
            if stale_ids:
                conn.execute(
                    text("UPDATE innovation_analyses SET is_fallback = 1 WHERE id IN :ids")
                    .bindparams(bindparam("ids", expanding=True)),
                    {"ids": stale_ids},
                )
                logger.warning(
                    "Flagged %d legacy fallback analysis row(s) as is_fallback=1 (ids=%s). "
                    "Re-run analysis to replace them with genuine results.",
                    len(stale_ids), stale_ids,
                )
        except Exception as e:
            logger.warning(f"Legacy fallback backfill skipped: {e}")
except Exception as e:
    logger.error(f"Error initializing database tables: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load MiniLM sentence-transformer model ONCE
    logger.info("Starting up server and initializing MiniLM embedding model...")
    EmbeddingService.load_model()
    yield
    # Shutdown
    logger.info("Shutting down server.")

app = FastAPI(
    title="Gamified Student Innovation Platform API",
    description="Backend REST API for AI Innovation Advisor, Research Gap Finder, Gamified Journey, Project Readiness & Pitch Generator",
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)
app.include_router(innovation_router)
app.include_router(research_gap_router)
app.include_router(journey_router)
app.include_router(readiness_router)
app.include_router(pitch_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Gamified Student Innovation Platform API is running.",
        "endpoints": [
            "/api/projects",
            "/api/innovation/analyze",
            "/api/research-gap/analyze",
            "/api/journey/{project_id}",
            "/api/readiness/{project_id}",
            "/api/pitch/generate"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
