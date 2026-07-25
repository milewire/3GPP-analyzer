import * as local from "./local-data";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL = configuredApiUrl || "http://localhost:8787";

function isRemoteApiConfigured() {
  if (!configuredApiUrl) return false;
  return !/localhost|127\.0\.0\.1/i.test(configuredApiUrl);
}

async function remoteFetch<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`API request failed: ${path} (${res.status})`);
  }
  return (await res.json()) as T;
}

/** Prefer the Worker when configured; otherwise serve bundled seed data. */
async function apiFetch<T>(
  path: string,
  revalidate: number,
  localFallback: () => T
): Promise<T> {
  if (!isRemoteApiConfigured()) {
    return localFallback();
  }

  try {
    return await remoteFetch<T>(path, revalidate);
  } catch (err) {
    console.warn(`[api] ${path} failed; using bundled seed data`, err);
    return localFallback();
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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getSpecs(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  return apiFetch<{ specs: Spec[]; pagination: Pagination }>(
    `/api/specs?${qs.toString()}`,
    60,
    () => local.localSpecs(params)
  );
}

export async function getSpec(specNumber: string, release?: string) {
  const qs = new URLSearchParams({ specNumber });
  if (release) qs.set("release", release);

  if (!isRemoteApiConfigured()) {
    const data = local.localSpec(specNumber, release);
    if (!data) throw new Error(`Spec not found: ${specNumber}`);
    return data;
  }

  try {
    return await remoteFetch<{ spec: Spec; versions: Spec[]; related: Spec[] }>(
      `/api/spec?${qs.toString()}`,
      60
    );
  } catch {
    const data = local.localSpec(specNumber, release);
    if (!data) throw new Error(`Spec not found: ${specNumber}`);
    return data;
  }
}

export function getReleases() {
  return apiFetch<{ releases: Release[] }>(`/api/releases`, 3600, () => local.localReleases());
}

export async function getRelease(release: string, params: Record<string, string | undefined> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });

  if (!isRemoteApiConfigured()) {
    const data = local.localRelease(release, params);
    if (!data) throw new Error(`Release not found: ${release}`);
    return data;
  }

  try {
    return await remoteFetch<{
      release: Release;
      specs: Spec[];
      seriesList: string[];
      pagination: Pagination;
    }>(`/api/release/${encodeURIComponent(release)}?${qs.toString()}`, 300);
  } catch {
    const data = local.localRelease(release, params);
    if (!data) throw new Error(`Release not found: ${release}`);
    return data;
  }
}

export function getTechnologies() {
  return apiFetch<{ technologies: Technology[] }>(`/api/technologies`, 3600, () =>
    local.localTechnologies()
  );
}

export async function getTechnology(slug: string) {
  if (!isRemoteApiConfigured()) {
    const data = local.localTechnology(slug);
    if (!data) throw new Error(`Technology not found: ${slug}`);
    return data;
  }

  try {
    return await remoteFetch<{ technology: Technology; specs: Spec[] }>(
      `/api/technology/${slug}`,
      300
    );
  } catch {
    const data = local.localTechnology(slug);
    if (!data) throw new Error(`Technology not found: ${slug}`);
    return data;
  }
}

export function getGlossary(category?: string) {
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  return apiFetch<{ terms: GlossaryTerm[] }>(`/api/glossary?${qs.toString()}`, 3600, () =>
    local.localGlossary(category)
  );
}

export async function getGlossaryTerm(slug: string) {
  if (!isRemoteApiConfigured()) {
    const data = local.localGlossaryTerm(slug);
    if (!data) throw new Error(`Glossary term not found: ${slug}`);
    return data;
  }

  try {
    return await remoteFetch<{ term: GlossaryTerm; relatedSpecs: Spec[] }>(
      `/api/glossary/${slug}`,
      3600
    );
  } catch {
    const data = local.localGlossaryTerm(slug);
    if (!data) throw new Error(`Glossary term not found: ${slug}`);
    return data;
  }
}

export function getKeySpecs(series?: string) {
  const qs = new URLSearchParams();
  if (series) qs.set("series", series);
  return apiFetch<{ specs: Spec[] }>(`/api/key-specs?${qs.toString()}`, 300, () =>
    local.localKeySpecs(series)
  );
}

export function getStats() {
  return apiFetch<{ specifications: number; glossaryTerms: number; technologies: number }>(
    `/api/stats`,
    3600,
    () => local.localStats()
  );
}

export function search(q: string) {
  return apiFetch<{ specs: Spec[]; terms: GlossaryTerm[] }>(
    `/api/search?q=${encodeURIComponent(q)}`,
    30,
    () => local.localSearch(q)
  );
}
