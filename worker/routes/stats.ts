import type { Env } from "../types";
import { json } from "../util";

export async function getStats(env: Env): Promise<Response> {
  const specCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM specs`).first<{ count: number }>();
  const glossaryCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM glossary_terms`).first<{
    count: number;
  }>();
  const technologyCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM technologies`).first<{
    count: number;
  }>();

  return json({
    specifications: specCount?.count ?? 0,
    glossaryTerms: glossaryCount?.count ?? 0,
    technologies: technologyCount?.count ?? 0,
  });
}
