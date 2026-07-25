import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import SpecCard from "@/components/SpecCard";
import { getRelease } from "@/lib/api";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: { release: string };
}): Promise<Metadata> {
  const releaseName = decodeURIComponent(params.release);
  try {
    const { release } = await getRelease(releaseName, { limit: "1" });
    const title = `${release.name} Release`;
    const description =
      release.description ||
      `${release.name} (${release.short_name || release.name}) — ${
        release.key_features || "3GPP release overview and specifications"
      }.`;
    return {
      title,
      description: description.slice(0, 160),
      alternates: { canonical: `/releases/${encodeURIComponent(release.name)}/` },
      openGraph: { title, description: description.slice(0, 160) },
    };
  } catch {
    return { title: releaseName };
  }
}

export default async function ReleaseDetailPage({
  params,
  searchParams,
}: {
  params: { release: string };
  searchParams: { series?: string; page?: string };
}) {
  const releaseName = decodeURIComponent(params.release);

  let data;
  try {
    data = await getRelease(releaseName, { series: searchParams.series, page: searchParams.page, limit: "20" });
  } catch {
    notFound();
  }

  const { release, specs, seriesList, pagination } = data!;

  function buildHref(overrides: Record<string, string | undefined>) {
    const merged = { series: searchParams.series, page: searchParams.page, ...overrides };
    const qs = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    return `/releases/${encodeURIComponent(releaseName)}/?${qs.toString()}`;
  }

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Releases", href: "/releases/" }, { label: release.name }]} />

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold text-darktext">Release {release.name}</h1>
          <span className="rounded-full border border-borderb bg-surface px-3 py-1 text-sm font-semibold text-secondary">
            {release.generation}
          </span>
        </div>
        {release.description && <p className="mt-3 max-w-2xl text-secondary">{release.description}</p>}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {release.freeze_date && <span>Frozen {release.freeze_date}</span>}
          <span>{release.spec_count.toLocaleString()} specifications</span>
        </div>
        {release.key_features && (
          <p className="mt-2 text-sm text-secondary">
            <span className="font-semibold text-darktext">Key features: </span>
            {release.key_features}
          </p>
        )}
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ series: undefined, page: undefined })}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            !searchParams.series ? "bg-accent text-black" : "border border-borderb text-secondary hover:border-primary"
          }`}
        >
          All Series
        </Link>
        {seriesList.map((s) => (
          <Link
            key={s}
            href={buildHref({ series: s, page: undefined })}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              searchParams.series === s ? "bg-accent text-black" : "border border-borderb text-secondary hover:border-primary"
            }`}
          >
            Series {s}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {specs.map((spec) => (
          <SpecCard key={`${spec.spec_id}-${spec.release}`} spec={spec} />
        ))}
        {specs.length === 0 && (
          <div className="rounded-lg border border-bordera bg-surface p-10 text-center text-secondary">
            No specifications seeded for this release/series yet.
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Link
            href={buildHref({ page: String(Math.max(1, pagination.page - 1)) })}
            className={`rounded border border-borderb px-3 py-1.5 text-sm ${
              pagination.page <= 1 ? "pointer-events-none opacity-40" : "text-secondary hover:border-primary"
            }`}
          >
            ← Prev
          </Link>
          <span className="text-sm text-secondary">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Link
            href={buildHref({ page: String(Math.min(pagination.totalPages, pagination.page + 1)) })}
            className={`rounded border border-borderb px-3 py-1.5 text-sm ${
              pagination.page >= pagination.totalPages
                ? "pointer-events-none opacity-40"
                : "text-secondary hover:border-primary"
            }`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
