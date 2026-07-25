import type { Env, SpecRow } from "../types";
import { json, notFound, normalizeSpecId, RELEASE_SORT_DESC } from "../util";
import { generateSpecSummary } from "../../lib/anthropic";
import { isSummaryStale } from "../../lib/db";

export async function getAiSummary(url: URL, env: Env): Promise<Response> {
  const specId = url.searchParams.get("specId");
  const release = url.searchParams.get("release");

  if (!specId) {
    return json({ error: "specId query param is required" }, { status: 400 });
  }

  const normalized = normalizeSpecId(specId);

  let spec: SpecRow | null;
  if (release) {
    spec = await env.DB.prepare(`SELECT * FROM specs WHERE spec_id = ? AND release = ? LIMIT 1`)
      .bind(normalized, release)
      .first<SpecRow>();
  } else {
    spec = await env.DB.prepare(
      `SELECT * FROM specs WHERE spec_id = ? ORDER BY ${RELEASE_SORT_DESC} LIMIT 1`
    )
      .bind(normalized)
      .first<SpecRow>();
  }

  if (!spec) return notFound("Specification not found");

  const stale = await isSummaryStale(spec.ai_summary_generated_at);

  if (!stale && spec.ai_summary) {
    return json({
      summary: spec.ai_summary,
      generated_at: spec.ai_summary_generated_at,
      relevance_score: spec.ai_relevance_score,
      cached: true,
    });
  }

  if (!env.ANTHROPIC_API_KEY) {
    return json(
      { error: "AI summaries are not configured. Set the ANTHROPIC_API_KEY secret." },
      { status: 503 }
    );
  }

  try {
    const { summary, relevanceScore } = await generateSpecSummary(
      { specId: spec.spec_number, title: spec.title },
      env.ANTHROPIC_API_KEY
    );
    const generatedAt = new Date().toISOString();

    await env.DB.prepare(
      `UPDATE specs SET ai_summary = ?, ai_summary_generated_at = ?, ai_relevance_score = ? WHERE id = ?`
    )
      .bind(summary, generatedAt, relevanceScore, spec.id)
      .run();

    return json({ summary, generated_at: generatedAt, relevance_score: relevanceScore, cached: false });
  } catch (err) {
    return json({ error: `Failed to generate AI summary: ${(err as Error).message}` }, { status: 502 });
  }
}
