"""Engine and session factory.

Design decisions
----------------
- ``pool_pre_ping=True`` validates connections before use, which protects against
  MySQL dropping idle connections (common on cloud hosts with aggressive timeouts).
- ``pool_recycle=3600`` proactively recycles connections older than one hour for the
  same reason.
- Connection pool sizing (``pool_size`` / ``max_overflow``) only applies to server
  databases (MySQL/Postgres); SQLite is a local file database whose default pooling
  does not accept those arguments, so they are skipped for ``sqlite://`` URLs.
- ``expire_on_commit=False`` lets serialization of a just-committed ORM object work
  without extra queries - important because we commit in services and then hand the
  object to Pydantic.
- ``get_db`` is the FastAPI dependency used by every route: it guarantees the session
  is closed (and the connection returned to the pool) after each request, even on
  exceptions, via a generator + ``finally``.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

_engine_kwargs: dict = {"pool_pre_ping": True}
if not settings.sqlalchemy_database_url.startswith("sqlite"):
    _engine_kwargs.update(pool_recycle=3600, pool_size=10, max_overflow=20)

engine = create_engine(
    settings.sqlalchemy_database_url,
    echo=settings.app_debug,
    **_engine_kwargs,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
