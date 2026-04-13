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

## Deployment Model
- Single Worker serving frontend assets and `/api/*` endpoints.
- Progressive enhancement with D1, R2, and cron jobs as phases advance.
