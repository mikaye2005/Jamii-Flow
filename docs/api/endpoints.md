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

## Phase 6 Contributions Endpoints
- `GET /api/contributions/plans?groupId=<group_id>`
- `POST /api/contributions/plans`
- `GET /api/contributions/cycles?contributionPlanId=<plan_id>`
- `POST /api/contributions/cycles`
- `GET /api/contributions/due-items?contributionCycleId=<cycle_id>`

Cycle creation auto-generates `member_due_items` for active members in the plan's group.

## Phase 7 Payments and Receipts Endpoints
- `GET /api/payments?groupId=<group_id>`
- `POST /api/payments`
- `POST /api/payments/mpesa/stk-push`
- `POST /api/payments/mpesa/callback` (public webhook)
- `GET /api/receipts?groupId=<group_id>`

Payment creation currently:
- creates a `payments` row
- applies any provided allocations to `member_due_items`
- auto-generates a `receipts` row with a receipt number
- M-Pesa STK initiation endpoint calls Safaricom Daraja API when configured
- Callback endpoint reconciles STK result with payment reference, updates receipt delivery status, writes notification, and writes audit log.

## Phase 8 Operations Endpoints
- `GET /api/operations/arrears?groupId=<group_id>`
- `GET /api/operations/reminders?groupId=<group_id>`
- `POST /api/operations/reminders`
- `GET /api/operations/notifications?userId=<user_id>`
- `POST /api/operations/notifications`
- `GET /api/operations/audit-logs?groupId=<group_id>`
- `POST /api/operations/audit-logs`
- `GET /api/operations/payment-webhooks?limit=<optional_number>`

Arrears query auto-runs overdue status marking for due items before returning results.

## Phase 9 Reports Endpoints
- `GET /api/reports/summary?groupId=<optional_group_id>`
- `GET /api/reports/collection-trend?months=<n>&groupId=<optional_group_id>`
- `GET /api/reports/group-performance?months=<n>`

These endpoints power interactive dashboard and reports filters.
