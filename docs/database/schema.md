# Database Schema

Primary database for MVP is Cloudflare D1 (SQLite-compatible).

## Migration Source of Truth
- `worker/db/migrations/0001_initial_schema.sql`

## Implemented Tables
- users
- groups
- group_user_roles
- member_profiles
- group_memberships
- contribution_plans
- contribution_cycles
- member_due_items
- payments
- payment_allocations
- receipts
- reminders
- notifications
- audit_logs
- sessions
- password_reset_tokens

## Relationship Summary
- A `user` can belong to many groups through `group_memberships`.
- A `group` has many `contribution_plans`.
- A `contribution_plan` has many `contribution_cycles`.
- A `member_due_item` links a member (`group_membership`) to a cycle.
- A `payment` can be split across multiple due items via `payment_allocations`.
- Each `payment` has at most one `receipt`.
- `reminders` target specific due items.
- `notifications` are user-targeted messages.
- `audit_logs` capture actor + entity changes.
- `sessions` and `password_reset_tokens` support authentication flows.

## Key Design Choices
- Text primary keys for migration flexibility toward PostgreSQL.
- Explicit status columns with `CHECK` constraints.
- `created_at` and `updated_at` columns on operational tables.
- Unique constraints for critical integrity:
  - `users.email`
  - `groups.code`
  - `group_memberships(group_id, user_id)`
  - `receipts.receipt_number`
- Indexes added for high-frequency lookups:
  - memberships, due items, payments, reminders, notifications, audit logs.

## Local Migration Command
- `npm run db:migrate:local`

## Remote Migration Command
- `npm run db:migrate:remote`

## Verification Command
- `npx wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"`
