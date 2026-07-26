import { API_BASE_URL as API_URL } from "./api-url";

/**
 * Every page reads live 3GPP data from the Worker. There is deliberately no
 * bundled-seed fallback: serving placeholder counts and spec ids that the
 * Worker doesn't know about silently breaks lookups (spec pages, AI summaries)
 * and misrepresents the catalog. A failure here should surface as an error.
 */
async function apiFetch<T>(path: string, _revalidate = 300): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" }).catch((err) => {
    throw new Error(
      `Cannot reach the spec API at ${API_URL}${path}. ` +
        `Start the Worker with \`npm run worker:dev\`, or set NEXT_PUBLIC_API_URL ` +
        `to the deployed Worker. (${err?.message ?? err})`
    );
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${path} (${res.status})`);
  }
  return (await res.json()) as T;
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
  source_grounded: boolean;
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

export interface SpecIndexEntry {
  spec_id: string;
  release: string;
  last_updated?: string | null;
}

export function getSpecs(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  return apiFetch<{ specs: Spec[]; pagination: Pagination }>(`/api/specs?${qs.toString()}`, 60);
}

export function getSpecIndex() {
  return apiFetch<{ specs: SpecIndexEntry[] }>(`/api/spec-index`, 3600);
}

export async function getSpec(specNumber: string, release?: string) {
  const qs = new URLSearchParams({ specNumber });
  if (release) qs.set("release", release);

  return apiFetch<{ spec: Spec; versions: Spec[]; related: Spec[] }>(
    `/api/spec?${qs.toString()}`,
    60
  );
}

export function getReleases() {
  return apiFetch<{ releases: Release[] }>(`/api/releases`, 60);
}

export async function getRelease(release: string, params: Record<string, string | undefined> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });

  return apiFetch<{
    release: Release;
    specs: Spec[];
    seriesList: string[];
    pagination: Pagination;
  }>(`/api/release/${encodeURIComponent(release)}?${qs.toString()}`, 300);
}

export function getTechnologies() {
  return apiFetch<{ technologies: Technology[] }>(`/api/technologies`, 60);
}

export async function getTechnology(slug: string) {
  return apiFetch<{ technology: Technology; specs: Spec[] }>(`/api/technology/${slug}`, 300);
}

export function getGlossary(category?: string) {
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  return apiFetch<{ terms: GlossaryTerm[] }>(`/api/glossary?${qs.toString()}`, 3600);
}

export async function getGlossaryTerm(slug: string) {
  return apiFetch<{ term: GlossaryTerm; relatedSpecs: Spec[] }>(`/api/glossary/${slug}`, 3600);
}

export function getKeySpecs(series?: string) {
  const qs = new URLSearchParams();
  if (series) qs.set("series", series);
  return apiFetch<{ specs: Spec[] }>(`/api/key-specs?${qs.toString()}`, 300);
}

export function getStats() {
  return apiFetch<{
    specifications: number;
    uniqueSpecifications: number;
    specificationVersions: number;
    glossaryTerms: number;
    technologies: number;
    releasesCovered: number;
  }>(`/api/stats`, 60);
}

export function search(q: string) {
  return apiFetch<{ specs: Spec[]; terms: GlossaryTerm[] }>(
    `/api/search?q=${encodeURIComponent(q)}`,
    30
  );
}
