/**
 * Numeric release ordering for SQLite / D1.
 * Lexical `ORDER BY release DESC` wrongly ranks Rel-8 above Rel-19.
 */
export const RELEASE_SORT_DESC = `CASE
  WHEN release IN ('R99', 'Rel-99') THEN 99
  WHEN release LIKE 'Rel-%' THEN CAST(REPLACE(release, 'Rel-', '') AS INTEGER)
  ELSE 0
END DESC`;

export const RELEASE_SORT_ASC = `CASE
  WHEN release IN ('R99', 'Rel-99') THEN 99
  WHEN release LIKE 'Rel-%' THEN CAST(REPLACE(release, 'Rel-', '') AS INTEGER)
  ELSE 0
END ASC`;

/** Releases currently populated by live ingest (selected series). */
export const CATALOG_RELEASES = [
  "Rel-15",
  "Rel-16",
  "Rel-17",
  "Rel-18",
  "Rel-19",
  "Rel-20",
] as const;

/** Series currently crawled by the default ingest. */
export const CATALOG_SERIES = ["22", "23", "24", "29", "33", "36", "37", "38"] as const;

export const CATALOG_COVERAGE_LABEL =
  "Catalog covers selected series for Rel-15–Rel-19 and all currently published series for Rel-20.";
