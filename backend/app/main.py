from contextlib import asynccontextmanager
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

from sqlalchemy import text

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
