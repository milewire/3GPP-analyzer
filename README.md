# 3GPP Analyzer

**3GPP Analyzer** ([3gppanalyzer.com](https://3gppanalyzer.com)) is an AI-powered 3GPP
specification database for RAN and telecom engineers — browse, search, and understand
LTE and 5G technical specifications with version tracking, release timelines, technology
guides, glossary terms, and Claude-powered AI summaries grounded in official Scope excerpts.

**Live site:** [https://3gppanalyzer.com](https://3gppanalyzer.com)

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS (light/dark theme), deployed on Vercel
- **API:** Cloudflare Worker (`3gpp-analyzer-worker`)
- **Database:** Cloudflare D1 (SQLite at the edge)
- **Object storage (optional / planned):** Cloudflare R2
- **AI summaries:** Anthropic Claude API (`claude-sonnet-4-6`), grounded in official Scope text when available

> **Note:** Product branding is **3GPP Analyzer** / `3gppanalyzer.com`. Cloudflare D1/R2
> resource *names* still use the legacy `3gpp-sniffer-db` / `3gpp-sniffer-specs` identifiers
> so existing production data stays bound without a rename migration. Account-specific IDs
> and Worker URLs live only in gitignored `wrangler.local.toml` / hosting dashboards.

## Catalog Coverage

Live ingest covers **Rel-15–Rel-20** LTE and 5G series from the public FTP archive.
Discontinued **2G/3G** (GERAN/UTRAN) series are excluded from the catalog and ingest.
Featured technology areas include **5G-Advanced**, **NTN**, **Network Slicing**, **5G NR**,
and LTE evolution tracks.

AI summaries prefer official Scope excerpts extracted from DOCX packages; specs without an
excerpt show a short catalog-metadata note instead of invented content.

## Local Development

Requires **Node.js 20.x** (see `.nvmrc` / `package.json` engines). Wrangler is included
as a dev dependency.

```bash
npm install

# Local Cloudflare config (gitignored) — copy the template and set your D1 database_id
cp wrangler.toml wrangler.local.toml
# Edit wrangler.local.toml: replace <D1_DATABASE_ID> with the id from the Cloudflare dashboard

# 1. Create the local D1 database and load schema + seed data
npm run db:schema
npm run db:seed

# Optional: apply incremental migrations if the DB already exists
# (DB name `3gpp-sniffer-db` is the legacy Cloudflare resource id — see note above)
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0001_ai_rate_limits.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0002_source_excerpts.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0003_catalog_accuracy.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0004_ntn_and_retire_2g3g.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0005_network_slicing.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0006_purge_2g3g.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --local --file=./migrations/0007_technology_icons.sql --yes

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

**Vercel (frontend only) — set these project env vars for Production/Preview:**

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your deployed Worker origin (prefer `https://api.3gppanalyzer.com` once the custom domain is live; otherwise the Worker’s `*.workers.dev` URL from the Cloudflare dashboard) |
| `NEXT_PUBLIC_SITE_URL` | `https://3gppanalyzer.com` |

Do **not** put `ANTHROPIC_API_KEY` in Vercel — that secret stays on the Cloudflare Worker (`wrangler secret put ANTHROPIC_API_KEY`).

### Cloudflare domain setup (`3gppanalyzer.com`)

The Worker is deployed as `3gpp-analyzer-worker`. To serve it on `api.3gppanalyzer.com`:

1. In Cloudflare Dashboard → **Add a site** → enter `3gppanalyzer.com`
2. At your domain registrar, switch nameservers to the Cloudflare NS values shown
3. Wait until the zone status is **Active**
4. In `wrangler.toml`, uncomment the `[[routes]]` block for `api.3gppanalyzer.com`
5. Run `npm run worker:deploy`
6. Point Vercel `NEXT_PUBLIC_API_URL` at `https://api.3gppanalyzer.com`

Until the zone is on Cloudflare, point Vercel at your Worker origin from the Cloudflare dashboard. Do not commit account-specific Worker URLs or resource IDs to this repository.

## Deployment

```bash
# One-time: create the D1 database, then set database_id in a local wrangler override
# (see wrangler.toml comments — do not commit account-specific IDs)
npm run db:create

# Push schema + seed data to the remote database
npm run db:schema:remote
npm run db:seed:remote

# Apply incremental migrations on remote D1 (legacy resource name `3gpp-sniffer-db`)
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0001_ai_rate_limits.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0002_source_excerpts.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0003_catalog_accuracy.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0004_ntn_and_retire_2g3g.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0005_network_slicing.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0006_purge_2g3g.sql --yes
npx wrangler d1 execute 3gpp-sniffer-db --remote --file=./migrations/0007_technology_icons.sql --yes

# Deploy the Cloudflare Worker (3gpp-analyzer-worker)
npm run worker:deploy

# Build / deploy the Next.js app on Vercel (3gppanalyzer.com)
# Set NEXT_PUBLIC_API_URL to your Worker origin (api.3gppanalyzer.com or *.workers.dev)
# Set NEXT_PUBLIC_SITE_URL to https://3gppanalyzer.com
npm run build
```

## SEO

- Canonical host: `https://3gppanalyzer.com`
- Root metadata, Open Graph, and Twitter cards in `app/layout.tsx`
- JSON-LD (`WebSite` + `SoftwareApplication`) sitewide; TechArticle on spec pages
- Canonical URLs via `NEXT_PUBLIC_SITE_URL` (`lib/seo.ts`)
- Spec pages use clean paths: `/spec/{specId}/{release}/` (legacy `?specNumber=` redirects)
- `app/sitemap.ts` — home, listings, featured tech pages (NTN, Network Slicing, 5G-Advanced, …), releases, glossary terms, and every versioned spec
- `app/robots.ts` — allows crawl and points to `https://3gppanalyzer.com/sitemap.xml`
- Per-route `metadata` / `generateMetadata` on major pages

## Data Ingestion

`scripts/seed.sql` loads key specifications, releases, technology areas, and glossary
terms so the site works out of the box.

Crawl specs from the public 3GPP FTP archive:

```bash
# Default selected LTE/5G series across Rel-15–Rel-19
npm run ingest

# Discover published series for a release (GERAN/UTRAN series are skipped)
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

**3GPP Analyzer** data is sourced from the [3GPP FTP server](https://www.3gpp.org/ftp/Specs/archive/).
This is an unofficial community tool, not affiliated with 3GPP or any mobile operator.
