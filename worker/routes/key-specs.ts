import type { Env } from "../types";
import { json, toPublicSpec } from "../util";

export async function listKeySpecs(url: URL, env: Env): Promise<Response> {
  const series = url.searchParams.get("series");
  const where = ["is_key_spec = 1"];
  const args: unknown[] = [];
  if (series && series !== "All") {
    where.push("series = ?");
    args.push(series);
  }
  const whereClause = `WHERE ${where.join(" AND ")}`;

  const { results } = await env.DB.prepare(
    `SELECT * FROM specs ${whereClause} ORDER BY citation_count DESC`
  )
    .bind(...args)
    .all();

  return json({ specs: (results as Record<string, unknown>[]).map(toPublicSpec) });
}
