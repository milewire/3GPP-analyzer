# 3GPP Sniffer

AI-powered 3GPP specification database for RAN and telecom engineers — browse,
search, and understand technical specifications with version tracking, release
timelines, technology guides, glossary terms, and Claude-powered AI summaries
grounded in official Scope excerpts.

**Live site:** [https://3gppsniffer.com](https://3gppsniffer.com)  
**Repo:** [github.com/milewire/3GPP-sniffer](https://github.com/milewire/3GPP-sniffer)

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS (light/dark theme), deployed on Vercel
- **API:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Object storage (optional / planned):** Cloudflare R2
- **AI summaries:** Anthropic Claude API (`claude-sonnet-4-6`), grounded in official Scope text when available

## Catalog Coverage

Live ingest currently covers **Rel-15–Rel-20** across published 3GPP series from the
public FTP archive. AI summaries prefer official Scope excerpts extracted from DOCX
packages; specs without an excerpt show a short catalog-metadata note instead of
invented content.

## Local Development

Requires **Node.js 20.x** (see `.nvmrc` / `package.json` engines). Wrangler is included
as a dev dependency.

```bash
npm install

# 1. Create the local D1 database and load schema + seed data
npm run db:schema
npm run db:seed

# Optional: apply incremental migrations if the DB already exists
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0001_ai_rate_limits.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0002_source_excerpts.sql --yes

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
| `NEXT_PUBLIC_API_URL` | Next.js / Vercel env | Worker API base URL (default `http://localhost:8787`) |
| `NEXT_PUBLIC_SITE_URL` | Next.js / Vercel env | Canonical site URL for SEO, sitemap, Open Graph |

Copy `.dev.vars.example` → `.dev.vars` and set `ANTHROPIC_API_KEY` for local AI summaries.  
Copy `.env.example` → `.env.local` for frontend public env vars.

```bash
# Production Worker secret (never put this in Vercel)
wrangler secret put ANTHROPIC_API_KEY
```

**Vercel (frontend only):**

- `NEXT_PUBLIC_API_URL=https://<your-worker>.workers.dev`
- `NEXT_PUBLIC_SITE_URL=https://3gppsniffer.com`

## Deployment

```bash
# One-time: create the D1 database and update database_id in wrangler.toml
npm run db:create

# Push schema + seed data to the remote database
npm run db:schema:remote
npm run db:seed:remote

# Apply incremental migrations on remote D1
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0001_ai_rate_limits.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0002_source_excerpts.sql --yes

# Deploy the Worker
npm run worker:deploy

# Build / deploy the Next.js app on Vercel
# Set NEXT_PUBLIC_API_URL to the deployed Worker URL
# Set NEXT_PUBLIC_SITE_URL to https://3gppsniffer.com
npm run build
```

## SEO

- Root metadata, Open Graph, and Twitter cards in `app/layout.tsx`
- JSON-LD (`WebSite` + `SoftwareApplication`) sitewide; TechArticle on spec pages
- Canonical URLs via `NEXT_PUBLIC_SITE_URL` (`lib/seo.ts`)
- Spec pages use clean paths: `/spec/{specId}/{release}/` (legacy `?specNumber=` redirects)
- `app/sitemap.ts` — home, listings, technologies, releases, glossary terms, and every versioned spec
- `app/robots.ts` — allows crawl and points to `/sitemap.xml`
- Per-route `metadata` / `generateMetadata` on major pages

## Data Ingestion

`scripts/seed.sql` loads key specifications, releases, technology areas, and glossary
terms so the site works out of the box.

Crawl specs from the public 3GPP FTP archive:

```bash
# Default selected series across Rel-15–Rel-19
npm run ingest

# Discover every published series for a release
node scripts/ingest.js --releases=Rel-15,Rel-16,Rel-17,Rel-18,Rel-19 --all-series
npm run ingest:rel20
```

Progress is checkpointed in `scripts/.ingest-checkpoint.json` (gitignored) and requests
are rate-limited.

After a bulk ingest, refresh taxonomy / stub titles and push SQL to remote D1:

```bash
npm run backfill:metadata
node scripts/upload-sql-chunks.js scripts/backfill-out.sql 100

node scripts/export-local-specs.js --release=Rel-19 --out=scripts/ingest-out.sql
node scripts/upload-sql-chunks.js scripts/ingest-out.sql 60
```

Extract short official Scope excerpts from DOCX archives for source-grounded summaries:

```bash
npm run extract:sources
node scripts/upload-sql-chunks.js scripts/source-excerpts.sql 40
```

### AI endpoint behavior

- Cached summaries: readable via GET or POST
- New grounded generations: require Anthropic key + Scope excerpt; rate-limited
  (3 uncached gens / IP / hour, 100 / day globally)
- Specs without a Scope excerpt: short deterministic metadata note (no Anthropic call)

## Project Structure

| Path | Purpose |
|---|---|
| `app/` | Next.js App Router pages, sitemap, robots |
| `components/` | Shared UI (nav, cards, filters, theme toggle, AI summary) |
| `content/` | Hand-written technology guide content |
| `lib/` | API client, SEO helpers, Anthropic client, coverage labels |
| `migrations/` | Incremental D1 migrations |
| `worker/` | Cloudflare Worker API routes |
| `scripts/` | Seed SQL, FTP ingest, Scope extraction, D1 upload helpers |
| `public/` | Static assets (logo marks) |

## License

Source code is released under the [MIT License](./LICENSE).

The license covers this project's code only. Specification content is the property
of 3GPP and remains subject to 3GPP's own terms of use.

## Disclaimer

Data sourced from the [3GPP FTP server](https://www.3gpp.org/ftp/Specs/archive/).
This is an unofficial community tool, not affiliated with 3GPP or any mobile operator.
