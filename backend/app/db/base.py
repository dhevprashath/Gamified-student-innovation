"""SQLAlchemy declarative base shared by every ORM model.

``TimestampMixin`` standardizes the audit columns every InnoQuest table needs
(``created_at`` / ``updated_at``). Using a mixin (instead of duplicating columns in
each model) keeps migrations consistent and enforces the convention.
"""

from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


class TimestampMixin:
    """Adds ``created_at`` / ``updated_at`` with DB-side defaults and auto-update."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
