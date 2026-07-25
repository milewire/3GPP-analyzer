#!/usr/bin/env node
/**
 * scripts/ingest.js
 *
 * Crawls the public 3GPP FTP archive (https://www.3gpp.org/ftp/Specs/archive/),
 * discovers spec folders for the configured series, resolves each spec's latest
 * version, and upserts the results into the local D1 SQLite database used by
 * `wrangler dev` (.wrangler/state/v3/d1). Designed to be safely interruptible:
 * progress is checkpointed to disk and re-runs resume from where they left off.
 *
 * Usage:
 *   node scripts/ingest.js [--series=22,23,36,38] [--db=<path-to-sqlite-file>]
 */

const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const ARCHIVE_URL = "https://www.3gpp.org/ftp/Specs/archive/";
const DEFAULT_SERIES = ["22", "23", "25", "33", "36", "37", "38"];
const RATE_LIMIT_MS = 500;
const CHECKPOINT_PATH = path.join(__dirname, ".ingest-checkpoint.json");

const RELEASE_BY_MAJOR_VERSION = {
  0: "Rel-99", 1: "Rel-99", 2: "Rel-4", 3: "R99", 4: "Rel-4", 5: "Rel-5", 6: "Rel-6",
  7: "Rel-7", 8: "Rel-8", 9: "Rel-9", 10: "Rel-10", 11: "Rel-11", 12: "Rel-12",
  13: "Rel-13", 14: "Rel-14", 15: "Rel-15", 16: "Rel-16", 17: "Rel-17", 18: "Rel-18",
  19: "Rel-19", 20: "Rel-20",
};

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { series: DEFAULT_SERIES, db: null };
  for (const arg of args) {
    if (arg.startsWith("--series=")) {
      opts.series = arg.replace("--series=", "").split(",").map((s) => s.trim());
    } else if (arg.startsWith("--db=")) {
      opts.db = arg.replace("--db=", "");
    }
  }
  return opts;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, "utf-8"));
    } catch {
      return { completedSeries: [], completedSpecs: {} };
    }
  }
  return { completedSeries: [], completedSpecs: {} };
}

function saveCheckpoint(checkpoint) {
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
}

/** Extracts href targets from a plain HTML directory listing. */
function extractLinks(html) {
  const links = [];
  const regex = /href="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  return links;
}

async function fetchDirectory(url) {
  const res = await fetch(url, { headers: { "User-Agent": "3gpp-sniffer-ingest/1.0" } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const html = await res.text();
  return extractLinks(html);
}

/** Derives a dotted spec number ("38.331") from an FTP folder name ("38331/"). */
function specNumberFromFolder(folderName, seriesPrefix) {
  const clean = folderName.replace(/\/$/, "");
  if (!/^\d{4,6}(-\d+)?$/.test(clean)) return null;
  const base = clean.split("-")[0];
  if (!base.startsWith(seriesPrefix)) return null;
  const dotted = `${base.slice(0, 2)}.${base.slice(2)}`;
  return clean.includes("-") ? `${dotted}-${clean.split("-")[1]}` : dotted;
}

/** Parses a version filename fragment like "-h50" or "-17.5.0" into a version string. */
function parseVersionFromFilename(filename) {
  // 3GPP FTP filenames commonly encode version as three base-36-ish digits, e.g.
  // "38331-i50.zip" => major 'i' (18th letter offset) style encoding varies by era;
  // fall back to any dotted numeric version found directly in the name.
  const dotted = filename.match(/(\d{1,2}\.\d{1,2}\.\d{1,2})/);
  if (dotted) return dotted[1];
  return null;
}

function releaseFromVersion(version) {
  if (!version) return "Unknown";
  const major = parseInt(version.split(".")[0], 10);
  return RELEASE_BY_MAJOR_VERSION[major] || `Rel-${major}`;
}

function openDatabase(dbPath) {
  const resolved = dbPath || findLocalD1Database();
  if (!resolved) {
    throw new Error(
      "Could not locate a local D1 SQLite file. Run `npm run db:schema` first, or pass --db=<path>."
    );
  }
  console.log(`Using local D1 database: ${resolved}`);
  return new DatabaseSync(resolved);
}

function findLocalD1Database() {
  const dir = path.join(__dirname, "..", ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sqlite"));
  return files.length ? path.join(dir, files[0]) : null;
}

function upsertSpec(db, spec) {
  const existing = db
    .prepare(`SELECT id FROM specs WHERE spec_id = ? AND release = ?`)
    .get(spec.spec_id, spec.release);

  if (existing) {
    db.prepare(
      `UPDATE specs SET version = ?, last_updated = ?, ftp_url = ?, title = ? WHERE id = ?`
    ).run(spec.version, spec.last_updated, spec.ftp_url, spec.title, existing.id);
  } else {
    db.prepare(
      `INSERT INTO specs
        (spec_number, spec_id, type, series, title, release, version, last_updated, ftp_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`
    ).run(
      spec.spec_number,
      spec.spec_id,
      spec.type,
      spec.series,
      spec.title,
      spec.release,
      spec.version,
      spec.last_updated,
      spec.ftp_url
    );
  }
}

async function ingestSeries(db, series, checkpoint) {
  console.log(`\n=== Series ${series} ===`);
  const seriesUrl = `${ARCHIVE_URL}${series}_series/`;
  const links = await fetchDirectory(seriesUrl);
  await sleep(RATE_LIMIT_MS);

  const specFolders = links
    .map((link) => specNumberFromFolder(link, series))
    .filter((s) => s !== null);

  console.log(`Found ${specFolders.length} candidate spec folders in series ${series}`);

  for (const specNumber of specFolders) {
    const folderKey = `${series}/${specNumber}`;
    if (checkpoint.completedSpecs[folderKey]) {
      continue; // already processed in a previous run
    }

    const rawFolder = specNumber.replace(".", "").replace("-", "-");
    const specUrl = `${seriesUrl}${rawFolder}/`;

    try {
      const files = await fetchDirectory(specUrl);
      await sleep(RATE_LIMIT_MS);

      const docFiles = files.filter((f) => /\.(zip|docx?)$/i.test(f));
      if (docFiles.length === 0) {
        checkpoint.completedSpecs[folderKey] = true;
        continue;
      }

      // Sort lexically descending to approximate "latest version" from the filename.
      docFiles.sort().reverse();
      const latestFile = docFiles[0];
      const version = parseVersionFromFilename(latestFile) || "0.0.0";
      const release = releaseFromVersion(version);
      const type = "TS"; // refined later once title metadata is scraped from the spec status page

      upsertSpec(db, {
        spec_number: `${type} ${specNumber}`,
        spec_id: specNumber,
        type,
        series,
        title: `3GPP ${specNumber} (title pending metadata scrape)`,
        release,
        version,
        last_updated: new Date().toISOString().slice(0, 10),
        ftp_url: specUrl,
      });

      checkpoint.completedSpecs[folderKey] = true;
      saveCheckpoint(checkpoint);
      process.stdout.write(".");
    } catch (err) {
      console.warn(`\nSkipping ${specNumber}: ${err.message}`);
    }
  }

  checkpoint.completedSeries.push(series);
  saveCheckpoint(checkpoint);
  console.log(`\nCompleted series ${series}`);
}

async function main() {
  const opts = parseArgs();
  const db = openDatabase(opts.db);
  const checkpoint = loadCheckpoint();

  console.log(`Ingesting series: ${opts.series.join(", ")}`);
  console.log(`Already completed: ${checkpoint.completedSeries.join(", ") || "none"}`);

  for (const series of opts.series) {
    if (checkpoint.completedSeries.includes(series)) {
      console.log(`Skipping already-completed series ${series}`);
      continue;
    }
    await ingestSeries(db, series, checkpoint);
  }

  console.log("\nIngest complete.");
  db.close();
}

main().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});
