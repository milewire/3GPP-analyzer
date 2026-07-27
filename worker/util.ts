export function corsHeaders(_request?: Request): HeadersInit {
  // Public read API — wildcard CORS so Vercel previews and local dev work.
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const CORS_HEADERS = corsHeaders();

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
      ...(init.headers || {}),
    },
  });
}

export function notFound(message = "Not found"): Response {
  return json({ error: message }, { status: 404 });
}

/**
 * Normalizes a spec identifier like "TS 38.331", "38331", or "38.331" into
 * the dotted "38.331" form used for spec_id, since URLs pass digits-only.
 */
export function normalizeSpecId(input: string): string {
  const stripped = input.replace(/^(TS|TR)\s*/i, "").trim();
  if (stripped.includes(".")) return stripped;
  if (/^\d{4,}$/.test(stripped)) {
    return `${stripped.slice(0, 2)}.${stripped.slice(2)}`;
  }
  return stripped;
}

/** Keep source excerpts server-side while exposing whether grounding is available. */
export function toPublicSpec(row: Record<string, unknown>): Record<string, unknown> {
  const {
    source_excerpt: sourceExcerpt,
    source_extracted_at: _sourceExtractedAt,
    ...spec
  } = row;
  return { ...spec, source_grounded: Boolean(sourceExcerpt) };
}

/** Numeric release sort — lexical DESC wrongly ranks Rel-8 above Rel-19. */
export const RELEASE_SORT_DESC = `CASE
  WHEN release IN ('R99', 'Rel-99') THEN 99
  WHEN release LIKE 'Rel-%' THEN CAST(REPLACE(release, 'Rel-', '') AS INTEGER)
  ELSE 0
END DESC`;
