# Open Enterprise Knowledge Exchange Platform

Monorepo (Next.js + Express) for running internal or cross-company knowledge-exchange sessions. MIT licensed.

## Why this project exists

Enterprise knowledge-sharing often happens informally, with valuable insights
lost after one-off meetings or internal sessions. This project provides a
lightweight, open platform to structure, document, and reuse knowledge-exchange
sessions across teams or organisations — without tying it to recruitment,
consulting, or commercial tooling.

## High-level architecture

[ Next.js Frontend ]
        |
        | REST API
        v
[ Express API ]
        |
        v
[ Prisma ORM ]
        |
        v
[ SQLite / PostgreSQL ]

## Tech stack
- Frontend: Next.js (React, TypeScript)
- Backend: Node.js + Express (TypeScript)
- DB: PostgreSQL via Prisma
- Auth: OAuth/SSO friendly entry points + session store

## Getting started
1. Install dependencies: `npm install`
2. Set env:
   - Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to Postgres.
   - Copy `frontend/.env.example` to `frontend/.env.local` (API URL).
3. Provision Postgres & seed demo data:
   - Apply migration SQL: `psql "$DATABASE_URL" -f backend/prisma/migrations/0001_init/migration.sql`
   - Generate client & seed: `npm run prisma:generate --workspace backend` then `npm run prisma:seed --workspace backend`
4. Start both apps: `npm run dev`
   - Backend API: http://localhost:4000
   - Frontend: http://localhost:3000

## Workspace scripts
- `npm run dev` – run backend + frontend together
- `npm run build` – build backend (`dist/`) and frontend (`.next/`)
- `npm run lint` / `npm run format` – lint or format both packages
- `npm test` – backend API tests (Vitest + Supertest)
- Per-app scripts: `npm run <script> --workspace backend|frontend`

## Backend (Express)
- Location: `backend/`
- Env: copy `backend/.env.example` to `.env` and set `PORT`/`DATABASE_URL` (Postgres).
- Database: Prisma models for sessions, experts, invites. Migration SQL in `backend/prisma/migrations/0001_init/migration.sql`.
- Session store: Postgres-backed `express-session` via `connect-pg-simple`.
- Auth: Passport OAuth2 strategy ready for Auth0/Okta/Entra/etc. Configure `OAUTH_*` vars. For local dev without SSO, set `AUTH_DISABLED=true`.
- Routes:
  - `GET /health`
  - `GET/POST /api/sessions` (POST requires `admin` or `editor`)
  - `GET/PUT /api/sessions/:id` (PUT requires `admin` or `editor`)
  - `GET/POST /api/experts` (POST requires `admin` or `editor`)
  - `GET/PUT /api/experts/:id` (PUT requires `admin` or `editor`)
  - `GET /api/reports/:sessionId/markdown`
- Auth protected writes: POST/PUT routes require OAuth login (or `AUTH_DISABLED=true`) plus role checks.
- Data: Prisma Postgres models; seed via `npm run prisma:seed --workspace backend`.

  ## Frontend (Next.js)
- Location: `frontend/`
- App router with a landing page that fetches live sessions from the backend (falls back to demo data).
- Management page at `/manage` posts authenticated create/update requests (`credentials: 'include'`).
- `NEXT_PUBLIC_API_URL` controls backend base URL.
- Customize UI in `frontend/src/app/page.tsx`, `frontend/src/app/manage/page.tsx`, and styles in `frontend/src/app/globals.css`.
  

  ## Roadmap

- Persist users/roles to DB and admin UI
- Session invites, participant feedback, and reminders
- Exportable knowledge summaries (Markdown / PDF)
- Optional MDM / enterprise SSO integrations

  # Contributing

This project welcomes community feedback, issues, and pull requests.
Please open an issue to discuss changes before submitting large PRs.
