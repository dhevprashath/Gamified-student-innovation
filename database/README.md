# Database

InnoQuest uses **MySQL 8.0**. Schema changes are versioned with Alembic (migrations
live in `backend/alembic/versions/`); this folder holds provisioning scripts and notes.

## Local development setup (this workspace)

A local MySQL 8.0 service is already installed and running on `127.0.0.1:3306`. To
provision the app database and user:

1. Open **MySQL Workbench** and connect as `root`.
2. Open `init/001_create_db.sql` and run the whole script (Ctrl+Shift+Enter).

This creates:
- database `innoquest`
- user `innoquest` (password `innoquest`) with privileges on `innoquest.*`

Credentials are dev defaults that match `backend/.env` and `backend/.env.example`.

> Note: `docker-compose.yml` at the repo root provides an alternative MySQL 8.0
> container for CI / other machines. On this workspace the local service occupies port
> 3306, so local dev uses the local MySQL.

## Migration workflow

```bash
cd backend
.venv\Scripts\activate

# Apply all pending migrations to the dev database
alembic upgrade head

# After adding/changing a model (Phase 2+):
alembic revision --autogenerate -m "describe the change"
alembic upgrade head

# Show current revision
alembic current

# Roll back one step (development only)
alembic downgrade -1
```

Never edit an already-applied migration; always add a new one.

## File layout

```
database/
├── init/               # one-time provisioning scripts (dev only)
│   └── 001_create_db.sql
└── README.md
```
