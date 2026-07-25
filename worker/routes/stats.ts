import type { Env } from "../types";
import { json } from "../util";

export async function getStats(env: Env): Promise<Response> {
  const unique = await env.DB.prepare(
    `SELECT COUNT(DISTINCT spec_id) as count FROM specs`
  ).first<{ count: number }>();
  const versions = await env.DB.prepare(`SELECT COUNT(*) as count FROM specs`).first<{ count: number }>();
  const glossaryCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM glossary_terms`).first<{
    count: number;
  }>();
  const technologyCount = await env.DB.prepare(`SELECT COUNT(*) as count FROM technologies`).first<{
    count: number;
  }>();
  const releasesCovered = await env.DB.prepare(
    `SELECT COUNT(DISTINCT release) as count FROM specs`
  ).first<{ count: number }>();

  const uniqueCount = unique?.count ?? 0;
  const versionCount = versions?.count ?? 0;

  return json({
    /** Distinct specification documents (unique spec_id). */
    specifications: uniqueCount,
    uniqueSpecifications: uniqueCount,
    /** Rows across releases (same spec_id counted per release). */
    specificationVersions: versionCount,
    glossaryTerms: glossaryCount?.count ?? 0,
    technologies: technologyCount?.count ?? 0,
    releasesCovered: releasesCovered?.count ?? 0,
  });
}
