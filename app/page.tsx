import Link from "next/link";
import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";
import SpecCard from "@/components/SpecCard";
import BrandLogo from "@/components/BrandLogo";
import { getTechnologies, getSpecs, getStats } from "@/lib/api";
import { buildPageTitle, FEATURED_TECH_SLUGS, siteConfig } from "@/lib/seo";
import { CATALOG_COVERAGE_LABEL } from "@/lib/coverage";

export const metadata: Metadata = {
  title: { absolute: buildPageTitle() },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ technologies }, specsResult, stats] = await Promise.all([
    getTechnologies(),
    getSpecs({ sort: "updated", limit: "10" }),
    getStats(),
  ]);

  const techBySlug = new Map(technologies.map((t) => [t.slug, t]));
  const featuredTech = FEATURED_TECH_SLUGS.map((slug) => techBySlug.get(slug)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t)
  );
  const uniqueSpecs = stats.uniqueSpecifications ?? stats.specifications;
  const versionRows = stats.specificationVersions ?? uniqueSpecs;

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-bordera bg-surface py-10 sm:py-16 md:py-20">
        <div className="container-page text-center">
          <div className="flex justify-center px-1">
            <BrandLogo
              width={960}
              height={240}
              className="h-16 w-auto max-w-full sm:h-28 md:h-36 lg:h-44"
              priority
            />
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-base text-secondary sm:text-lg">
            Growing collection of 3GPP technical specifications with AI-powered search, version
            tracking, and intelligent categorization.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">{CATALOG_COVERAGE_LABEL}</p>

          <div className="mt-6 sm:mt-8">
            <SearchBar large placeholder="Search specs (e.g. 38.331, RRC, NR)" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <Link
              href="/specifications/"
              className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent hover:text-black sm:px-5"
            >
              All Specifications
            </Link>
            <Link
              href="/releases/"
              className="rounded-full border border-borderb px-4 py-2.5 text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary sm:px-5"
            >
              Releases
            </Link>
            <Link
              href="/technologies/"
              className="rounded-full border border-borderb px-4 py-2.5 text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary sm:px-5"
            >
              Technologies
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Technology */}
      <section className="container-page py-14">
        <div className="mb-8 text-center">
          <h2 className="section-heading">Browse by Technology</h2>
          <p className="mt-2 text-secondary">Explore specifications organized by technology area</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTech.map((tech) => (
            <Link
              key={tech.slug}
              href={`/technology/${tech.slug}/`}
              className="rounded-lg border border-bordera bg-surface p-5 transition hover:border-primary hover:shadow-sm"
            >
              <div className="mb-2 text-3xl">{tech.icon}</div>
              <h3 className="text-base font-semibold text-darktext">{tech.name}</h3>
              <p className="mt-1 text-sm text-secondary line-clamp-2">{tech.description}</p>
              <p className="mt-3 text-xs font-medium text-primary">{tech.spec_count.toLocaleString()} specs</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/technologies/" className="text-sm font-semibold text-primary hover:text-accent hover:underline">
            View All Topics →
          </Link>
        </div>
      </section>

      {/* Recent Specifications */}
      <section className="border-t border-bordera bg-surface py-14">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="section-heading">Recent Specifications</h2>
              <p className="mt-2 text-secondary">Recently added or updated documents</p>
            </div>
            <Link href="/specifications/" className="text-sm font-semibold text-primary hover:text-accent hover:underline">
              View All →
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {specsResult.specs.map((spec) => (
              <SpecCard key={`${spec.spec_id}-${spec.release}`} spec={spec} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary py-12 text-white">
        <div className="container-page grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
          <div>
            <div className="text-2xl font-extrabold sm:text-3xl">{uniqueSpecs.toLocaleString()}</div>
            <div className="mt-1 text-sm text-white/80">Unique specs</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold sm:text-3xl">{versionRows.toLocaleString()}</div>
            <div className="mt-1 text-sm text-white/80">Release versions</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold sm:text-3xl">{stats.releasesCovered?.toLocaleString() ?? "—"}</div>
            <div className="mt-1 text-sm text-white/80">Releases covered</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold sm:text-3xl">{stats.glossaryTerms.toLocaleString()}</div>
            <div className="mt-1 text-sm text-white/80">Glossary terms</div>
          </div>
        </div>
      </section>
    </div>
  );
}
