#!/usr/bin/env node
/**
 * scripts/ingest.js
 *
 * Crawls https://www.3gpp.org/ftp/Specs/latest/ (organized by release),
 * scrapes official titles from html-info pages, and upserts into local D1
 * and/or a SQL dump for remote D1 import.
 *
 * Usage:
 *   node scripts/ingest.js [--releases=Rel-19,Rel-18] [--series=36,38]
 *                          [--all-series]
 *                          [--limit=100] [--force]
 *                          [--sql-out=scripts/ingest-out.sql]
 */

const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");
const { findLocalD1Database } = require("./lib/local-d1");
const { classifySpec } = require("./lib/classify-spec");

const LATEST_URL = "https://www.3gpp.org/ftp/Specs/latest/";
const HTML_INFO_URL = "https://www.3gpp.org/ftp/Specs/html-info/";
const DEFAULT_RELEASES = ["Rel-19", "Rel-18", "Rel-17", "Rel-16", "Rel-15"];
const DEFAULT_SERIES = ["22", "23", "24", "29", "33", "36", "37", "38"];
const RATE_LIMIT_MS = 350;
const CHECKPOINT_PATH = path.join(__dirname, ".ingest-checkpoint.json");
const UA = { "User-Agent": "3gpp-analyzer-ingest/1.0" };

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    releases: DEFAULT_RELEASES,
    series: DEFAULT_SERIES,
    db: null,
    sqlOut: null,
    limit: 0,
    force: false,
    allSeries: false,
  };
  for (const arg of args) {
    if (arg.startsWith("--releases=")) {
      opts.releases = arg
        .replace("--releases=", "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--series=")) {
      opts.series = arg
        .replace("--series=", "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--db=")) {
      opts.db = arg.replace("--db=", "");
    } else if (arg.startsWith("--sql-out=")) {
      opts.sqlOut = arg.replace("--sql-out=", "");
    } else if (arg.startsWith("--limit=")) {
      opts.limit = parseInt(arg.replace("--limit=", ""), 10) || 0;
    } else if (arg === "--force") {
      opts.force = true;
    } else if (arg === "--all-series") {
      opts.allSeries = true;
    }
  }
  return opts;
}

async function discoverReleaseSeries(release) {
  const releaseUrl = `${LATEST_URL}${release}/`;
  const links = extractLinks(await fetchText(releaseUrl));
  await sleep(RATE_LIMIT_MS);
  return [...new Set(
    links
      .map((href) => /(?:^|\/)(\d{2})_series\/?$/i.exec(href)?.[1])
      .filter(Boolean)
  )].sort((a, b) => Number(a) - Number(b));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, "utf-8"));
    } catch {
      return { completed: {} };
    }
  }
  return { completed: {} };
}

function saveCheckpoint(checkpoint) {
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
}

function extractLinks(html) {
  const links = [];
  const regex = /href="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(html)) !== null) links.push(match[1]);
  return links;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

/** Decode 3GPP FTP version codes: "17.5.0" or letter form "j60" (j=19). */
function parseVersionCode(code) {
  if (!code) return null;
  if (/^\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(code)) return code;
  if (!/^[0-9a-z]{3}$/i.test(code)) return null;
  const decode = (c) => {
    const ch = c.toLowerCase();
    if (/[0-9]/.test(ch)) return parseInt(ch, 10);
    return 10 + (ch.charCodeAt(0) - 97); // a=10
  };
  return `${decode(code[0])}.${decode(code[1])}.${decode(code[2])}`;
}

/** Parse "38101-1-j60.zip" or "38331-j00.zip" into { specId, version, filename }. */
function parseLatestFilename(href) {
  const filename = href.split("/").pop() || "";
  const match = filename.match(/^(\d{4,5}(?:-\d+)?)[-_]([0-9a-z]{3})\.(zip|docx?)$/i);
  if (!match) return null;
  const compact = match[1];
  const version = parseVersionCode(match[2]);
  if (!version) return null;
  const base = compact.split("-")[0];
  const suffix = compact.includes("-") ? `-${compact.split("-").slice(1).join("-")}` : "";
  const specId = `${base.slice(0, 2)}.${base.slice(2)}${suffix}`;
  return { specId, version, filename, compact };
}

const titleCache = new Map();

async function fetchSpecMetadata(specId) {
  if (titleCache.has(specId)) return titleCache.get(specId);
  const compact = specId.replace(/\./g, "").replace(/-.*/, "");
  // Part specs like 38.101-1 use html-info 38101-1.htm
  const htmlName = specId.includes("-")
    ? `${specId.replace(/\./g, "")}`
    : compact;
  const url = `${HTML_INFO_URL}${htmlName}.htm`;
  try {
    const html = await fetchText(url);
    await sleep(RATE_LIMIT_MS);
    const titleMatch = html.match(/id=["']titleVal["'][^>]*>([^<]+)</i);
    const typeMatch =
      html.match(/id=["']typeVal["'][^>]*>([^<]+)</i) || html.match(/\b(TS|TR)\b/);
    const meta = {
      title: titleMatch ? titleMatch[1].trim() : null,
      type: (typeMatch ? typeMatch[1] || typeMatch[0] : "TS").trim().toUpperCase(),
    };
    if (meta.type !== "TS" && meta.type !== "TR") meta.type = "TS";
    titleCache.set(specId, meta);
    return meta;
  } catch {
    const meta = { title: null, type: "TS" };
    titleCache.set(specId, meta);
    return meta;
  }
}

function openDatabase(dbPath) {
  const resolved = dbPath || findLocalD1Database();
  console.log(`Using local D1 database: ${resolved}`);
  return new DatabaseSync(resolved);
}

function sqlEscape(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function upsertSpec(db, sqlLines, spec) {
  const classified = classifySpec(spec) || {};
  const technology = spec.technology ?? classified.technology ?? null;
  const category = spec.category ?? classified.category ?? null;
  const networkLayer = spec.network_layer ?? classified.network_layer ?? null;

  if (db) {
    const existing = db
      .prepare(`SELECT id FROM specs WHERE spec_id = ? AND release = ?`)
      .get(spec.spec_id, spec.release);

    if (existing) {
      db.prepare(
        `UPDATE specs SET version = ?, last_updated = ?, ftp_url = ?, title = ?, type = ?, spec_number = ?, status = ?, series = ?,
          technology = COALESCE(?, technology), category = COALESCE(?, category), network_layer = COALESCE(?, network_layer)
         WHERE id = ?`
      ).run(
        spec.version,
        spec.last_updated,
        spec.ftp_url,
        spec.title,
        spec.type,
        spec.spec_number,
        spec.status,
        spec.series,
        technology,
        category,
        networkLayer,
        existing.id
      );
    } else {
      db.prepare(
        `INSERT INTO specs
          (spec_number, spec_id, type, series, title, release, version, last_updated, ftp_url, status, technology, category, network_layer)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        spec.spec_number,
        spec.spec_id,
        spec.type,
        spec.series,
        spec.title,
        spec.release,
        spec.version,
        spec.last_updated,
        spec.ftp_url,
        spec.status,
        technology,
        category,
        networkLayer
      );
    }
  }

  if (sqlLines) {
    sqlLines.push(
      `DELETE FROM specs WHERE spec_id = ${sqlEscape(spec.spec_id)} AND release = ${sqlEscape(spec.release)};`
    );
    sqlLines.push(
      `INSERT INTO specs (spec_number, spec_id, type, series, title, release, version, last_updated, ftp_url, status, technology, category, network_layer)
       VALUES (
         ${sqlEscape(spec.spec_number)},
         ${sqlEscape(spec.spec_id)},
         ${sqlEscape(spec.type)},
         ${sqlEscape(spec.series)},
         ${sqlEscape(spec.title)},
         ${sqlEscape(spec.release)},
         ${sqlEscape(spec.version)},
         ${sqlEscape(spec.last_updated)},
         ${sqlEscape(spec.ftp_url)},
         ${sqlEscape(spec.status)},
         ${sqlEscape(technology)},
         ${sqlEscape(category)},
         ${sqlEscape(networkLayer)}
       );`
    );
  }
}

async function ingestReleaseSeries(db, sqlLines, release, series, checkpoint, opts) {
  const seriesUrl = `${LATEST_URL}${release}/${series}_series/`;
  let links;
  try {
    links = extractLinks(await fetchText(seriesUrl));
    await sleep(RATE_LIMIT_MS);
  } catch (err) {
    console.warn(`  skip ${release}/${series}: ${err.message}`);
    return 0;
  }

  const files = links
    .map((href) => {
      const parsed = parseLatestFilename(href);
      if (!parsed) return null;
      return { ...parsed, href, ftpUrl: href.startsWith("http") ? href : `${seriesUrl}${href}` };
    })
    .filter(Boolean);

  console.log(`  ${release}/${series}_series: ${files.length} files`);

  let written = 0;
  for (const file of files) {
    if (opts.limit && written >= opts.limit) break;

    const key = `${release}/${file.specId}`;
    if (!opts.force && checkpoint.completed[key]) continue;

    try {
      const meta = await fetchSpecMetadata(file.specId);
      const type = meta.type || "TS";
      const title = meta.title || `3GPP ${type} ${file.specId}`;

      upsertSpec(db, sqlLines, {
        spec_number: `${type} ${file.specId}`,
        spec_id: file.specId,
        type,
        series,
        title,
        release,
        version: file.version,
        last_updated: new Date().toISOString().slice(0, 10),
        ftp_url: file.ftpUrl,
        status: "Active",
      });

      checkpoint.completed[key] = true;
      saveCheckpoint(checkpoint);
      written += 1;
      process.stdout.write(".");
    } catch (err) {
      console.warn(`\n  Skipping ${file.specId}: ${err.message}`);
    }
  }

  if (written) process.stdout.write("\n");
  return written;
}

async function main() {
  const opts = parseArgs();

  let localDb = null;
  try {
    localDb = openDatabase(opts.db);
  } catch (err) {
    if (!opts.sqlOut) throw err;
    console.warn(`No local DB (${err.message}); writing SQL only.`);
  }

  const sqlLines = opts.sqlOut ? [] : null;
  const checkpoint = opts.force ? { completed: {} } : loadCheckpoint();

  console.log(`Releases: ${opts.releases.join(", ")}`);
  console.log(`Series:   ${opts.allSeries ? "auto-discover all" : opts.series.join(", ")}`);
  if (opts.limit) console.log(`Limit:    ${opts.limit} specs per release/series`);
  if (opts.sqlOut) console.log(`SQL out:  ${opts.sqlOut}`);

  let total = 0;
  for (const release of opts.releases) {
    console.log(`\n=== ${release} ===`);
    const releaseSeries = opts.allSeries
      ? await discoverReleaseSeries(release)
      : opts.series;
    console.log(`Series for ${release}: ${releaseSeries.join(", ") || "none found"}`);
    for (const series of releaseSeries) {
      total += await ingestReleaseSeries(localDb, sqlLines, release, series, checkpoint, opts);
    }
  }

  if (localDb) {
    localDb
      .prepare(
        `UPDATE releases SET spec_count = (
           SELECT COUNT(*) FROM specs WHERE specs.release = releases.name
         )`
      )
      .run();
    localDb.close();
  }

  if (sqlLines) {
    sqlLines.push(
      `UPDATE releases SET spec_count = (SELECT COUNT(*) FROM specs WHERE specs.release = releases.name);`
    );
    const outPath = path.isAbsolute(opts.sqlOut) ? opts.sqlOut : path.join(process.cwd(), opts.sqlOut);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, sqlLines.join("\n") + "\n");
    console.log(`Wrote SQL to ${outPath}`);
  }

  console.log(`\nIngest complete. Specs written this run: ${total}`);
}

main().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});
