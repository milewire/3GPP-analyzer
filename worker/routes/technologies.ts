import type { Env } from "../types";
import { json, notFound, RELEASE_SORT_DESC, toPublicSpec } from "../util";

export async function listTechnologies(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT t.*,
            (SELECT COUNT(DISTINCT s.spec_id) FROM specs s WHERE s.technology = t.name) AS spec_count
     FROM technologies t
     ORDER BY t.id ASC`
  ).all();
  return json({ technologies: results });
}

export async function getTechnology(slug: string, env: Env): Promise<Response> {
  const tech = await env.DB.prepare(`SELECT * FROM technologies WHERE slug = ?`)
    .bind(decodeURIComponent(slug))
    .first();
  if (!tech) return notFound("Technology not found");

  const liveCount = await env.DB.prepare(
    `SELECT COUNT(DISTINCT spec_id) as count FROM specs WHERE technology = ?`
  )
    .bind(tech.name)
    .first<{ count: number }>();

  const { results: specs } = await env.DB.prepare(
    `SELECT * FROM (
       SELECT * FROM specs WHERE technology = ? ORDER BY ${RELEASE_SORT_DESC}
     ) GROUP BY spec_id
     ORDER BY citation_count DESC, spec_number ASC LIMIT 50`
  )
    .bind(tech.name)
    .all();

  return json({
    technology: { ...tech, spec_count: liveCount?.count ?? 0 },
    specs: (specs as Record<string, unknown>[]).map(toPublicSpec),
  });
}
