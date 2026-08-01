"""Aggregates every v1 router under the versioned API prefix.

New feature phases register their routers here (auth, ideas, teams, agents,
gamification) so ``main.py`` never changes.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
