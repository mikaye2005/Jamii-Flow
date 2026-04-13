# Local Setup

## Prerequisites
- Node.js 24+ installed
- npm 11+ installed
- Cloudflare account
- Wrangler CLI (installed via project dependencies)

## Steps
1. Open terminal in `jamii-flow`.
2. Install dependencies:
   - `npm install`
3. Start local development:
   - `npm run dev`
4. Open:
   - Frontend: `http://localhost:5173`
   - API health: `http://localhost:5173/api/health`

## Verification
- Frontend page loads successfully.
- API health returns JSON with `status: "ok"`.

## Troubleshooting
- If dependencies fail, remove `node_modules` and run `npm install` again.
- If port is occupied, stop other local Vite servers and retry.
