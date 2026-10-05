"""Guards against the "my project vanished" class of bug.

A relative sqlite path resolves against the process working directory, and
load_dotenv() searches from there too. Starting the server from the repo root
instead of backend/ therefore pointed the app at a different (or a MySQL)
database, and projects saved there were invisible to the normal startup.
"""
import os
import subprocess
import sys

import pytest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_ROOT = os.path.dirname(BACKEND_DIR)


def _database_url_from(cwd):
    out = subprocess.run(
        [sys.executable, "-c",
         "import sys; sys.path.insert(0, %r);"
         "from app.database import DATABASE_URL; print(DATABASE_URL)" % BACKEND_DIR],
        cwd=cwd, capture_output=True, text=True,
    )
    assert out.returncode == 0, out.stderr
    return out.stdout.strip().splitlines()[-1]


@pytest.mark.parametrize("cwd", [BACKEND_DIR, REPO_ROOT])
def test_database_url_is_independent_of_working_directory(cwd):
    url = _database_url_from(cwd)
    assert url.startswith("sqlite:///"), f"expected the local sqlite file, got {url}"


def test_both_working_directories_resolve_to_the_same_file():
    assert _database_url_from(BACKEND_DIR) == _database_url_from(REPO_ROOT)


def test_sqlite_url_points_at_the_backend_directory():
    # The filename varies (conftest redirects to a test database); what matters
    # is that it can never resolve to a different directory.
    url = _database_url_from(BACKEND_DIR)
    resolved = os.path.dirname(os.path.abspath(url[len("sqlite:///"):]))
    assert resolved == BACKEND_DIR


def test_dotenv_is_found_when_running_from_the_repo_root():
    """Otherwise DATABASE_URL is unset and the app silently targets MySQL."""
    url = _database_url_from(REPO_ROOT)
    assert "mysql" not in url
