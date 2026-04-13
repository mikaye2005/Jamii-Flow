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
