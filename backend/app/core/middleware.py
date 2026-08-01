"""HTTP middleware.

- ``RequestLoggingMiddleware``: logs every request with method, path, status, duration,
  client IP, and a correlation id, and echoes the correlation id in the response header
  ``X-Request-ID`` so frontend errors can be traced to server logs.
"""

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.logging import get_logger

logger = get_logger("middleware")

_EXCLUDED_PATHS = {"/api/v1/health", "/api/v1/health/ready"}


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Structured request logging with correlation ids."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex
        start = time.perf_counter()
        client_ip = request.client.host if request.client else "unknown"

        response = await call_next(request)

        duration_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Request-ID"] = request_id

        if request.url.path not in _EXCLUDED_PATHS:
            logger.info(
                "%s %s -> %s | %s ms | %s | req_id=%s",
                request.method,
                request.url.path,
                response.status_code,
                f"{duration_ms:.1f}",
                client_ip,
                request_id,
            )
        return response
