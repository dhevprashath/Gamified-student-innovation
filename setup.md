# InnoQuest — Setup & Run

All commands are PowerShell (Windows). Run them from the repo root
(`C:\Users\Dhev prashath\OneDrive\Desktop\gamified-project`).

## Prerequisites

- Python 3.12+
- Node.js 18+ / npm
- MySQL 8.0 database service (e.g. local MySQL server on port 3306)

## 0. Database (MySQL 8.0)

The backend connects directly to MySQL 8.0. Ensure your local MySQL service is running and configure credentials in `backend\.env`:

```env
DATABASE_URL=mysql+pymysql://root:Dhev%401234@127.0.0.1:3306/innoquest
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Dhev@1234
DB_NAME=innoquest
```

Provision the database if missing using `database\init\001_create_db.sql` or create database `innoquest` directly in MySQL.

## 1. Backend (port 8000)

Make sure to run using the project's virtual environment (where `sqlalchemy`, `fastapi`, and `pymysql` are installed):

```powershell
cd backend
.\.venv\Scripts\python.exe run.py   # start server -> http://localhost:8000/docs
```

*(Alternatively, activate the virtual environment first with `.\.venv\Scripts\activate` before running `python run.py`).*

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

