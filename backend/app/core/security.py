"""Security primitives: password hashing + JWT.

Design decisions
----------------
- Password hashing uses **bcrypt directly** (not passlib, which is unmaintained and
  logs a compatibility warning with modern bcrypt). bcrypt is a deliberately slow,
  salted hash designed for credentials; it is the OWASP-recommended default.
- JWT signing uses **PyJWT** with the HMAC-SHA256 algorithm and an expiration claim.
- Auth strategy (approved architecture): the access token is delivered in an
  **HttpOnly cookie** by the auth endpoints (Phase 2), never to JavaScript. These
  helpers only produce/verify tokens; cookie mechanics live in the auth service so this
  module stays dependency-free and unit-testable.
- A ``TokenPayload`` dataclass keeps the claims contract explicit instead of passing
  around raw dicts.

Security notes
--------------
- ``verify_password`` always returns a boolean (no error leaks, no user-enumeration
  oracle - bcrypt's comparison is constant-time).
- The secret key comes from configuration which has no default (see ``core/config.py``).
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

from app.core.config import settings


class InvalidTokenError(Exception):
    """Raised when a JWT is malformed, expired, or otherwise unusable."""


@dataclass(frozen=True)
class TokenPayload:
    """The canonical claims carried by an access token."""

    user_id: int
    role: str
    token_type: str = "access"
    issued_at: datetime | None = None
    expires_at: datetime | None = None


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), hashed_password.encode("utf-8")
        )
    except ValueError:
        return False


def create_access_token(user_id: int, role: str) -> str:
    now = datetime.now(UTC)
    expires = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "role": role,
        "token_type": "access",
        "iat": now,
        "exp": expires,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: int, role: str) -> str:
    now = datetime.now(UTC)
    expires = now + timedelta(days=settings.refresh_token_expire_days)
    payload = {
        "sub": str(user_id),
        "role": role,
        "token_type": "refresh",
        "iat": now,
        "exp": expires,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> TokenPayload:
    """Validate and decode a JWT, returning the canonical payload.

    Raises ``InvalidTokenError`` on any failure so callers can map it to a 401.
    """
    try:
        claims = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except jwt.PyJWTError as exc:
        raise InvalidTokenError("Invalid or expired token.") from exc

    return TokenPayload(
        user_id=int(claims["sub"]),
        role=str(claims.get("role", "student")),
        token_type=str(claims.get("token_type", "access")),
        issued_at=datetime.fromtimestamp(claims["iat"], tz=UTC),
        expires_at=datetime.fromtimestamp(claims["exp"], tz=UTC),
    )
