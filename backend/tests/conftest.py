"""Shared pytest fixtures.

The ``client`` fixture uses FastAPI's ``TestClient`` with the real application, so
tests exercise middleware, exception handlers, CORS, and the startup lifespan. A
SQLite in-memory database for repository/service unit tests is added in Phase 2 when
the first models exist.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client
