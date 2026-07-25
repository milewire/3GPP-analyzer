-- 3GPP Sniffer D1 schema

DROP TABLE IF EXISTS specs;
DROP TABLE IF EXISTS releases;
DROP TABLE IF EXISTS technologies;
DROP TABLE IF EXISTS glossary_terms;

CREATE TABLE specs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spec_number TEXT NOT NULL,
  spec_id TEXT NOT NULL,
  type TEXT NOT NULL,
  series TEXT NOT NULL,
  title TEXT NOT NULL,
  technology TEXT,
  category TEXT,
  network_layer TEXT,
  status TEXT DEFAULT 'Active',
  release TEXT NOT NULL,
  version TEXT,
  last_updated TEXT,
  ftp_url TEXT,
  ai_summary TEXT,
  ai_summary_generated_at TEXT,
  ai_relevance_score INTEGER,
  key_technologies TEXT,
  citation_count INTEGER DEFAULT 0,
  is_key_spec INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE releases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  short_name TEXT,
  generation TEXT,
  freeze_date TEXT,
  key_features TEXT,
  description TEXT,
  spec_count INTEGER DEFAULT 0
);

CREATE TABLE technologies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT,
  description TEXT,
  intro_release TEXT,
  generation TEXT,
  key_specs TEXT,
  icon TEXT,
  spec_count INTEGER DEFAULT 0
);

CREATE TABLE glossary_terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  definition TEXT NOT NULL,
  category TEXT,
  intro_release TEXT,
  related_specs TEXT,
  related_terms TEXT,
  evolution TEXT
);

CREATE INDEX idx_specs_number ON specs(spec_number);
CREATE INDEX idx_specs_release ON specs(release);
CREATE INDEX idx_specs_series ON specs(series);
CREATE INDEX idx_specs_technology ON specs(technology);
CREATE INDEX idx_specs_type ON specs(type);
CREATE INDEX idx_glossary_slug ON glossary_terms(slug);
CREATE INDEX idx_glossary_category ON glossary_terms(category);
