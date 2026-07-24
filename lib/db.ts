export interface D1LikeDatabase {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
}

export async function findSpecByNumber(
  db: D1LikeDatabase,
  specNumber: string,
  release?: string | null
) {
  const normalized = specNumber.replace(/^(TS|TR)\s*/i, "").trim();
  const like = `%${normalized}`;

  if (release) {
    return db
      .prepare(`SELECT * FROM specs WHERE (spec_id = ? OR spec_number LIKE ?) AND release = ? LIMIT 1`)
      .bind(normalized, like, release)
      .first();
  }

  return db
    .prepare(`SELECT * FROM specs WHERE spec_id = ? OR spec_number LIKE ? ORDER BY release DESC LIMIT 1`)
    .bind(normalized, like)
    .first();
}

export async function isSummaryStale(generatedAt: string | null, maxAgeDays = 90): Promise<boolean> {
  if (!generatedAt) return true;
  const generated = new Date(generatedAt).getTime();
  if (Number.isNaN(generated)) return true;
  const ageMs = Date.now() - generated;
  return ageMs > maxAgeDays * 24 * 60 * 60 * 1000;
}
