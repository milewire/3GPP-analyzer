import type { MetadataRoute } from "next";
import { getGlossary, getReleases, getTechnologies } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

function entry(
  path: string,
  opts: { lastModified?: Date; changeFrequency?: ChangeFrequency; priority?: number } = {}
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.7,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "daily", priority: 1 }),
    entry("/specifications/", { changeFrequency: "daily", priority: 0.9 }),
    entry("/key-specs/", { changeFrequency: "weekly", priority: 0.8 }),
    entry("/releases/", { changeFrequency: "weekly", priority: 0.8 }),
    entry("/technologies/", { changeFrequency: "weekly", priority: 0.8 }),
    entry("/glossary/", { changeFrequency: "weekly", priority: 0.8 }),
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const [{ technologies }, { releases }, { terms }] = await Promise.all([
      getTechnologies(),
      getReleases(),
      getGlossary(),
    ]);

    dynamicRoutes = [
      ...technologies.map((tech) =>
        entry(`/technology/${tech.slug}/`, { changeFrequency: "weekly", priority: 0.75 })
      ),
      ...releases.map((release) =>
        entry(`/releases/${encodeURIComponent(release.name)}/`, {
          changeFrequency: "weekly",
          priority: 0.7,
        })
      ),
      ...terms.map((term) =>
        entry(`/glossary/${term.slug}/`, { changeFrequency: "monthly", priority: 0.6 })
      ),
    ];
  } catch {
    // API may be unavailable during build; still ship static routes.
  }

  return [...staticRoutes, ...dynamicRoutes];
}
