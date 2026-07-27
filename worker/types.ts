export interface Env {
  DB: D1Database;
  SPECS_BUCKET: R2Bucket;
  ANTHROPIC_API_KEY?: string;
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
}

export interface SpecRow {
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
  source_excerpt: string | null;
  source_extracted_at: string | null;
  key_technologies: string | null;
  citation_count: number;
  is_key_spec: number;
  created_at: string;
}

export interface ReleaseRow {
  id: number;
  name: string;
  short_name: string | null;
  generation: string | null;
  freeze_date: string | null;
  key_features: string | null;
  description: string | null;
  spec_count: number;
}

export interface TechnologyRow {
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

export interface GlossaryRow {
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
