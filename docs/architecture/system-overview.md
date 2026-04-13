# System Overview

JamiiFlow is a Cloudflare-native full-stack web app for welfare group operations.

## Stack
- Frontend: React + TypeScript + Vite
- API: Cloudflare Workers
- API framework target: Hono (Phase 2)
- Database target: Cloudflare D1
- Object storage target: Cloudflare R2

## Architecture Direction
- Feature-based frontend structure
- Modular backend layers:
  - routes
  - controllers
  - services
  - repositories
  - schemas
  - middlewares

## Phase 2 Baseline Implemented
- Frontend routing foundation with React Router
- Global providers with TanStack Query
- Form and validation foundation with React Hook Form + Zod
- Shared module (`shared/`) for reusable constants, schemas, types, and utilities
- Hono API shell with modular routes and centralized error handling

## Phase 4 Auth Foundation
- Session-based authentication using D1 `sessions` table.
- HTTP-only cookie (`jamiiflow_session`) for session token.
- Auth endpoints:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- Frontend protected routing for `/app/*` pages.

## Phase 5 Domain Modules
- Groups module:
  - D1-backed CRUD API shell
  - frontend list + create flow
- Members module:
  - D1-backed list + create + update API shell
  - frontend list + add-member flow by selected group

## Phase 6 Contributions Foundation
- Contribution plans API + frontend create/list workflow.
- Contribution cycles API with due-item generation for active memberships.
- Due items query endpoint and frontend table view.

## Phase 7 Payments and Receipts Foundation
- Payments API with receipt generation hook.
- Payment allocations update due item balances/statuses.
- Receipts query API and frontend receipts listing page.

## Phase 8 Arrears and Operations Foundation
- Arrears query pipeline with overdue auto-marking logic.
- Reminder creation/listing API and reminder center page.
- Notifications and audit log API shell with list/create capabilities.
- Consolidated operations dashboard page for arrears/reminders/notifications/audit logs.
- Added payment webhook logs observability section for M-Pesa callback operations.

## Phase 9 Interactive Dashboard and Reports
- Dashboard now supports interactive filters (group + months).
- Reports API for summary, trend, and group performance.
- Reports page with live filter-driven queries and tabular drilldowns.

## Deployment Model
- Single Worker serving frontend assets and `/api/*` endpoints.
- Progressive enhancement with D1, R2, and cron jobs as phases advance.
