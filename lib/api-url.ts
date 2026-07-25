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
  let value = (raw ?? "").trim().replace(/^["']|["']$/g, "");
  if (!value) return DEFAULT_API_URL;

  // Dashboard values are pasted by hand and sometimes arrive mangled — e.g. a
  // local path prepended (`C:\...\https:\host`) or backslashes swapped for
  // slashes. Recover by working from the last real scheme and normalizing
  // separators, so a bad paste degrades to the right origin instead of 500ing.
  value = value.replace(/\\/g, "/");

  const schemes = [...value.matchAll(/https?:/gi)];
  const last = schemes[schemes.length - 1];
  if (last?.index !== undefined) {
    value = value.slice(last.index);
  }

  if (/^https?:/i.test(value)) {
    return value.replace(/^(https?):\/*/i, (_m, scheme: string) => `${scheme.toLowerCase()}://`).replace(/\/+$/, "");
  }

  return `https://${value.replace(/^\/+/, "")}`.replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
