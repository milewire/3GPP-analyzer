/**
 * Resolve the SQLite file Miniflare uses for the D1 binding.
 *
 * Miniflare names the file after a hash of the database id, so changing
 * `database_id` in wrangler.toml leaves the previous file behind. Both files
 * carry the schema, which makes "just take the first one" silently split reads
 * and writes across two databases. Refuse to guess in that case.
 */
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const STATE_DIR = path.join(
  __dirname,
  "..",
  "..",
  ".wrangler",
  "state",
  "v3",
  "d1",
  "miniflare-D1DatabaseObject"
);

function hasSpecsTable(file) {
  let db;
  try {
    db = new DatabaseSync(file, { readOnly: true });
    return Boolean(
      db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='specs'`).get()
    );
  } catch {
    return false;
  } finally {
    db?.close();
  }
}

function findLocalD1Database({ required = true } = {}) {
  if (!fs.existsSync(STATE_DIR)) {
    if (!required) return null;
    throw new Error(
      "No local D1 state found. Run `npm run db:schema` to create it, or pass --db=<path>."
    );
  }

  const candidates = fs
    .readdirSync(STATE_DIR)
    .filter((f) => f.endsWith(".sqlite"))
    .map((f) => path.join(STATE_DIR, f))
    .filter(hasSpecsTable);

  if (candidates.length === 1) return candidates[0];

  if (candidates.length === 0) {
    if (!required) return null;
    throw new Error(
      "No local D1 database has the `specs` table. Run `npm run db:schema` first, or pass --db=<path>."
    );
  }

  throw new Error(
    `Found ${candidates.length} local D1 databases with a \`specs\` table:\n` +
      candidates.map((f) => `  ${f}`).join("\n") +
      "\nThis happens after `database_id` changes in wrangler.toml. Delete the stale " +
      "file (or pass --db=<path>) so ingest and `wrangler dev` share one database."
  );
}

module.exports = { STATE_DIR, findLocalD1Database };
