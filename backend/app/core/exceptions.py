"""Domain exception hierarchy + global exception handling.

Design decisions
----------------
- ``AppError`` is the single base for every expected failure the business logic can
  raise. Each subclass carries a stable machine-readable ``code`` (used by the frontend
  to branch on) and a default ``status_code``.
- Unmapped/unexpected exceptions are caught by a catch-all handler that logs the full
  traceback (server-side only) and returns a generic 500 envelope - never leaking
  internals to the client.
- Handlers are registered via ``register_exception_handlers(app)`` so the app factory
  stays declarative and handlers stay unit-testable.
"""


from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger
from app.core.response import error_response

logger = get_logger("exceptions")


class AppError(Exception):
    """Base class for all expected application errors."""

    status_code: int = 500
    code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred."

    def __init__(self, message: str | None = None, *, code: str | None = None) -> None:
        self.message = message or self.message
        if code:
            self.code = code
        super().__init__(self.message)


class BadRequestError(AppError):
    status_code = 400
    code = "BAD_REQUEST"
    message = "The request is malformed."


class UnauthorizedError(AppError):
    status_code = 401
    code = "UNAUTHORIZED"
    message = "Authentication is required."


class ForbiddenError(AppError):
    status_code = 403
    code = "FORBIDDEN"
    message = "You do not have permission to perform this action."


class NotFoundError(AppError):
    status_code = 404
    code = "NOT_FOUND"
    message = "The requested resource does not exist."


class ConflictError(AppError):
    status_code = 409
    code = "CONFLICT"
    message = "The request conflicts with the current state."


class ValidationFailedError(AppError):
    status_code = 422
    code = "VALIDATION_FAILED"
    message = "The submitted data failed validation."


class RateLimitError(AppError):
    status_code = 429
    code = "RATE_LIMITED"
    message = "Too many requests. Please try again later."


class ServiceUnavailableError(AppError):
    status_code = 503
    code = "SERVICE_UNAVAILABLE"
    message = "The service is temporarily unavailable."


async def _app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=exc.message, errors=[{"code": exc.code}]),
    )


async def _http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    errors = [{"code": f"HTTP_{exc.status_code}"}] if exc.detail else None
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=str(exc.detail), errors=errors),
    )


async def _validation_error_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = [
        {"field": ".".join(str(part) for part in error["loc"]), "message": error["msg"]}
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content=error_response(
            message="Request validation failed.",
            errors=errors,
        ),
    )


async def _unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content=error_response(message="An unexpected error occurred."),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Attach every global exception handler to the application."""
    app.add_exception_handler(AppError, _app_error_handler)
    app.add_exception_handler(StarletteHTTPException, _http_error_handler)
    app.add_exception_handler(RequestValidationError, _validation_error_handler)
    app.add_exception_handler(Exception, _unhandled_error_handler)
