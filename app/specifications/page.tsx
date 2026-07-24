import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import SpecCard from "@/components/SpecCard";
import { getSpecs } from "@/lib/api";

export const revalidate = 60;

const SORT_OPTIONS = [
  { value: "number", label: "Spec Number" },
  { value: "release", label: "Release" },
  { value: "updated", label: "Recently Updated" },
];

const PAGE_SIZE = 20;

export default async function SpecificationsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = searchParams.page || "1";
  const sort = searchParams.sort || "number";

  const { specs, pagination } = await getSpecs({
    release: searchParams.release,
    category: searchParams.category,
    technology_group: searchParams.technology_group,
    network_layer: searchParams.network_layer,
    type: searchParams.type,
    search: searchParams.search,
    page,
    limit: String(PAGE_SIZE),
    sort,
  });

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    Object.entries({ ...searchParams, ...overrides }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return `/specifications/?${params.toString()}`;
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6 text-center">
        <h1 className="section-heading">Search 3GPP Specifications</h1>
        <p className="mt-2 text-secondary">
          Search and filter thousands of 3GPP technical specifications (TS) and technical reports (TR)
        </p>
      </div>

      <div className="mb-6">
        <SearchBar initialValue={searchParams.search || ""} />
      </div>

      <div className="mb-6">
        <FilterBar />
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-secondary">
          Showing {start}-{end} of {pagination.total.toLocaleString()} specifications
        </p>
        <div className="flex items-center gap-2 text-sm text-secondary">
          Sort by:
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildHref({ sort: opt.value, page: undefined })}
              className={`rounded px-2 py-1 ${
                sort === opt.value ? "bg-primary text-white" : "hover:text-primary"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {specs.map((spec) => (
          <SpecCard key={`${spec.spec_id}-${spec.release}`} spec={spec} />
        ))}
        {specs.length === 0 && (
          <div className="rounded-lg border border-bordera bg-white p-10 text-center text-secondary">
            No specifications match your filters.
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Link
            href={buildHref({ page: String(Math.max(1, pagination.page - 1)) })}
            aria-disabled={pagination.page <= 1}
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
            aria-disabled={pagination.page >= pagination.totalPages}
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
