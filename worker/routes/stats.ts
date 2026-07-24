import type { Env } from "../types";
import { json } from "../util";

export async function getStats(env: Env): Promise<Response> {
  const specCount = await env.DB.prepare(`SELECT COALESCE(SUM(spec_count), 0) as total FROM releases`).first<{
    total: number;
  }>();
  const glossaryCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM glossary_terms`).first<{
    count: number;
  }>();
  const technologyCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM technologies`).first<{
    count: number;
  }>();

  return json({
    specifications: specCount?.total ?? 0,
    glossaryTerms: glossaryCount?.count ?? 0,
    technologies: technologyCount?.count ?? 0,
  });
}
