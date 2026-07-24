import type { Env } from "../types";
import { json, notFound } from "../util";

export async function listGlossary(url: URL, env: Env): Promise<Response> {
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");

  const where: string[] = [];
  const args: unknown[] = [];
  if (category && category !== "All") {
    where.push("category = ?");
    args.push(category);
  }
  if (search) {
    where.push("(term LIKE ? OR full_name LIKE ? OR definition LIKE ?)");
    const like = `%${search}%`;
    args.push(like, like, like);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const { results } = await env.DB.prepare(`SELECT * FROM glossary_terms ${whereClause} ORDER BY term ASC`)
    .bind(...args)
    .all();

  return json({ terms: results });
}

export async function getGlossaryTerm(slug: string, env: Env): Promise<Response> {
  const term = await env.DB.prepare(`SELECT * FROM glossary_terms WHERE slug = ?`)
    .bind(decodeURIComponent(slug))
    .first();
  if (!term) return notFound("Glossary term not found");

  const relatedSpecNumbers = String((term as { related_specs?: string }).related_specs || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let relatedSpecs: unknown[] = [];
  if (relatedSpecNumbers.length) {
    const placeholders = relatedSpecNumbers.map(() => "?").join(",");
    const { results } = await env.DB.prepare(
      `SELECT * FROM specs WHERE spec_number IN (${placeholders}) GROUP BY spec_id`
    )
      .bind(...relatedSpecNumbers)
      .all();
    relatedSpecs = results;
  }

  return json({ term, relatedSpecs });
}
