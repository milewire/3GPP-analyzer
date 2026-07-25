const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const EMPTY_PAGINATION: Pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };

function isLocalApiUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function shouldSkipApiFetch() {
  // Vercel build has no Worker on 127.0.0.1 — skip rather than crash prerender.
  const duringBuild = process.env.NEXT_PHASE === "phase-production-build";
  return duringBuild && isLocalApiUrl(API_URL);
}

async function apiFetch<T>(path: string, revalidate = 300, fallback?: T): Promise<T> {
  if (shouldSkipApiFetch() && fallback !== undefined) {
    return fallback;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`API request failed: ${path} (${res.status})`);
    }
    return (await res.json()) as T;
  } catch (err) {
    if (fallback !== undefined) {
      console.warn(`[api] ${path} unavailable (${API_URL}); using fallback`);
      return fallback;
    }
    throw err instanceof Error ? err : new Error(String(err));
  }
}

export interface Spec {
  id: number;
  spec_number: string;
  spec_id: string;
  type: string;
  series: string;
  title: string;
  technology: string | null;
  category: string | null;
  network_layer: string | null;
  status: string;
  release: string;
  version: string | null;
  last_updated: string | null;
  ftp_url: string | null;
  ai_summary: string | null;
  ai_summary_generated_at: string | null;
  ai_relevance_score: number | null;
  citation_count: number;
  is_key_spec: number;
}

export interface Release {
  id: number;
  name: string;
  short_name: string | null;
  generation: string | null;
  freeze_date: string | null;
  key_features: string | null;
  description: string | null;
  spec_count: number;
}

export interface Technology {
  id: number;
  name: string;
  slug: string;
  full_name: string | null;
  description: string | null;
  intro_release: string | null;
  generation: string | null;
  key_specs: string | null;
  icon: string | null;
  spec_count: number;
}

export interface GlossaryTerm {
  id: number;
  term: string;
  slug: string;
  full_name: string;
  definition: string;
  category: string | null;
  intro_release: string | null;
  related_specs: string | null;
  related_terms: string | null;
  evolution: string | null;
}

export function getSpecs(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  return apiFetch<{ specs: Spec[]; pagination: Pagination }>(
    `/api/specs?${qs.toString()}`,
    60,
    { specs: [], pagination: EMPTY_PAGINATION }
  );
}

export function getSpec(specNumber: string, release?: string) {
  const qs = new URLSearchParams({ specNumber });
  if (release) qs.set("release", release);
  return apiFetch<{ spec: Spec; versions: Spec[]; related: Spec[] }>(`/api/spec?${qs.toString()}`, 60);
}

export function getReleases() {
  return apiFetch<{ releases: Release[] }>(`/api/releases`, 3600, { releases: [] });
}

export function getRelease(release: string, params: Record<string, string | undefined> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  return apiFetch<{ release: Release; specs: Spec[]; seriesList: string[]; pagination: Pagination }>(
    `/api/release/${encodeURIComponent(release)}?${qs.toString()}`,
    300
  );
}

export function getTechnologies() {
  return apiFetch<{ technologies: Technology[] }>(`/api/technologies`, 3600, { technologies: [] });
}

export function getTechnology(slug: string) {
  return apiFetch<{ technology: Technology; specs: Spec[] }>(`/api/technology/${slug}`, 300);
}

export function getGlossary(category?: string) {
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  return apiFetch<{ terms: GlossaryTerm[] }>(`/api/glossary?${qs.toString()}`, 3600, { terms: [] });
}

export function getGlossaryTerm(slug: string) {
  return apiFetch<{ term: GlossaryTerm; relatedSpecs: Spec[] }>(`/api/glossary/${slug}`, 3600);
}

export function getKeySpecs(series?: string) {
  const qs = new URLSearchParams();
  if (series) qs.set("series", series);
  return apiFetch<{ specs: Spec[] }>(`/api/key-specs?${qs.toString()}`, 300, { specs: [] });
}

export function getStats() {
  return apiFetch<{ specifications: number; glossaryTerms: number; technologies: number }>(
    `/api/stats`,
    3600,
    { specifications: 0, glossaryTerms: 0, technologies: 0 }
  );
}

export function search(q: string) {
  return apiFetch<{ specs: Spec[]; terms: GlossaryTerm[] }>(
    `/api/search?q=${encodeURIComponent(q)}`,
    30,
    { specs: [], terms: [] }
  );
}
