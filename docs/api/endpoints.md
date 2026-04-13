# API Endpoints (Phase Placeholder)

All API routes will be served under `/api`.

## Phase 1 Available
- `GET /api/health`

Example response:

```json
{
  "status": "ok",
  "service": "jamii-flow-api",
  "timestamp": "2026-04-13T09:00:00.000Z"
}
```

## Planned Route Modules
- auth
- users
- groups
- members
- contributions
- payments
- receipts
- reminders
- reports
- audit

## Phase 2 API Shell
- `GET /api/health` (implemented via Hono route module)

## Phase 4 Auth Endpoints
- `POST /api/auth/login`
  - validates payload with Zod
  - creates session in `sessions` table
  - sets HTTP-only cookie `jamiiflow_session`
- `GET /api/auth/me`
  - validates session cookie
  - returns authenticated user payload
- `POST /api/auth/logout`
  - revokes current session
  - clears session cookie

## Phase 5 Groups and Members Endpoints
- `GET /api/groups`
- `GET /api/groups/:groupId`
- `POST /api/groups`
- `PATCH /api/groups/:groupId`
- `GET /api/members?groupId=<group_id>`
- `POST /api/members`
- `PATCH /api/members/:membershipId`

All Phase 5 routes are protected with auth middleware (`requireAuth`).
