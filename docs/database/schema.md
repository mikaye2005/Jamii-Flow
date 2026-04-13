# Database Schema (Phase Placeholder)

Primary database for MVP is Cloudflare D1.

## Planned Tables
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

## Design Principles
- UUID-style text IDs
- explicit status columns
- `created_at` and `updated_at` on all major entities
- soft-delete where operationally needed
- foreign keys for referential integrity

Detailed schema and migrations will be added in Phase 3.
