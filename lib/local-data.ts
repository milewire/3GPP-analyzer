import type { GlossaryTerm, Pagination, Release, Spec, Technology } from "./api";

import technologiesData from "./data/technologies.json";
import releasesData from "./data/releases.json";
import glossaryData from "./data/glossary.json";
import statsData from "./data/stats.json";
import keySpecsData from "./data/key-specs.json";
import specsAllData from "./data/specs-all.json";

export function localTechnologies() {
  return technologiesData as { technologies: Technology[] };
}

export function localReleases() {
  return releasesData as { releases: Release[] };
}

export function localGlossary(category?: string) {
  const terms = (glossaryData as { terms: GlossaryTerm[] }).terms;
  return {
    terms: category ? terms.filter((t) => t.category === category) : terms,
  };
}

export function localStats() {
  return statsData as { specifications: number; glossaryTerms: number; technologies: number };
}

export function localKeySpecs(series?: string) {
  const specs = (keySpecsData as { specs: Spec[] }).specs;
  return {
    specs: series && series !== "All" ? specs.filter((s) => s.series === series) : specs,
  };
}

export function localSpecs(params: Record<string, string | undefined>) {
  let specs = [...(specsAllData as { specs: Spec[]; pagination: Pagination }).specs];

  const search = params.search?.trim().toLowerCase();
  if (search) {
    specs = specs.filter(
      (s) =>
        s.spec_number.toLowerCase().includes(search) ||
        s.title.toLowerCase().includes(search) ||
        (s.technology || "").toLowerCase().includes(search) ||
        (s.category || "").toLowerCase().includes(search)
    );
  }
  if (params.release && params.release !== "All") {
    specs = specs.filter((s) => s.release === params.release);
  }
  if (params.category && params.category !== "All") {
    specs = specs.filter((s) => s.category === params.category);
  }
  if (params.network_layer && params.network_layer !== "All") {
    specs = specs.filter((s) => s.network_layer === params.network_layer);
  }
  if (params.type && params.type !== "All") {
    specs = specs.filter((s) => s.type === params.type);
  }
  if (params.generation && params.generation !== "All") {
    // generation is not on Spec directly; filter via release naming is imperfect — skip if absent
  }
  if (params.technology) {
    specs = specs.filter((s) => (s.technology || "").toLowerCase() === params.technology!.toLowerCase());
  }

  const sort = params.sort || "number";
  specs.sort((a, b) => {
    if (sort === "updated") {
      return (b.last_updated || "").localeCompare(a.last_updated || "");
    }
    if (sort === "title") return a.title.localeCompare(b.title);
    return a.spec_number.localeCompare(b.spec_number, undefined, { numeric: true });
  });

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(200, Number(params.limit) || 20));
  const total = specs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return {
    specs: specs.slice(start, start + limit),
    pagination: { page, limit, total, totalPages } satisfies Pagination,
  };
}

export function localSpec(specNumber: string, release?: string) {
  const all = (specsAllData as { specs: Spec[] }).specs;
  const normalized = specNumber.replace(/^(TS|TR)\s*/i, "").trim();
  const versions = all.filter(
    (s) => s.spec_number.replace(/^(TS|TR)\s*/i, "") === normalized || s.spec_id === normalized
  );
  if (versions.length === 0) return null;

  const spec =
    (release ? versions.find((v) => v.release === release) : null) ||
    versions.find((v) => v.status === "Approved") ||
    versions[0];

  const related = all
    .filter(
      (s) =>
        s.spec_id !== spec.spec_id &&
        (s.technology === spec.technology || s.series === spec.series)
    )
    .slice(0, 8);

  return { spec, versions, related };
}

export function localTechnology(slug: string) {
  const tech = localTechnologies().technologies.find((t) => t.slug === slug);
  if (!tech) return null;
  const specs = (specsAllData as { specs: Spec[] }).specs
    .filter((s) => (s.technology || "").toLowerCase() === tech.name.toLowerCase() || (s.technology || "").toLowerCase() === slug)
    .slice(0, 40);
  return { technology: tech, specs };
}

export function localRelease(name: string, params: Record<string, string | undefined> = {}) {
  const release = localReleases().releases.find((r) => r.name === name);
  if (!release) return null;

  let specs = (specsAllData as { specs: Spec[] }).specs.filter((s) => s.release === name);
  if (params.series && params.series !== "All") {
    specs = specs.filter((s) => s.series === params.series);
  }

  const seriesList = Array.from(new Set(specs.map((s) => s.series))).sort();
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 20));
  const total = specs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const start = (page - 1) * limit;

  return {
    release,
    specs: specs.slice(start, start + limit),
    seriesList,
    pagination: { page, limit, total, totalPages } satisfies Pagination,
  };
}

export function localGlossaryTerm(slug: string) {
  const term = localGlossary().terms.find((t) => t.slug === slug);
  if (!term) return null;
  const relatedSpecs = (specsAllData as { specs: Spec[] }).specs
    .filter((s) => {
      const related = term.related_specs || "";
      return related.split(/[,;]/).some((part) => s.spec_number.includes(part.trim()) && part.trim());
    })
    .slice(0, 10);
  return { term, relatedSpecs };
}

export function localSearch(q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return { specs: [] as Spec[], terms: [] as GlossaryTerm[] };
  const specs = (specsAllData as { specs: Spec[] }).specs
    .filter(
      (s) =>
        s.spec_number.toLowerCase().includes(query) ||
        s.title.toLowerCase().includes(query) ||
        (s.technology || "").toLowerCase().includes(query)
    )
    .slice(0, 20);
  const terms = localGlossary().terms
    .filter(
      (t) =>
        t.term.toLowerCase().includes(query) ||
        t.full_name.toLowerCase().includes(query) ||
        t.definition.toLowerCase().includes(query)
    )
    .slice(0, 20);
  return { specs, terms };
}
