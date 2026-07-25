import Link from "next/link";
import type { Metadata } from "next";
import { getReleases } from "@/lib/api";
import { CATALOG_COVERAGE_LABEL } from "@/lib/coverage";

export const metadata: Metadata = {
  title: "3GPP Releases",
  description:
    "Browse 3GPP releases currently in the catalog, including freeze dates, key features, and linked specifications.",
  alternates: { canonical: "/releases/" },
};

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  const { releases } = await getReleases();

  return (
    <div className="container-page py-10">
      <div className="mb-8 text-center">
        <h1 className="section-heading">3GPP Releases</h1>
        <p className="mt-2 text-secondary">
          Releases with specifications in the catalog. Empty or stub releases are hidden until they
          are ingested.
        </p>
        <p className="mt-2 text-sm text-muted">{CATALOG_COVERAGE_LABEL}</p>
      </div>

      <div className="flex flex-col gap-3">
        {releases.map((release) => (
          <Link
            key={release.name}
            href={`/releases/${encodeURIComponent(release.name)}/`}
            className="flex flex-col gap-2 rounded-lg border border-bordera bg-surface p-5 transition hover:border-primary sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-primary">{release.name}</h2>
                <span className="rounded-full border border-borderb bg-offwhite px-2.5 py-0.5 text-xs font-semibold text-secondary">
                  {release.generation}
                </span>
              </div>
              {release.description && <p className="mt-1 max-w-2xl text-sm text-secondary">{release.description}</p>}
              {release.freeze_date && (
                <p className="mt-1 text-xs text-muted">Frozen {release.freeze_date}</p>
              )}
            </div>
            <div className="text-sm font-semibold text-darktext sm:text-right">
              {release.spec_count.toLocaleString()} specifications
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
