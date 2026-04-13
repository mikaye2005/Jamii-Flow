# JamiiFlow

JamiiFlow is a welfare management web application for managing groups, members, contributions, payments, receipts, arrears, reminders, reports, and audit trails.

## Current Status
- Phase 1 initialized.
- Phase 2 foundation initialized.
- Phase 3 schema and local D1 migrations initialized.
- Phase 4 authentication shell initialized.
- Phase 5 groups and members modules initialized.
- Cloudflare React + TypeScript + Vite starter is deployed.
- Worker API health endpoint is available at `/api/health`.

## Tech Stack
- React + TypeScript + Vite
- React Router
- React Hook Form + Zod
- TanStack Query
- Cloudflare Workers
- API framework: Hono
- Planned database: D1
- Planned object storage: R2

## Local Development
1. Install dependencies:
   - `npm install`
2. Run local server:
   - `npm run dev`
3. Verify:
   - App: `http://localhost:5173`
   - API health: `http://localhost:5173/api/health`

## Deploy
- `npm run deploy`

## Documentation
- Setup:
  - `docs/setup/local-setup.md`
  - `docs/setup/cloudflare-setup.md`
  - `docs/setup/github-setup.md`
- Architecture:
  - `docs/architecture/system-overview.md`
  - `docs/architecture/page-map.md`
- Database:
  - `docs/database/schema.md`
- API:
  - `docs/api/endpoints.md`
- Prompts:
  - `docs/prompts/cursor-prompts.md`
