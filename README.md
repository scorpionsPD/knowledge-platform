# Open Enterprise Knowledge Exchange Platform

Monorepo (Next.js + Express) for running internal or cross-company knowledge-exchange sessions. MIT licensed.

## Tech stack
- Frontend: Next.js (React, TypeScript)
- Backend: Node.js + Express (TypeScript)
- DB ready: PostgreSQL / SQLite (via `DATABASE_URL`)
- Auth ready: OAuth/SSO friendly entry points

## Getting started
1. Install dependencies: `npm install`
2. Set env:
   - Copy `backend/.env.example` to `backend/.env` (defaults to SQLite `file:./dev.db`)
   - Copy `frontend/.env.example` to `frontend/.env.local` (API URL)
3. Provision DB & seed demo data:
   - `npm run prisma:push --workspace backend`
   - `npm run prisma:seed --workspace backend`
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
- Env: copy `backend/.env.example` to `.env` and set `PORT`/`DATABASE_URL` (SQLite or Postgres).
- Database: Prisma models for sessions, experts, and invites. Defaults to SQLite; change provider in `prisma/schema.prisma` for Postgres and set `DATABASE_URL`.
- Auth: Passport OAuth2 strategy ready for Auth0/Okta/Entra/etc. Configure `OAUTH_*` vars. For local dev without SSO, set `AUTH_DISABLED=true`.
- Routes:
  - `GET /health`
  - `GET/POST /api/sessions`
  - `GET/PUT /api/sessions/:id`
  - `GET/POST /api/experts`
  - `GET/PUT /api/experts/:id`
  - `GET /api/reports/:sessionId/markdown`
- Auth protected writes: POST/PUT routes require OAuth login (or `AUTH_DISABLED=true`).
- Data: Prisma client with SQLite default; seed data via `npm run prisma:seed --workspace backend`.

## Frontend (Next.js)
- Location: `frontend/`
- App router with a landing page that fetches live sessions from the backend (falls back to demo data).
- `NEXT_PUBLIC_API_URL` controls backend base URL.
- Customize UI in `frontend/src/app/page.tsx` and styles in `frontend/src/app/globals.css`.

## Next steps
- Expand APIs (invites, comments, attachments) and connect frontend forms to create/update endpoints.
- Harden auth (session store, HTTPS cookies, role-based access) and add user persistence.
- Add e2e tests plus CI/CD pipeline for deploy targets (Railway/Vercel/Fly).
