# InnoQuest — AI-Powered Gamified Student Innovation Platform

A production-ready SaaS application that guides students from a raw idea to a pitch-ready venture using **AI analysis**, **literature gap research**, **project readiness scoring**, and **gamified incubation milestones**. Built for student innovation showcases, SIH hackathons, and final-year engineering project evaluations.

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
| **Dashboard** | Project Workspace | Project context selector, creation modal, staggered loading sequence |
| **Module 1 — AI Advisor** | Idea Analysis | 7-metric score breakdown, risk assessment, tech stack & MVP recommendations |
| **Module 2 — Research Gap** | Literature Research | 4-step visual flow pipeline, unaddressed gap discovery, research questions |
| **Module 3 — Innovation Journey** | Gamified Roadmap | 7 incubation stages, XP rewards, level progression, 7 innovation badges |
| **Module 4 — Project Readiness** | Pitch Generator | 6-pillar weighted readiness score, 9 pitch deck cards, 2-min pitch script copy |

---

## 🛠️ Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 · Vite 6 · Tailwind CSS v4 · Lucide React · Axios |
| Backend | FastAPI · SQLAlchemy · Pydantic · Alembic |
| Database | MySQL 8.0 |
| AI Pipeline | OpenAI / Gemini API endpoints |

---

## 📁 Repository layout

```
gamified-project/
├── frontend/           React SPA (Vite + Tailwind v4 + Toast Context)
├── backend/            FastAPI service (Python + SQLAlchemy)
├── database/           provisioning scripts + migration notes
├── docs/               architecture & design docs
├── architecture/       diagrams
└── README.md
```

---

## ⚡ Quickstart — Run the project

> All commands are PowerShell (Windows). Run them from the repo root
> (`C:\Users\Dhev prashath\OneDrive\Desktop\gamified-project`).

### 0. Database Setup (MySQL 8.0)

The backend connects directly to MySQL 8.0 configured in `backend\.env`:

```env
DATABASE_URL=mysql+pymysql://root:Dhev%401234@127.0.0.1:3306/innoquest
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

### 3. Build & Test

```powershell
# Frontend production build verification
cd frontend
npm run build                 # Vite build with type verification
```
