import type { MetadataRoute } from "next";
import { getGlossary, getReleases, getSpecIndex, getTechnologies } from "@/lib/api";
import { absoluteUrl, FEATURED_TECH_SLUGS } from "@/lib/seo";
import { specPath } from "@/lib/spec-url";

export const dynamic = "force-dynamic";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

const FEATURED_TECH_PRIORITY = new Set<string>(FEATURED_TECH_SLUGS);

function entry(
  path: string,
  opts: { lastModified?: Date; changeFrequency?: ChangeFrequency; priority?: number } = {}
): MetadataRoute.Sitemap[number] {
  const result: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl(path),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.7,
  };
  if (opts.lastModified) result.lastModified = opts.lastModified;
  return result;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "daily", priority: 1 }),
    entry("/specifications/", { changeFrequency: "daily", priority: 0.9 }),
    entry("/key-specs/", { changeFrequency: "weekly", priority: 0.85 }),
    entry("/releases/", { changeFrequency: "weekly", priority: 0.85 }),
    entry("/technologies/", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/glossary/", { changeFrequency: "weekly", priority: 0.8 }),
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const [{ technologies }, { releases }, { terms }, { specs }] = await Promise.all([
      getTechnologies(),
      getReleases(),
      getGlossary(),
      getSpecIndex(),
    ]);

    const featuredTechs = FEATURED_TECH_SLUGS.map((slug) =>
      technologies.find((tech) => tech.slug === slug)
    ).filter((tech): tech is NonNullable<typeof tech> => Boolean(tech));

    const otherTechs = technologies.filter((tech) => !FEATURED_TECH_PRIORITY.has(tech.slug));

    dynamicRoutes = [
      ...featuredTechs.map((tech) =>
        entry(`/technology/${tech.slug}/`, { changeFrequency: "weekly", priority: 0.85 })
      ),
      ...otherTechs.map((tech) =>
        entry(`/technology/${tech.slug}/`, { changeFrequency: "weekly", priority: 0.7 })
      ),
      ...releases
        .filter((release) => release.spec_count > 0)
        .map((release) =>
          entry(`/releases/${encodeURIComponent(release.name)}/`, {
            changeFrequency: "weekly",
            priority: 0.7,
          })
        ),
      ...terms.map((term) =>
        entry(`/glossary/${term.slug}/`, { changeFrequency: "monthly", priority: 0.6 })
      ),
      // Canonical versioned spec pages only — legacy ?specNumber= URLs redirect and stay out of the sitemap.
      ...specs.map((spec) =>
        entry(specPath(spec.spec_id, spec.release), {
          changeFrequency: "monthly",
          priority: 0.65,
        })
      ),
    ];
  } catch {
    // API may be unavailable during build; still ship static routes.
  }

  return [...staticRoutes, ...dynamicRoutes];
}
