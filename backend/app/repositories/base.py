"""Generic CRUD base repository.

All domain repositories extend this class and add their own query methods. It is
model-typed with ``Generic[ModelT, PKT]`` so subclasses get safe, reusable CRUD
without writing boilerplate.

Why a base repository?
- Removes the 5-6 identical methods that would otherwise be copy-pasted into every
  domain repository (users, ideas, teams, agents, gamification...).
- Centralizes the commit policy: services call ``flush()`` here (not ``commit()``)
  because committing belongs to the *service transaction boundary*, allowing a service
  to do several repository writes then commit once.
"""

from collections.abc import Sequence
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.base import Base


class BaseRepository[ModelT: Base, PKT]:
    """Reusable repository providing standard CRUD over a session."""

    def __init__(self, db: Session, model: type[ModelT]) -> None:
        self._db = db
        self._model = model

    def get(self, id: PKT) -> ModelT | None:
        return self._db.get(self._model, id)

    def get_by(self, **filters: Any) -> ModelT | None:
        stmt = select(self._model).filter_by(**filters).limit(1)
        return self._db.scalars(stmt).first()

    def list(self, *, skip: int = 0, limit: int = 100, **filters: Any) -> Sequence[ModelT]:
        stmt = select(self._model).filter_by(**filters).offset(skip).limit(limit)
        return self._db.scalars(stmt).all()

    def create(self, entity: ModelT) -> ModelT:
        self._db.add(entity)
        self._db.flush()
        self._db.refresh(entity)
        return entity

    def update(self, entity: ModelT, **values: Any) -> ModelT:
        for field, value in values.items():
            setattr(entity, field, value)
        self._db.flush()
        self._db.refresh(entity)
        return entity

    def delete(self, entity: ModelT) -> None:
        self._db.delete(entity)
        self._db.flush()
