"""Health endpoints for liveness / readiness probes.

- ``GET /api/v1/health``      -> liveness: the process is up (no dependencies touched).
- ``GET /api/v1/health/ready``-> readiness: process can serve traffic (DB reachable).

Readiness is what Render uses to route traffic only to healthy instances. It returns
503 (via the global handler) when the database is unreachable so the platform stops
sending traffic instead of failing every request.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.response import success_response

router = APIRouter()


@router.get("", summary="Liveness probe")
async def liveness() -> dict:
    return success_response(data={"status": "ok"}, message="InnoQuest API is running")


@router.get("/ready", summary="Readiness probe (checks database)")
async def readiness(db: Session = Depends(get_db)) -> dict:
    db.execute(text("SELECT 1"))
    return success_response(data={"status": "ready"}, message="Service is ready")
