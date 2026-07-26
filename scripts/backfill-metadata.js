#!/usr/bin/env node
/**
 * Backfill technology/category/layer tags and replace stub "(… baseline)" titles
 * with the best official title already present for the same spec_id.
 *
 * Usage:
 *   node scripts/backfill-metadata.js
 *   node scripts/backfill-metadata.js --sql-out=scripts/backfill-out.sql
 */
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");
const { findLocalD1Database } = require("./lib/local-d1");
const { classifySpec, releaseNumber } = require("./lib/classify-spec");

const sqlOut = process.argv.find((a) => a.startsWith("--sql-out="))?.split("=")[1];
const db = new DatabaseSync(findLocalD1Database());
const lines = [];

function esc(v) {
  if (v === null || v === undefined) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

const rows = db.prepare(`SELECT id, spec_id, series, release, title, technology, category, network_layer FROM specs`).all();

// Best official title per spec_id (prefer non-baseline, higher release).
const bestTitle = new Map();
for (const row of rows) {
  const isStub = /baseline\)?\s*$/i.test(row.title || "") || /\(Rel-\d+[^)]*baseline\)/i.test(row.title || "");
  const prev = bestTitle.get(row.spec_id);
  if (!prev) {
    bestTitle.set(row.spec_id, { title: row.title, stub: isStub, rel: releaseNumber(row.release) });
    continue;
  }
  if (isStub) continue;
  if (prev.stub || releaseNumber(row.release) > prev.rel) {
    bestTitle.set(row.spec_id, { title: row.title, stub: false, rel: releaseNumber(row.release) });
  }
}

let titleFixed = 0;
let tagged = 0;

const update = db.prepare(
  `UPDATE specs SET title = ?, technology = ?, category = ?, network_layer = ? WHERE id = ?`
);

for (const row of rows) {
  let title = row.title;
  const isStub = /baseline\)?\s*$/i.test(title || "") || /\(Rel-\d+[^)]*baseline\)/i.test(title || "");
  const best = bestTitle.get(row.spec_id);
  if (isStub && best && !best.stub && best.title && best.title !== title) {
    title = best.title;
    titleFixed += 1;
  }

  const classified = classifySpec(row);
  const technology = classified?.technology || row.technology || null;
  const category = classified?.category || row.category || null;
  const networkLayer = classified?.network_layer || row.network_layer || null;

  const changed =
    title !== row.title ||
    technology !== row.technology ||
    category !== row.category ||
    networkLayer !== row.network_layer;

  if (!changed) continue;

  if (!row.technology && technology) tagged += 1;

  update.run(title, technology, category, networkLayer, row.id);
  lines.push(
    `UPDATE specs SET title = ${esc(title)}, technology = ${esc(technology)}, category = ${esc(category)}, network_layer = ${esc(networkLayer)} WHERE id = ${row.id};`
  );
}

console.log(`Titles fixed: ${titleFixed}`);
console.log(`Rows newly technology-tagged: ${tagged}`);
console.log(`Total UPDATE statements: ${lines.length}`);

if (sqlOut) {
  // Remote D1 rows may have different ids — update by (spec_id, release) instead.
  const byKey = [];
  for (const row of rows) {
    let title = row.title;
    const isStub = /baseline\)?\s*$/i.test(title || "") || /\(Rel-\d+[^)]*baseline\)/i.test(title || "");
    const best = bestTitle.get(row.spec_id);
    if (isStub && best && !best.stub && best.title) title = best.title;
    const classified = classifySpec(row);
    const technology = classified?.technology || row.technology || null;
    const category = classified?.category || row.category || null;
    const networkLayer = classified?.network_layer || row.network_layer || null;
    byKey.push(
      `UPDATE specs SET title = ${esc(title)}, technology = ${esc(technology)}, category = ${esc(category)}, network_layer = ${esc(networkLayer)} WHERE spec_id = ${esc(row.spec_id)} AND release = ${esc(row.release)};`
    );
  }
  fs.writeFileSync(path.resolve(sqlOut), byKey.join("\n") + "\n");
  console.log(`Wrote ${byKey.length} statements to ${sqlOut}`);
}

db.close();
