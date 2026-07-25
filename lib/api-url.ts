/**
 * Normalized Worker API base URL.
 *
 * `NEXT_PUBLIC_API_URL` is set by hand in hosting dashboards, where it is easy
 * to paste a bare hostname or a quoted value. Passing either to `fetch` fails
 * with undici's opaque "unknown scheme" error, so coerce the common mistakes
 * into a usable origin here rather than at every call site.
 */
const DEFAULT_API_URL = "http://localhost:8787";

export function normalizeApiUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim().replace(/^["']|["']$/g, "");
  if (!value) return DEFAULT_API_URL;

  const withScheme = /^https?:\/\//i.test(value)
    ? value
    : `https://${value.replace(/^\/+/, "")}`;

  return withScheme.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
