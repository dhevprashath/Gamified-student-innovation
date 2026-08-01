"""Shared FastAPI dependencies.

- ``get_db`` re-exports the session provider from the db layer.
- ``get_current_user`` and role guards are added in Phase 2 (Authentication); they will
  resolve the JWT from the HttpOnly cookie via ``core.security``.
"""

from app.db.session import get_db

__all__ = ["get_db"]
