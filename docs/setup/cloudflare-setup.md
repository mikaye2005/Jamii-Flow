# Cloudflare Setup

## Account Preparation
1. Sign in to Cloudflare dashboard.
2. Verify account email.
3. Ensure Workers is enabled for your account.

## Authenticate Wrangler
1. In terminal at `jamii-flow`, run:
   - `npx wrangler login`
2. Complete browser authorization flow.

## Current Project Deploy Command
- `npm run deploy`

## Verification
- Successful deploy prints a `workers.dev` URL.
- Visit deployed URL and verify app loads.
- Check API health:
  - `https://<your-worker-subdomain>.workers.dev/api/health`

## Next Phase Cloudflare Resources
- D1 database creation and binding
- R2 bucket creation and binding
- Cron triggers for reminders

## D1 Setup (Click-by-click)
1. Open Cloudflare Dashboard.
2. Select your account.
3. In left menu, go to **Storage & Databases**.
4. Click **D1 SQL Database**.
5. Click **Create database**.
6. Enter name: `jamii-flow-db`.
7. Click **Create**.
8. Open the new database and copy the **Database ID**.
9. Update `wrangler.jsonc` under `d1_databases`:
   - set `binding` to `DB`
   - set `database_name` to `jamii-flow-db`
   - set `database_id` to your copied ID
   - set `preview_database_id` to the same value for now
10. Regenerate types:
   - `npm run cf-typegen`
11. Apply migrations remotely:
   - `npm run db:migrate:remote`

## D1 Local Development
- Apply local migrations:
  - `npm run db:migrate:local`
- Inspect tables:
  - `npx wrangler d1 execute DB --local --command "SELECT name FROM sqlite_master WHERE type='table';"`
