# Local Setup

## Prerequisites
- Node.js 24+ installed
- npm 11+ installed
- Cloudflare account
- Wrangler CLI (installed via project dependencies)

## Steps
1. Open terminal in `jamii-flow`.
2. Install dependencies:
   - `npm install`
3. Start local development:
   - `npm run dev`
4. Open:
   - Frontend: `http://localhost:5173`
   - API health: `http://localhost:5173/api/health`

## Core Dependencies (Phase 2)
- `react-router-dom`
- `@tanstack/react-query`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `hono`

## Database (Phase 3)
- Apply local D1 migrations:
  - `npm run db:migrate:local`
- Optional local seed command:
  - `npm run db:seed:local`

## Auth Test Account (Phase 4)
- Run local seed:
  - `npm run db:seed:local`
- Login credentials:
  - Email: `admin@jamiiflow.app`
  - Password: `Password123!`

## Verification
- Frontend page loads successfully.
- API health returns JSON with `status: "ok"`.

## Troubleshooting
- If dependencies fail, remove `node_modules` and run `npm install` again.
- If port is occupied, stop other local Vite servers and retry.
