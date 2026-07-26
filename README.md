# 3GPP Sniffer

AI-powered 3GPP specification database for RAN and telecom engineers — browse,
search, and understand technical specifications with version tracking, release
timelines, technology guides, glossary terms, and Claude-powered AI summaries.

**Repo:** [github.com/milewire/3GPP-sniffer](https://github.com/milewire/3GPP-sniffer)

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS (light/dark theme)
- **API:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Object storage (planned):** Cloudflare R2
- **AI summaries:** Anthropic Claude API (`claude-sonnet-4-6`)

## Local Development

Requires Node 18+ (Wrangler is included as a dev dependency).

```bash
npm install

# 1. Create the local D1 database and load schema + seed data
npm run db:schema
npm run db:seed

# 2. Start the Worker API (port 8787)
npm run worker:dev

# 3. In a second terminal, start the Next.js frontend (port 3000)
npm run dev
```

Visit http://localhost:3000.

### Environment

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.dev.vars` (local) / Worker secret (prod) | AI summary generation |
| `NEXT_PUBLIC_API_URL` | Next.js env | Worker API base URL (default `http://localhost:8787`) |
| `NEXT_PUBLIC_SITE_URL` | Next.js env | Canonical site URL for SEO, sitemap, Open Graph |

Copy `.dev.vars.example` → `.dev.vars` and set `ANTHROPIC_API_KEY` for local AI summaries.
Copy `.env.example` → `.env.local` for frontend public env vars when deploying.

```bash
# Production Worker secret
wrangler secret put ANTHROPIC_API_KEY
```

## Deployment

```bash
# One-time: create the D1 database and update database_id in wrangler.toml
npm run db:create

# Push schema + seed data to the remote database
npm run db:schema:remote
npm run db:seed:remote

# Deploy the Worker
npm run worker:deploy

# Build / deploy the Next.js app (Vercel, Cloudflare Pages, etc.)
# Set NEXT_PUBLIC_API_URL to the deployed Worker URL
# Set NEXT_PUBLIC_SITE_URL to your production domain
npm run build
```

## SEO

- Root metadata, Open Graph, and Twitter cards in `app/layout.tsx`
- JSON-LD (`WebSite` + `SoftwareApplication`) on every page
- `app/sitemap.ts` — static routes plus versioned spec, technology, release, and glossary pages
- `app/robots.ts` — allows crawl and points to `/sitemap.xml`
- Per-route `metadata` / `generateMetadata` on major pages

## Data Ingestion

`scripts/seed.sql` loads key specifications, releases, technology areas, and glossary
terms so the site works out of the box.

Crawl additional specs from the public 3GPP FTP archive:

```bash
node scripts/ingest.js --series=22,23,24,29,33,36,37,38
npm run ingest:rel20
```

Use `--all-series` to discover every series currently published for a release. Progress
is checkpointed in `scripts/.ingest-checkpoint.json` (gitignored) and requests are
rate-limited.

After a bulk ingest, tag taxonomy and fix stub titles:

```bash
npm run backfill:metadata
node scripts/upload-sql-chunks.js scripts/backfill-out.sql 100
```

Extract short official Scope excerpts from DOCX archives for source-grounded summaries:

```bash
npm run extract:sources
node scripts/upload-sql-chunks.js scripts/source-excerpts.sql 50
```

The public AI generation endpoint is POST-only, limited to three uncached generations
per client per hour and 100 globally per day, and cached summaries remain readable by GET.

## Project Structure

| Path | Purpose |
|---|---|
| `app/` | Next.js App Router pages, sitemap, robots |
| `components/` | Shared UI (nav, cards, filters, theme toggle) |
| `content/` | Hand-written technology guide content |
| `lib/` | API client, SEO helpers, Anthropic client |
| `worker/` | Cloudflare Worker API routes |
| `scripts/` | Seed SQL + FTP ingest |
| `public/` | Static assets (logo marks) |

## License

Source code is released under the [MIT License](./LICENSE).

The license covers this project's code only. Specification content is the property
of 3GPP and remains subject to 3GPP's own terms of use.

## Disclaimer

Data sourced from the [3GPP FTP server](https://www.3gpp.org/ftp/Specs/archive/).
This is an unofficial community tool, not affiliated with 3GPP or any mobile operator.
