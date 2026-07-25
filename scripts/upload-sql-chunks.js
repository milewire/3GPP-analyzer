#!/usr/bin/env node
/** Split a SQL file into chunks and upload each to remote D1 via wrangler. */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("path");
const os = require("os");

const file = process.argv[2] || path.join(__dirname, "ingest-out.sql");
const chunkSize = parseInt(process.argv[3] || "80", 10);
const raw = fs.readFileSync(file, "utf-8");
const statements = raw
  .split(/;\s*\n/)
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => (s.endsWith(";") ? s : `${s};`));

console.log(`Uploading ${statements.length} statements in chunks of ${chunkSize}`);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "d1-chunks-"));
let ok = 0;
for (let i = 0; i < statements.length; i += chunkSize) {
  const chunk = statements.slice(i, i + chunkSize);
  const chunkPath = path.join(tmpDir, `chunk-${i}.sql`);
  fs.writeFileSync(chunkPath, chunk.join("\n") + "\n");
  console.log(`\nChunk ${Math.floor(i / chunkSize) + 1}: ${chunk.length} statements`);
  const result = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", "3gpp-sniffer-db", "--remote", `--file=${chunkPath}`, "--yes"],
    { encoding: "utf-8", shell: true }
  );
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    console.error(`Failed at chunk starting index ${i}`);
    process.exit(result.status || 1);
  }
  ok += chunk.length;
  console.log(`OK (${ok}/${statements.length})`);
}

console.log("\nAll chunks uploaded.");
