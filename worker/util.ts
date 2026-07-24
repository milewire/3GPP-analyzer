export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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
