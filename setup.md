# InnoQuest — Setup & Run

All commands are PowerShell (Windows). Run them from the repo root
(`C:\Users\Dhev prashath\OneDrive\Desktop\gamified-project`).

## Prerequisites

- Python 3.12+
- Node.js 18+ / npm
- No database install required — the default uses a **sample SQLite database**
  stored at `backend\innoquest.db`.

## 0. Database (one-time, sample SQLite)

The backend ships with a SQLite database by default — no MySQL needed. Create or
refresh it from the migrations:

```powershell
cd backend
.\.venv\Scripts\activate
alembic upgrade head          # creates backend\innoquest.db if missing
```

> MySQL 8.0 is still supported: clear `DATABASE_URL` in `backend\.env` and set the
> `DB_*` vars, then provision the database via `database\init\001_create_db.sql`.

## 1. Backend (port 8000)

```powershell
  cd backend
.\.venv\Scripts\activate
copy .env.example .env        # once; already created in this workspace
alembic upgrade head          # apply migrations / (re)create sample SQLite db
python run.py                 # start server -> http://localhost:8000/docs
```

## 2. Frontend (port 5173)

```powershell
cd frontend
copy .env.example .env        # once; already created in this workspace
npm install                   # once; already installed in this workspace
npm run dev                   # start dev server -> http://localhost:5173
```

## 3. Verify it is wired together

- Liveness: `http://localhost:8000/api/v1/health` → `{"success":true,"data":{"status":"ok"}}`
- Readiness (DB): `http://localhost:8000/api/v1/health/ready`
- UI: `http://localhost:5173` shows the **Backend connectivity** card. The badge
  turns `Connected` when both servers are up and the database is ready.

The Vite dev proxy (`vite.config.ts`) forwards `/api/*` to `http://localhost:8000`, so
the HttpOnly cookie auth flow needs no CORS setup during development.

## 4. Playwright End-to-End (E2E) Browser Testing

Make sure both backend (`http://localhost:8000`) and frontend (`http://localhost:5173`) servers are up and running before executing E2E tests:

```powershell
cd frontend

# Install Playwright browser binaries (one-time setup)
npx playwright install chromium

# Run Playwright E2E tests headlessly
npm run test:e2e

# Run Playwright E2E tests in a visible browser (headed mode)
npm run test:e2e:headed

# Debug Playwright E2E tests using Playwright Inspector
npm run test:e2e:debug

# View HTML Test Report
npx playwright show-report
```

