import type { Env } from "../types";
import { json, RELEASE_SORT_DESC } from "../util";

export async function search(url: URL, env: Env): Promise<Response> {
  const q = url.searchParams.get("q");
  if (!q || q.trim().length === 0) {
    return json({ specs: [], terms: [] });
  }
  const like = `%${q}%`;

  const { results: specs } = await env.DB.prepare(
    `SELECT * FROM (
       SELECT * FROM specs
       WHERE spec_number LIKE ? OR title LIKE ? OR technology LIKE ?
       ORDER BY ${RELEASE_SORT_DESC}
     ) GROUP BY spec_id
     ORDER BY citation_count DESC LIMIT 15`
  )
    .bind(like, like, like)
    .all();

  const { results: terms } = await env.DB.prepare(
    `SELECT * FROM glossary_terms WHERE term LIKE ? OR full_name LIKE ? OR definition LIKE ? LIMIT 10`
  )
    .bind(like, like, like)
    .all();

  return json({ specs, terms });
}
