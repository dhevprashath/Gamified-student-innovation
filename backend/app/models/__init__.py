"""ORM models.

Every model lives in this package and is imported here so Alembic's autogenerate
and ``Base.metadata`` see the full schema. Domain models are added per phase
(Auth -> users, Ideas -> ideas, ...).
"""

from app.db.base import Base

__all__ = ["Base"]
