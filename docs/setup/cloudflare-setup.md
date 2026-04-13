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

## M-Pesa (Daraja) Configuration
Set public vars in `wrangler.jsonc`:
- `MPESA_BASE_URL` (sandbox default provided)
- `MPESA_SHORTCODE`
- `MPESA_CALLBACK_URL` (must point to `/api/payments/mpesa/callback` on your deployed app)
- `MPESA_CALLBACK_IP_ALLOWLIST` (comma-separated trusted IPs; optional)
- `SUPER_ADMIN_EMAILS` (comma-separated emails that should have platform-wide super admin access)

Set secrets via CLI (do not commit these):
- `wrangler secret put MPESA_CONSUMER_KEY`
- `wrangler secret put MPESA_CONSUMER_SECRET`
- `wrangler secret put MPESA_PASSKEY`
- `wrangler secret put MPESA_CALLBACK_TOKEN`

After updates:
1. `npm run cf-typegen`
2. `npm run dev`
3. Test M-Pesa deposit flow from `/app/payments` using `Mobile Money`.

Callback verification notes:
- Daraja callback should hit: `https://<your-domain>/api/payments/mpesa/callback`
- Callback request should include header `x-callback-token` matching `MPESA_CALLBACK_TOKEN`
- For successful callbacks, JamiiFlow:
  - marks related receipt as `SENT`
  - creates a member notification
  - creates an audit log entry
- Every callback is persisted in `payment_webhook_logs` for traceability.
