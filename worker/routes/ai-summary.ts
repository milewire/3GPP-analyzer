import type { Env, SpecRow } from "../types";
import { json, notFound, normalizeSpecId, RELEASE_SORT_DESC } from "../util";
import { generateSpecSummary, metadataOnlySummary } from "../../lib/anthropic";
import { isSummaryStale } from "../../lib/db";

const PER_IP_HOURLY_LIMIT = 3;
const GLOBAL_DAILY_LIMIT = 100;

async function hashIdentifier(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

async function incrementLimit(
  env: Env,
  key: string,
  windowStart: string,
  limit: number
): Promise<{ allowed: boolean; count: number }> {
  await env.DB.prepare(
    `INSERT INTO ai_rate_limits (key, count, window_start)
     VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE
         WHEN ai_rate_limits.window_start < excluded.window_start THEN 1
         ELSE ai_rate_limits.count + 1
       END,
       window_start = CASE
         WHEN ai_rate_limits.window_start < excluded.window_start THEN excluded.window_start
         ELSE ai_rate_limits.window_start
       END`
  )
    .bind(key, windowStart)
    .run();

  const row = await env.DB.prepare(`SELECT count FROM ai_rate_limits WHERE key = ?`)
    .bind(key)
    .first<{ count: number }>();
  const count = row?.count ?? limit + 1;
  return { allowed: count <= limit, count };
}

async function enforceGenerationLimits(request: Request, env: Env): Promise<Response | null> {
  const now = new Date();
  const hourStart = new Date(now);
  hourStart.setUTCMinutes(0, 0, 0);
  const dayStart = new Date(now);
  dayStart.setUTCHours(0, 0, 0, 0);

  const clientIp =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";
  const ipHash = await hashIdentifier(clientIp);

  const perIp = await incrementLimit(
    env,
    `ip:${ipHash}`,
    hourStart.toISOString(),
    PER_IP_HOURLY_LIMIT
  );
  if (!perIp.allowed) {
    return json(
      { error: "AI summary limit reached. Try again after the next hour." },
      { status: 429, headers: { "Retry-After": "3600" } }
    );
  }

  const global = await incrementLimit(
    env,
    "global",
    dayStart.toISOString(),
    GLOBAL_DAILY_LIMIT
  );
  if (!global.allowed) {
    return json(
      { error: "Daily AI summary capacity has been reached. Try again tomorrow." },
      { status: 429, headers: { "Retry-After": "86400" } }
    );
  }

  return null;
}

export async function getAiSummary(request: Request, url: URL, env: Env): Promise<Response> {
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

  // Prefer this release's Scope; otherwise reuse the newest excerpt for the same spec.
  let sourceExcerpt = spec.source_excerpt;
  let sourceUrl = spec.ftp_url;
  if (!sourceExcerpt) {
    const sibling = await env.DB.prepare(
      `SELECT source_excerpt, ftp_url, release FROM specs
       WHERE spec_id = ? AND source_excerpt IS NOT NULL
       ORDER BY ${RELEASE_SORT_DESC} LIMIT 1`
    )
      .bind(normalized)
      .first<{ source_excerpt: string; ftp_url: string | null; release: string }>();
    if (sibling?.source_excerpt) {
      sourceExcerpt = sibling.source_excerpt;
      sourceUrl = sibling.ftp_url ?? sourceUrl;
    }
  }

  const stale = await isSummaryStale(spec.ai_summary_generated_at);
  const grounded = Boolean(sourceExcerpt);
  const cachedIsPlaceholder =
    Boolean(spec.ai_summary) && (spec.ai_relevance_score ?? 0) <= 40;
  // Replace metadata-only placeholders once a Scope excerpt becomes available.
  const canServeCache = !stale && Boolean(spec.ai_summary) && !(grounded && cachedIsPlaceholder);

  if (canServeCache) {
    return json({
      summary: spec.ai_summary,
      generated_at: spec.ai_summary_generated_at,
      relevance_score: spec.ai_relevance_score,
      cached: true,
      grounded: !cachedIsPlaceholder && grounded,
    });
  }

  // The current frontend uses POST. GET remains temporarily compatible with
  // older deployed clients, but it passes through the same strict generation
  // limits below. Other methods can never trigger a paid request.
  if (request.method !== "POST" && request.method !== "GET") {
    return json(
      { error: "Method not allowed." },
      { status: 405, headers: { Allow: "GET, POST, OPTIONS" } }
    );
  }

  const summaryInput = {
    specId: spec.spec_number,
    title: spec.title,
    release: spec.release,
    type: spec.type,
    technology: spec.technology,
    sourceUrl,
    sourceExcerpt,
  };

  // No Anthropic call for ungrounded specs — deterministic text only.
  if (!grounded) {
    const { summary, relevanceScore } = metadataOnlySummary(summaryInput);
    const generatedAt = new Date().toISOString();
    await env.DB.prepare(
      `UPDATE specs SET ai_summary = ?, ai_summary_generated_at = ?, ai_relevance_score = ? WHERE id = ?`
    )
      .bind(summary, generatedAt, relevanceScore, spec.id)
      .run();

    return json({
      summary,
      generated_at: generatedAt,
      relevance_score: relevanceScore,
      cached: false,
      grounded: false,
    });
  }

  if (!env.ANTHROPIC_API_KEY) {
    return json(
      { error: "AI summaries are not configured. Set the ANTHROPIC_API_KEY secret." },
      { status: 503 }
    );
  }

  const rateLimitResponse = await enforceGenerationLimits(request, env);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { summary, relevanceScore } = await generateSpecSummary(
      summaryInput,
      env.ANTHROPIC_API_KEY
    );
    const generatedAt = new Date().toISOString();

    await env.DB.prepare(
      `UPDATE specs SET ai_summary = ?, ai_summary_generated_at = ?, ai_relevance_score = ? WHERE id = ?`
    )
      .bind(summary, generatedAt, relevanceScore, spec.id)
      .run();

    return json({
      summary,
      generated_at: generatedAt,
      relevance_score: relevanceScore,
      cached: false,
      grounded: true,
    });
  } catch (err) {
    return json({ error: `Failed to generate AI summary: ${(err as Error).message}` }, { status: 502 });
  }
}
