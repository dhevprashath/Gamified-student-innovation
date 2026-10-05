import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# backend/ - the directory holding this file.
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# load_dotenv() with no argument searches from the current working directory, so
# running the server from the repo root would miss backend/.env entirely and
# fall through to the MySQL defaults. Pointing it at an explicit path keeps the
# configuration identical no matter where the process is launched from.
load_dotenv(os.path.join(BACKEND_DIR, ".env"))

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Dhev@1234")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "innoquest")

MYSQL_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
DATABASE_URL = os.getenv("DATABASE_URL", MYSQL_DATABASE_URL)

# "sqlite:///./innoquest.db" is resolved against the current working directory,
# not against this file. Launching the server from the repo root instead of
# backend/ silently creates and uses a second, empty database, which looks
# exactly like "the project I just added has vanished". Anchoring the path to
# this file's directory makes the database location independent of where the
# command was run from.
if DATABASE_URL.startswith("sqlite:///"):
    _raw = DATABASE_URL[len("sqlite:///"):]
    if _raw and not _raw.startswith("/") and not _raw.startswith("file:"):
        DATABASE_URL = "sqlite:///" + os.path.join(BACKEND_DIR, _raw)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# SQLite doesn't support pool_size/max_overflow/pool_recycle; MySQL does
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=10,
        max_overflow=20,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
