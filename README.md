# RAN Reference

A 3GPP specification database for RAN engineers — browse, search, and understand 3GPP
technical specifications, with AI-powered summaries, version tracking, and technology guides.

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **API:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Document storage (future):** Cloudflare R2
- **AI summaries:** Anthropic Claude API (`claude-sonnet-4-6`)

## Local Development

Requires Node 18+ and the Wrangler CLI (installed as a dev dependency).

```bash
npm install

# 1. Create the local D1 database and load schema + seed data
npm run db:schema
npm run db:seed

# 2. Start the Worker API (Cloudflare Workers, port 8787)
npm run worker:dev

# 3. In a second terminal, start the Next.js frontend (port 3000)
npm run dev
```

Then visit http://localhost:3000.

The Next.js app reads `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8787`) to reach
the Worker API.

### AI Summaries

AI summary generation requires an Anthropic API key. For local development, copy
`.dev.vars.example` to `.dev.vars` and fill in `ANTHROPIC_API_KEY`; `wrangler dev` will pick
it up automatically. For production, set it as a Worker secret:

```bash
wrangler secret put ANTHROPIC_API_KEY
```

## Deployment

```bash
# One-time: create the D1 database and update the database_id in wrangler.toml
npm run db:create

# Push schema + seed data to the remote database
npm run db:schema:remote
npm run db:seed:remote

# Deploy the Worker
npm run worker:deploy

# Deploy the Next.js app to your host of choice (Vercel, Cloudflare Pages, etc.),
# setting NEXT_PUBLIC_API_URL to your deployed Worker URL.
npm run build
```

## Data Ingestion

`scripts/seed.sql` pre-populates the database with the 50 most-cited key specifications,
all 3GPP releases, technology areas, and 30+ RAN glossary terms, so the site is fully
functional out of the box.

To crawl the full 3GPP FTP archive for additional specifications:

```bash
node scripts/ingest.js --series=22,23,25,33,36,37,38
```

The script writes progress to `scripts/.ingest-checkpoint.json` so it can resume safely if
interrupted, and rate-limits itself to one request per 500ms against the 3GPP FTP server.

## Project Structure

See `app/`, `components/`, `worker/`, `content/`, and `lib/` for the Next.js pages, shared UI
components, Cloudflare Worker API, rich technology-page content, and shared helpers,
respectively.

---

Data sourced from the 3GPP FTP server. This is an unofficial community tool, not affiliated
with 3GPP or Cingular Wireless.
