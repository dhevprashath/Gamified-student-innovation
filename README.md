# InnoQuest — AI-Powered Gamified Student Innovation Platform

A production-ready SaaS application that guides students from a raw idea to a
hackathon-ready / startup-ready project using **AI agents** (research, patent,
competitor, risk, pitch) and **gamification**. Built for Smart India Hackathon (SIH)
and final-year engineering project evaluation.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) · Tailwind CSS v4 · shadcn/ui · React Router · Axios · TanStack Query · Zustand |
| Backend | FastAPI · SQLAlchemy 2 · Alembic · Pydantic v2 · JWT (HttpOnly cookie) |
| Database | SQLite sample (local dev default) · MySQL 8.0 (production) |
| AI (Phase 6+) | Gemini API · LangGraph · Sentence Transformers · FAISS |
| Deployment | Vercel (frontend) · Render (backend) · MySQL |

## Repository layout

```
gamified-project/
├── frontend/           React SPA (deploy → Vercel)
├── backend/            FastAPI service (deploy → Render)
├── database/           provisioning scripts + migration notes
├── docs/               architecture & design docs
├── architecture/       diagrams
└── README.md
```

## Quickstart — Run the project

> All commands are PowerShell (Windows). Run them from the repo root
> (`C:\Users\Dhev prashath\OneDrive\Desktop\gamified-project`).
> Full walkthrough: see [`setup.md`](setup.md).

### 0. Database (one-time, sample SQLite)

The backend uses a **sample SQLite database** (`backend\innoquest.db`) by default —
no MySQL install or provisioning needed. Create it from the migrations:

```powershell
cd backend
.\.venv\Scripts\activate
alembic upgrade head          # creates backend\innoquest.db if missing
```

### 1. Backend (port 8000)

```powershell
cd backend
.\.venv\Scripts\activate
copy .env.example .env        # once; already created in this workspace
alembic upgrade head          # apply migrations
python run.py                 # start server → http://localhost:8000/docs
```

### 2. Frontend (port 5173)

```powershell
cd frontend
copy .env.example .env        # once; already created in this workspace
npm install                   # once; already installed in this workspace
npm run dev                   # start dev server → http://localhost:5173
```

### 3. Verify it is wired together

- Liveness: `http://localhost:8000/api/v1/health` → `{"success":true,"data":{"status":"ok"}}`
- Readiness (DB): `http://localhost:8000/api/v1/health/ready`
- UI: `http://localhost:5173` shows the **Backend connectivity** card. The badge
  turns `Connected` when both servers are up and the DB is provisioned.

The Vite dev proxy (`vite.config.ts`) forwards `/api/*` to `http://localhost:8000`, so
the HttpOnly cookie auth flow needs no CORS setup during development.

## Test & lint

```powershell
# Backend
cd backend
.\.venv\Scripts\pytest                      # API tests (uses the real app + DB)
.\.venv\Scripts\ruff check app tests alembic

# Frontend
cd frontend
npm run build                               # tsc typecheck + production build
```

## Roadmap (phases)

| Phase | Module | Status |
|---|---|---|
| 1 | Project setup (foundation) | ✅ Done |
| 2 | Authentication | ⬜ |
| 3 | Dashboard | ⬜ |
| 4 | Idea submission | ⬜ |
| 5 | Team & mentor | ⬜ |
| 6 | AI validation | ⬜ |
| 7–10 | Research / Patent / Competitor / Risk agents | ⬜ |
| 11 | AI pitch generator | ⬜ |
| 12 | Gamification | ⬜ |
| 13 | Deployment | ⬜ |

## Architecture

See `docs/architecture.md` for the layered architecture, API contract, auth strategy,
AI pipeline design, and recorded decisions (ADRs).
