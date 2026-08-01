"""Application configuration loaded from environment variables / .env via Pydantic Settings.

Design decisions
----------------
- A single ``Settings`` object is assembled once and cached with ``@lru_cache`` so the
  whole process shares one immutable snapshot of the configuration.
- Values come from, in order of precedence: real environment variables > ``.env`` file >
  defaults. This is what lets the same codebase run in development, testing, and
  production (Vercel/Render inject real env vars).
- ``extra="ignore"``: the settings object silently ignores unrelated env vars instead of
  crashing, keeping it forward-compatible.
- Complex types (``CORS_ORIGINS``) are declared as ``list[str]``; Pydantic parses them
  from JSON in the environment, which is the standard convention for cloud platforms.

Secrets policy
--------------
- ``JWT_SECRET`` has **no default**: if it is missing, Pydantic raises at startup instead
  of silently shipping with a weak secret. The committed ``.env.example`` documents how
  to generate a strong one.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "testing", "production"]

# backend/ (three parents up from config.py: app/core/config.py -> app -> backend/)
BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Application ---
    app_name: str = "InnoQuest API"
    app_version: str = "1.0.0"
    app_environment: Environment = "development"
    app_debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # --- Database ---
    database_url: str | None = None
    db_host: str = "127.0.0.1"
    db_port: int = 3306
    db_user: str = "innoquest"
    db_password: str = "innoquest"
    db_name: str = "innoquest"

    # --- Security / JWT ---
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30
    password_min_length: int = 8

    # --- Authentication cookie (HttpOnly) ---
    auth_cookie_name: str = "innoquest_session"
    auth_cookie_secure: bool = False
    auth_cookie_samesite: str = "lax"

    # --- CORS ---
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    # --- Logging / rate limiting ---
    log_level: str = "INFO"
    rate_limit_per_minute: int = 120

    @property
    def is_production(self) -> bool:
        return self.app_environment == "production"

    @property
    def is_testing(self) -> bool:
        return self.app_environment == "testing"

    @property
    def sqlalchemy_database_url(self) -> str:
        """Assemble the SQLAlchemy URL from parts, or return the override if provided.

        Relative SQLite paths (``sqlite:///./innoquest.db``) are anchored to the
        backend directory so the sample database always lands at
        ``backend/innoquest.db`` no matter which directory the server is started from.
        """
        url = self.database_url
        if url and url.startswith("sqlite:///"):
            path = url[len("sqlite:///") :]
            if path and path != ":memory:" and not Path(path).is_absolute():
                return "sqlite:///" + (BACKEND_DIR / path).as_posix()
            return url
        if url:
            return url
        return (
            f"mysql+pymysql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
