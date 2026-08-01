"""Standardized API response envelope.

Every endpoint returns the same shape so the frontend has one contract to parse:

    {
      "success": true,
      "data": <payload | null>,
      "message": "human readable status message",
      "errors": [ {"field": ..., "message": ...} | {"code": ...} ] | null,
      "meta": { pagination / extra metadata } | null,
      "timestamp": "2026-01-01T00:00:00Z"
    }

Rationale
---------
- ``success`` lets the client branch before even reading ``data``.
- ``errors`` is always a *list* of structured error objects (never a bare string), so
  the UI can render each field error inline.
- ``meta`` is reserved for pagination (``page``, ``per_page``, ``total``), which keeps
  pagination out of the data contract in later phases.
- ``timestamp`` is ISO-8601 UTC for audit and debugging.

Note: a generic response envelope can hide the status code in tooling that only looks
at ``HTTPStatus``, so the HTTP status code is *always* the authoritative status and
``success`` simply mirrors ``2xx``.
"""

from datetime import UTC, datetime
from typing import Any


def _now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def success_response[T](
    *,
    data: T | None = None,
    message: str = "OK",
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build a successful response payload."""
    return {
        "success": True,
        "data": data,
        "message": message,
        "errors": None,
        "meta": meta,
        "timestamp": _now(),
    }


def error_response(
    *,
    message: str = "An error occurred.",
    errors: list[dict[str, Any]] | None = None,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build an error response payload."""
    return {
        "success": False,
        "data": None,
        "message": message,
        "errors": errors,
        "meta": meta,
        "timestamp": _now(),
    }
