import type { Env } from "../types";
import { json, notFound } from "../util";

export async function listTechnologies(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(`SELECT * FROM technologies ORDER BY id ASC`).all();
  return json({ technologies: results });
}

export async function getTechnology(slug: string, env: Env): Promise<Response> {
  const tech = await env.DB.prepare(`SELECT * FROM technologies WHERE slug = ?`)
    .bind(decodeURIComponent(slug))
    .first();
  if (!tech) return notFound("Technology not found");

  const { results: specs } = await env.DB.prepare(
    `SELECT * FROM specs WHERE technology = ? GROUP BY spec_id ORDER BY citation_count DESC LIMIT 20`
  )
    .bind(tech.name)
    .all();

  return json({ technology: tech, specs });
}
