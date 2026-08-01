"""initial baseline

Revision ID: d2b577c8ba27
Revises:
Create Date: 2026-08-01 12:50:23.490186
"""

from collections.abc import Sequence

from alembic import op

revision: str = "d2b577c8ba27"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
