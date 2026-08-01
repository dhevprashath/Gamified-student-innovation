"""FastAPI application factory.

Design decisions
----------------
- ``create_app()`` is a factory: tests can build fresh apps with overridden settings,
  and the module-level ``app`` is created once for uvicorn / alembic / test clients.
- ``lifespan`` verifies the database connection at startup and fails fast with a clear
  log message if the database is unreachable (instead of failing on the first request).
- Middleware order matters: CORS is registered last so it sits outermost and handles
  preflight before request logging.
- Documentation is disabled in production so internal endpoints are not exposed.
- Versioning: everything is mounted under ``settings.api_v1_prefix`` (``/api/v1``),
  guaranteeing a stable contract for the frontend and for breaking-change isolation in
  the future (a ``v2`` router can be added without touching v1 consumers).
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.core.middleware import RequestLoggingMiddleware
from app.db.session import engine

logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: verify database connectivity. In production we fail fast so a broken
    # backend is never deployed behind a health-checked router; in development we
    # only log a warning so the API still boots before the DB is set up.
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection verified.")
    except Exception as exc:
        if settings.is_production:
            logger.error("Database is unreachable at startup: %s", exc)
            raise
        logger.warning("Database unreachable at startup (development): %s", exc)
    yield
    engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url=None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        lifespan=lifespan,
    )

    # Request logging must wrap everything but CORS must be outermost for preflight.
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,  # required for HttpOnly cookies to be stored
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    return app


app = create_app()
