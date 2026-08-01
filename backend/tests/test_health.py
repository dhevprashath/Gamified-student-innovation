"""Health endpoint tests: liveness, readiness, and the standardized error envelope."""


def test_liveness_returns_standard_envelope(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"] == {"status": "ok"}
    assert body["errors"] is None
    assert "timestamp" in body


def test_readiness_checks_database(client):
    response = client.get("/api/v1/health/ready")
    assert response.status_code == 200
    assert response.json()["data"] == {"status": "ready"}


def test_unknown_route_returns_standard_error_envelope(client):
    response = client.get("/api/v1/does-not-exist")
    assert response.status_code == 404
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None
    assert body["errors"] is not None
    assert "timestamp" in body


def test_request_logging_middleware_sets_request_id(client):
    response = client.get("/api/v1/health")
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) > 0
