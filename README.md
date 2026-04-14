# JamiiFlow

**JamiiFlow** is a full-stack welfare management web application for Kenyan shilling (**KES**) operations: groups, members, contributions, payments, receipts, arrears, reminders, reports, audit trails, and admin-to-member notifications.

---

## Project documentation (full notes)

The complete end-to-end narrative—architecture, phases, API map, flows, deployment, and roadmap—is in:

- **[Project Success Report (Markdown)](docs/JamiiFlow-Project-Success-Report.md)** — source for edits and version control  
- **[Project Success Report (PDF)](docs/JamiiFlow-Project-Success-Report.pdf)** — printable / shareable handover-style document  

To regenerate the PDF after editing the Markdown:

```bash
pip install fpdf2
python tools/generate_project_report_pdf.py
```

---

## Executive summary

JamiiFlow supports **Super Admin** platform governance, **Group Admin** operations, **Treasurer** payment and receipt workflows, and **Member** self-service (group + facility code + username login, personal portal, notifications). The stack is deployed on **Cloudflare** (Workers + Hono + **D1** + static assets), with session-based auth, group-scoped APIs, and M-Pesa (Daraja) integration groundwork including callback handling and webhook logging.

---

## Roles and main user flows

| Role | What they do |
|------|----------------|
| **Member** | Log in with welfare group, facility code, username, password. Use **My Portal** for KES totals, payments, arrears, trend chart, and admin messages. **Notifications** and **Profile** for account context. |
| **Group Admin** | Groups, members, contributions, operations (reminders, **broadcast notifications** to all members), reports. |
| **Treasurer** | Payments, receipts, deposit/M-Pesa flows as configured. |
| **Super Admin** | Global overview, all groups, webhook logs; elevation via `SUPER_ADMIN_EMAILS` in `wrangler.jsonc`. |

---

## Technology stack

| Layer | Choices |
|-------|---------|
| **Frontend** | React, TypeScript, Vite, React Router, TanStack Query, React Hook Form, Zod |
| **Backend** | Cloudflare Workers, Hono, Cloudflare **D1** (SQLite) |
| **Assets** | Worker-served SPA build |
| **Tooling** | Wrangler CLI, npm scripts, GitHub |

*(R2 object storage remains available for future document/receipt file storage.)*

---

## Repository layout (high level)

- `src/pages` — public and app routes (dashboard, members, payments, member portal, notifications, super admin, etc.)
- `src/features` — API clients and domain logic
- `src/components`, `src/layouts`, `src/styles` — UI, shell, tokens (`tokens.css`, `global.css`)
- `worker/` — routes, controllers, services, repositories, middlewares, migrations, seeds
- `shared/schemas` — Zod schemas shared where applicable
- `docs/` — setup, architecture, API reference, **project success report**

---

## Key API surface (summary)

Full detail: [`docs/api/endpoints.md`](docs/api/endpoints.md).

| Area | Examples |
|------|----------|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/auth/register-groups` |
| **Domains** | Groups, members, contributions, payments, receipts |
| **Operations** | Arrears, reminders, notifications (`/api/operations/notifications/me`, `.../read`, `.../broadcast`), audit, webhook logs |
| **Member portal** | `GET /api/member-portal/overview?groupId=...` |
| **Health** | `GET /api/health` |

---

## Local development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Database (local)**

   ```bash
   npm run db:migrate:local
   npm run db:seed:local
   ```

3. **Run app**

   ```bash
   npm run dev
   ```

4. **Verify**

   - App: [http://localhost:5173](http://localhost:5173)  
   - API: [http://localhost:5173/api/health](http://localhost:5173/api/health)  

**Phone / LAN testing:** e.g. `npm run dev -- --host 0.0.0.0 --port 5180` then open `http://<your-lan-ip>:5180`.

---

## Build, lint, deploy

```bash
npm run build
npm run lint
npm run deploy
```

**Remote D1 (production):**

```bash
npm run db:migrate:remote
```

Remote seed (when needed):

```bash
npx wrangler d1 execute DB --remote --file=worker/db/seeds/001_seed.sql
```

Configure M-Pesa secrets via Wrangler; set public vars (including `SUPER_ADMIN_EMAILS`) in `wrangler.jsonc`. Step-by-step: [`docs/setup/cloudflare-setup.md`](docs/setup/cloudflare-setup.md).

---

## Delivery phases (historical)

1. **Foundation** — scaffold, routes, docs, scripts  
2. **Core domains** — groups, members, contributions, payments, receipts  
3. **Operations & reporting** — arrears, reminders, notifications, dashboards  
4. **Multi-tenant RBAC** — memberships, middleware, role-filtered nav, signup with group selection  
5. **UI revamp** — design tokens, responsive layout, mobile bottom nav  
6. **Role completion** — member portal, notification center, broadcasts, super admin page  
7. **Production** — remote migrations, secrets, Cloudflare deploy validation  

---

## Demo credentials (seed)

After seeding, a typical demo admin user (see seed SQL for exact data):

- **Email:** `admin@jamiiflow.app`  
- **Password:** `Password123!`  

Members use **group + facility code + username + password** on `/login` as provisioned by the group admin.

---

## Quality and testing (summary)

- Zod on API payloads; TypeScript across the stack  
- `npm run build` and `npm run lint` for regression checks  
- Manual paths: auth, group boundaries, role menus, member portal, notifications, deploy smoke tests  

---

## Roadmap (high level)

- Real-time notifications and richer analytics  
- Member document center (statements / downloads); reporting exports (CSV/PDF)  
- Approval workflows and finer-grained permissions  
- More automated integration/e2e tests  

*(Expanded list: [Project Success Report §13](docs/JamiiFlow-Project-Success-Report.md).)*

---

## Documentation index

| Topic | Path |
|--------|------|
| Local setup | [`docs/setup/local-setup.md`](docs/setup/local-setup.md) |
| Cloudflare | [`docs/setup/cloudflare-setup.md`](docs/setup/cloudflare-setup.md) |
| GitHub | [`docs/setup/github-setup.md`](docs/setup/github-setup.md) |
| Architecture | [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md) |
| Page map | [`docs/architecture/page-map.md`](docs/architecture/page-map.md) |
| Database schema | [`docs/database/schema.md`](docs/database/schema.md) |
| API endpoints | [`docs/api/endpoints.md`](docs/api/endpoints.md) |
| Cursor prompts | [`docs/prompts/cursor-prompts.md`](docs/prompts/cursor-prompts.md) |

---

## License

Add a `LICENSE` file if you intend to open-source or formalize terms for your organization.
