# InnoQuest — AI-Powered Gamified Student Innovation Platform

A production-ready SaaS application that guides students from a raw idea to a pitch-ready venture using **AI analysis**, **literature gap research**, **module architecture suggestions**, **project readiness scoring**, and **gamified incubation milestones**. Built for student innovation showcases, SIH hackathons, and final-year engineering project evaluations.

> **Keyless-first design:** every AI module has validated local fallbacks. The platform runs fully without an API key; Gemini upgrades content quality whenever configured, and the UI always honestly labels what is AI-generated vs locally derived.

---

## 🎨 UI Redesign & Visual System

The platform features a **premium human-designed visual language** built for clarity, calm focus, and modern startup aesthetic:

- **Background Canvas**: `#F7F6F2` (Warm Off-White / Editorial Cream)
- **Cards & Modals**: `#FFFFFF` (Pure White with `#E5E3DD` borders)
- **Primary Typography**: `#171717` (Deep Charcoal)
- **Secondary Typography**: `#6B6B65` (Muted Warm Grey)
- **Primary Brand Accent**: `#E58A4E` (Soft Orange Primary Accent & Active Tab Pill)
- **Primary Hover**: `#D4793D` (Button Hover State)
- **Soft Orange Background**: `#F8E8DB` (Soft Tint for Badges, Progress Tracks & Highlights)
- **Borders**: `#E5E3DD` (Warm Grey Card & Divider Borders)

### Key UX & Motion Highlights
- **Page Transitions**: Smooth route entry (`opacity: 0 → 1` + `translateY: 8px → 0` over 250ms).
- **Subconscious Card Hovers**: `-2px` vertical lift, subtle border transition (`#C8C5BD`), and soft shadow elevation over 200ms.
- **Button Micro-Interactions**: `-1px` lift, soft orange hover state, active press (`translateY(0)`), and subtle step loading spinners.
- **Form Focus & Shake Validation**: Focus highlights input borders in `#E58A4E`. Single horizontal shake (`350ms`) on validation errors.
- **Staggered Dashboard Sequence**: Staggered entrance sequence under 500ms total (Header → Quick Cards → Projects Grid).
- **Circular Score Indicators**: Animated SVG circular gauges (`CircularProgress`) transitioning 0 → score over 1000ms.
- **XP Counter Animation**: Smooth number counter (`AnimatedNumber`) for total XP accumulation.
- **Step-by-Step AI States**: Dynamic loading sequences (*"Analyzing your innovation..."* → *"Evaluating feasibility..."* → *"Preparing recommendations..."*).
- **Toast Notifications**: Built-in notification provider (`ToastContext`) supporting Success, Error, Warning, Info, and Achievement (+XP bonus) toasts.
- **Skeleton Loaders**: Layout-matching skeleton loaders for AI Advisor, Research Gap, and Readiness modules.
- **Reduced Motion**: Full compliance with `@media (prefers-reduced-motion: reduce)`.

---

## 🚀 Core Platform Modules

| Module | Feature | Highlights |
|---|---|---|
| **Dashboard** | Project Workspace | Project context selector, creation modal, staggered loading sequence, instant **Module Ideas** section |
| **Module 1 — AI Advisor** | Idea Analysis | 7-metric score breakdown, risk assessment, tech stack & MVP recommendations |
| **Module 1.5 — Module Ideas Generator** | AI Project Architecture *(new)* | Auto-seeded domain-related sample modules per project (IoT / AI-ML / EdTech / generic sets); on-demand Gemini regeneration; each card includes priority, complexity, duration, tech stack, key features & deliverable |
| **Module 2 — Research Gap** | Literature Research | 4-step visual flow pipeline, unaddressed gap discovery, research questions, live papers/GitHub/articles with MiniLM semantic ranking |
| **Module 3 — Innovation Journey** | Gamified Roadmap | 7 incubation stages, XP rewards, level progression, 7 innovation badges; analyzing auto-completes the "Idea" stage |
| **Module 4 — Project Readiness** | Pitch Generator | 6-pillar weighted readiness score, 9 pitch deck cards, 2-min pitch script copy |

---

## 🏗 Architecture

### System Overview

```mermaid
flowchart LR
    subgraph Client["Frontend · React 19 + Vite + Tailwind (Vercel)"]
        V1[Pages · 13 screens] --> C1[api.js typed client]
    end
    subgraph Server["Backend · FastAPI (Render-ready)"]
        R1[Routers · Controller layer] --> S1[Services · Business logic]
        S1 --> M1[Models · SQLAlchemy]
    end
    C1 -- REST /api/* --> R1
    M1 --> DB[(MySQL 8.0)]
    S1 --> AI[Gemini API · optional]
    S1 --> EMB[MiniLM embeddings · local, key-free]
    S1 --> WEB[Online search · papers / GitHub / articles]
```

### Request Flow (MVC)

```
┌────────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  V  pages/*.jsx    │     │  C  routers/*.py │     │  M  services/*.py   │
│  React screens     │ --> │  REST endpoints  │ --> │  AI · embeddings    │
└────────────────────┘     └──────────────────┘     │  module suggestions │
         │  api.js (typed client)                   │  journeys · search  │
         │                                          └─────────┬───────────┘
         │                                                    v
         │                                          ┌──────────────────┐
         │                                          │  M  models/*.py  │
         │                                          │  SQLAlchemy      │
         │                                          └─────────┬────────┘
         v                                                    v
    localStorage / state                                 MySQL 8.0

   (+ schemas/*.py = Pydantic request/response contracts on every boundary)
```

### AI Resilience Chain (per call)

```
Gemini (primary model) ──503/429/404──▶ backup models (xN, exponential backoff)
                       ──▶ domain-matched local fallback (sample set / heuristic scores)
                       ──▶ response always validated & coerced (scores clamped 0-100,
                           risk recomputed from metrics, honest is_fallback flag)
```

### Data Model (10 tables)

```
projects ─┬─ project_modules      (module ideas: category, priority, tech_stack JSON…)
          ├─ innovation_analyses  (7 metrics + semantic_analysis + references, cached by content hash)
          ├─ research_gaps        (literature-gap analyses)
          ├─ journey_stages + journey_progress + badges   (gamified 7-stage incubation)
          ├─ project_readiness    (6-pillar weighted score)
          ├─ pitches              (9-card deck + 2-min script)
          └─ users
```

---

## 🛠️ Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · Vite 6 · Tailwind CSS v4 · Lucide React · Axios |
| Backend | FastAPI · SQLAlchemy · Pydantic · Alembic |
| Database | MySQL 8.0 (JSON columns for AI payloads) |
| AI Pipeline | Gemini API (optional) · local MiniLM `all-MiniLM-L6-v2` · live online search |
| Deploy | Vercel (frontend) · Render via `render.yaml` (backend) |

---

## 🗂 Repository layout — MVC organization

```
gamified-project/
├── backend/                    FastAPI services (Python + SQLAlchemy)
│   └── app/
│       ├── main.py             App factory, lifespan, router registration
│       ├── database.py         DB engine/session/provider wiring
│       ├── models/             MODEL      — SQLAlchemy entities (Project,
│       │                                   ProjectModule, InnovationAnalysis,
│       │                                   ResearchGap, Journey*, Badge,
│       │                                   Readiness, Pitch, User)
│       ├── schemas/            Contracts  — Pydantic request/response DTOs
│       ├── services/           Business logic (AI service, embeddings,
│       │                        module suggestions, journey, readiness,
│       │                        online search, references)
│       └── routers/            CONTROLLER — FastAPI endpoints mapping
│                                   HTTP to service calls
├── frontend/                   React SPA (MODEL-VIEW separation)
│   └── src/
│       ├── services/api.js     Model layer — typed API client + storage
│       ├── pages/              VIEW — one screen per platform module
│       ├── components/         VIEW — reusable UI primitives
│       └── context/            State (toast provider)
├── database/                   Provisioning scripts + migration notes
├── architecture/               Diagrams
├── docs/                       Design docs
├── render.yaml                 Backend deploy spec (Render)
└── vercel.json                 Frontend deploy spec (Vercel)
```

Request flow: `pages (V) → api.js → routers (C) → services → models (M) → MySQL`.

---

## 🔌 API Surface

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/projects` | GET / POST | List (auto-seeds templates) / create (auto-seeds sample modules) |
| `/api/modules/suggest` | POST | On-demand AI module generation (replaces stored set) |
| `/api/modules/{project_id}` | GET | Stored module ideas (instant, no AI call) |
| `/api/innovation/analyze` | POST | 7-metric idea evaluation (content-hash cached) |
| `/api/innovation/{project_id}` | GET | Latest stored analysis |
| `/api/research-gap/analyze` · `/api/research-gap/{id}` | POST / GET | Literature-gap discovery |
| `/api/journey/{project_id}` · `/complete-stage` | GET / POST | Gamified journey progress |
| `/api/readiness/{project_id}` | GET | Readiness score |
| `/api/pitch/generate` · `/api/pitch/{id}` | POST / GET | Pitch deck + script |
| `/health` · `/v1/models` | GET | Liveness / provider-compat probes |

---

## 🔒 Security Notes

- Secrets live only in **`backend/.env`** (git-ignored) — never committed; docs use `YOUR_MYSQL_PASSWORD` placeholders.
- Tracked tree scanned for API keys & passwords before every push.
- `VITE_API_URL` never falls back to localhost in production builds.

---

## ⚡ Quickstart — Run the project

> All commands are PowerShell (Windows). Run them from the repo root.

### 0. Database Setup (MySQL 8.0)

The backend connects directly to MySQL 8.0 configured in `backend\.env`:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@127.0.0.1:3306/innoquest
```

### 1. Backend (port 8000)

```powershell
cd backend
.\.venv\Scripts\activate
python run.py                 # start server → http://localhost:8000/docs
```

### 2. Frontend (port 5173)

```powershell
cd frontend
npm run dev                   # start dev server → http://localhost:5173
```

### 3. AI (Optional)

Works fully without a key (domain-matched sample modules + honest local evaluations). To enable real Gemini:

```env
# backend\.env
AI_API_KEY=your_gemini_key
AI_PROVIDER=gemini-native
AI_MODEL=gemini-3.6-flash
```

### 4. Build & Test

```powershell
cd frontend ; npm run build    # production build
cd backend ; .\.venv\Scripts\python -m pytest tests -q   # 65+ passing tests
```

---

## 🚀 Deployment

| Piece | Target | Config |
|---|---|---|
| Frontend | Vercel | `vercel.json` (Vite build → `frontend/dist`, assets caching, SPA rewrites) |
| Backend | Render | `render.yaml` (uvicorn, `/health` check; set `DATABASE_URL`, `AI_API_KEY` in dashboard) |
| Database | TiDB Cloud / Aiven free MySQL | point `DATABASE_URL` at the hosted instance |
