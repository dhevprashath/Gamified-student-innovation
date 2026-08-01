# InnoQuest — Architecture

Version 1.0 · Approved 2026-08-01

## 1. Overview

InnoQuest is a production-ready SaaS platform that turns a student's raw idea into a
hackathon/startup-ready project using AI agents and gamification. This document records
the approved architecture and the decisions that shape it.

### Goals

- Clean, layered architecture: **Router → Controller → Service → Repository → Database**.
- Independently deployable frontend (Vercel) and backend (Render).
- AI pipeline built on **LangGraph** that is async, resumable, and persisted.
- Gamification driven by **domain events**, not scattered mutation calls.
- A stable versioned API contract (`/api/v1`) with a standardized response envelope.

## 2. High-level diagram

```
React SPA (Vercel)  ──HTTPS + HttpOnly cookie──►  FastAPI (Render)  ──SQLAlchemy──►  MySQL
        │                                            │
        └──── TanStack Query (cache)                 ├── core (config/logging/security/exceptions)
                                                   ├── services (business logic + orchestration)
                                                   ├── repositories (data access)
                                                   └── agents (LangGraph: research, patent,
                                                        competitor, risk, pitch, orchestrator)
```

## 3. Layered backend architecture

| Layer | Location | Responsibility | Depends on |
|---|---|---|---|
| Router | `app/api/v1/routers/*` | HTTP verbs, path/query params, response model | schemas, deps |
| Controller | routers (thin) + `api/deps.py` | Validation, auth guard, envelope | schemas, services |
| Service | `app/services/*` | Business rules, transactions, AI orchestration, domain events | repositories, agents, core |
| Repository | `app/repositories/*` | Data access only; owns SQLAlchemy queries | db, models |
| Model | `app/models/*` | ORM mapping (single source of schema truth) | db.base |
| Core | `app/core/*` | Config, logging, JWT, exceptions, middleware, response contract | — |

Rules enforced by review:
- Controllers never contain business logic.
- Services never import routers/schemas/HTTP; they raise `AppError` subclasses.
- Repositories never commit — the *service* owns the transaction boundary.
- Agents never touch HTTP or the DB directly; they are stateless callables over typed
  dataclasses, orchestrated by `agents/orchestrator`.

## 4. Request → response flow (standard envelope)

Every endpoint responds with the same envelope (see `app/core/response.py`):

```json
{
  "success": true,
  "data": { "...": "payload" },
  "message": "OK",
  "errors": null,
  "meta": { "pagination": "..." },
  "timestamp": "2026-08-01T00:00:00Z"
}
```

- HTTP status code remains authoritative; `success` mirrors 2xx.
- Errors are always a list of `{code, field?, message?}` objects for inline field rendering.
- All exceptions funnel through the global handlers in `app/core/exceptions.py`
  (`AppError`, HTTP, validation, catch-all 500 that logs the traceback server-side only).

## 5. Frontend architecture

Feature-based vertical slices (`src/features/<module>/{api,components,hooks,pages}`):

- **TanStack Query** owns server state (cache, dedup, retries, invalidation).
- **Axios** is a thin transport with a single typed client (`src/api/client.ts`) that:
  - sends `withCredentials: true` for the HttpOnly session cookie,
  - unwraps the standard envelope (`unwrap<T>`),
  - normalizes failures into a typed `ApiError`.
- **Zustand** owns only client/session state (the *decoded* user profile mirror; the
  cookie remains the source of truth).
- **React Router v7** with lazy routes → per-feature code splitting (see `routes/index.tsx`).

### Development proxy

In dev, the browser only talks to Vite (`localhost:5173`). Requests to `/api/*` are
proxied to FastAPI (`vite.config.ts`). Benefits: no CORS during development, and the
backend's HttpOnly cookie is naturally scoped to the dev origin and re-sent on every
proxied call. In production the frontend calls the absolute API origin cross-origin,
which requires `SameSite=None; Secure` cookies + CORS `allow_credentials`.

## 6. Authentication strategy

- **HttpOnly, `SameSite=Lax` cookie** (production: `SameSite=None; Secure`) holds the
  JWT access token. JavaScript never reads the token → XSS cannot exfiltrate it.
- JWT signed with HMAC-SHA256 (PyJWT); refresh token rotation implemented in Phase 2.
- Roles: `student | mentor | admin` (declared in token claims).
- `api/deps.py::get_current_user` (Phase 2) resolves the token → user from the cookie.

## 7. AI agent architecture (Phases 6–11)

```
                        agents/orchestrator (LangGraph StateGraph)
                                       │
   ┌───────────┬─────────────┬──────────┴────────┬─────────────┐
 research    patent      competitor           risk         pitch
(Phase 7)  (Phase 8)     (Phase 9)          (Phase 10)   (Phase 11)
```

- Each agent is a stateless callable: `(AgentContext) -> AgentResult`.
- Orchestrator is a state machine; each node persists its report to MySQL so a user can
  navigate away and resume. Runs are async: create → `agent_run_id` → poll status.
- Gemini is the LLM provider; **sentence-transformers + FAISS** provide semantic search
  (novelty/plagiarism checks against existing ideas). Both are isolated behind service
  interfaces so they are swappable.
- Cost/rate limits: agent runs are queued and throttled (Phase 6+).

## 8. Key decisions (ADR summary)

| # | Decision | Rationale |
|---|---|---|
| 1 | Dockerized MySQL for parity; **local MySQL 8.0 in this workspace** | Docker unavailable on this machine's port; local 8.0 already running. Containerize at Phase 13. |
| 2 | Python 3.12 **64-bit** installed | Only 32-bit 3.12 was present; 32-bit breaks wheel-based packages (greenlet/httptools). |
| 3 | bcrypt used **directly**, not via passlib | passlib is unmaintained and logs warnings with modern bcrypt. |
| 4 | PEP 695 type parameters (py3.12 syntax) | Modern, required by ruff `UP` rules on target py312. |
| 5 | Vite dev proxy instead of raw CORS | Simpler dev, seamless HttpOnly cookie handling; CORS still configured for prod. |
| 6 | `JWT_SECRET` has no default | Pydantic fails at startup on a missing secret instead of shipping weak auth. |
| 7 | Startup DB check fails fast in prod only | Prod must never serve with a dead DB; dev should still boot for setup. |
| 8 | Request IDs on every request | `X-Request-ID` correlated end-to-end with structured request logs. |

## 9. Database

- MySQL 8.0, `utf8mb4/utf8mb4_unicode_ci`.
- Schema versioned with **Alembic**; migrations live in `backend/alembic/versions/`.
- Convention: UUID `id` PKs (string type in app) OR bigint — finalized in Phase 2 with
  the first domain model; `TimestampMixin` (created_at/updated_at) on every table.

## 10. Deployment target (Phase 13)

- Frontend → **Vercel**: build `frontend/`, set `VITE_API_BASE_URL` to the API origin.
- Backend → **Render**: run `uvicorn app.main:app`, inject env vars, run Alembic
  migrations as a pre-deploy job.
- MySQL → managed provider; credentials injected via environment, never committed.
