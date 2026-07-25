#!/usr/bin/env node
/** Export specs from local D1 sqlite into SQL for remote wrangler import. */
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const releaseFilter = process.argv.find((a) => a.startsWith("--release="))?.split("=")[1];
const out =
  process.argv.find((a) => a.startsWith("--out="))?.split("=")[1] ||
  path.join(__dirname, "ingest-out.sql");

const dir = path.join(__dirname, "..", ".wrangler", "state", "v3", "d1", "miniflare-D1DatabaseObject");
const dbFile = fs.readdirSync(dir).find((f) => f.endsWith(".sqlite"));
if (!dbFile) throw new Error("No local D1 sqlite found");
const db = new DatabaseSync(path.join(dir, dbFile));

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

const rows = releaseFilter
  ? db.prepare(`SELECT * FROM specs WHERE release = ? ORDER BY series, spec_id`).all(releaseFilter)
  : db.prepare(`SELECT * FROM specs ORDER BY release, series, spec_id`).all();

const lines = [];
if (releaseFilter) {
  lines.push(`DELETE FROM specs WHERE release = ${esc(releaseFilter)};`);
}
for (const s of rows) {
  lines.push(
    `INSERT INTO specs (spec_number, spec_id, type, series, title, technology, category, network_layer, status, release, version, last_updated, ftp_url, ai_summary, ai_summary_generated_at, ai_relevance_score, citation_count, is_key_spec)
     VALUES (${esc(s.spec_number)}, ${esc(s.spec_id)}, ${esc(s.type)}, ${esc(s.series)}, ${esc(s.title)}, ${esc(s.technology)}, ${esc(s.category)}, ${esc(s.network_layer)}, ${esc(s.status)}, ${esc(s.release)}, ${esc(s.version)}, ${esc(s.last_updated)}, ${esc(s.ftp_url)}, ${esc(s.ai_summary)}, ${esc(s.ai_summary_generated_at)}, ${s.ai_relevance_score ?? "NULL"}, ${s.citation_count ?? 0}, ${s.is_key_spec ?? 0});`
  );
}
lines.push(
  `UPDATE releases SET spec_count = (SELECT COUNT(*) FROM specs WHERE specs.release = releases.name);`
);

fs.writeFileSync(out, lines.join("\n") + "\n");
console.log(`Exported ${rows.length} specs to ${out}`);
db.close();
