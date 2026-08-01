"""Structured logging setup.

Design decisions
----------------
- One root logger named ``innoquest`` that child modules inherit via
  ``logging.getLogger(__name__)``, so log records carry ``module`` / ``function`` /
  ``line`` automatically.
- ``setup_logging`` is idempotent (guarded by an ``already_configured`` flag) so it is
  safe to call from the app factory, tests, and alembic.
- Uvicorn's own access log is silenced to WARNING because request logging is handled by
  ``app.core.middleware.RequestLoggingMiddleware`` (which logs status + duration +
  request id), avoiding duplicate lines.
- In production we keep a single structured-ish text formatter on stdout (works on
  Render without any log shipping config); a JSON formatter can be swapped in later
  without touching call sites.
"""

import logging
import sys
from logging.handlers import RotatingFileHandler

from app.core.config import settings

_LOGGER_NAME = "innoquest"
_configured = False


def _create_formatter() -> logging.Formatter:
    return logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def setup_logging() -> logging.Logger:
    """Configure application logging once per process. Idempotent."""
    global _configured

    if _configured:
        return logging.getLogger(_LOGGER_NAME)

    root_logger = logging.getLogger(_LOGGER_NAME)
    root_logger.setLevel(settings.log_level.upper())

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(_create_formatter())
    root_logger.addHandler(console_handler)

    if settings.app_environment in {"development", "testing"}:
        file_handler = RotatingFileHandler(
            "innoquest.log",
            maxBytes=5_000_000,
            backupCount=3,
            encoding="utf-8",
        )
        file_handler.setFormatter(_create_formatter())
        root_logger.addHandler(file_handler)

    # Duplicate access logging is handled by our middleware; silence uvicorn's.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    _configured = True
    return root_logger


def get_logger(name: str) -> logging.Logger:
    """Convenience accessor: ``get_logger(__name__)``."""
    return logging.getLogger(f"{_LOGGER_NAME}.{name}")
