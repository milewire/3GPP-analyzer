import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import TypeBadge from "@/components/TypeBadge";
import TechBadge from "@/components/TechBadge";
import { getKeySpecs } from "@/lib/api";

export const metadata: Metadata = {
  title: "Key Specs",
  description:
    "The most-cited 3GPP specifications for RAN engineers, grouped by series with evolution highlights.",
  alternates: { canonical: "/key-specs/" },
};

export const revalidate = 300;

const SERIES_FILTERS = ["All", "22", "23", "29", "33", "36", "38"];

export default async function KeySpecsPage({ searchParams }: { searchParams: { series?: string } }) {
  const series = searchParams.series && searchParams.series !== "All" ? searchParams.series : undefined;
  const { specs } = await getKeySpecs(series);

  const suffixCounts = new Map<string, number>();
  specs
    .filter((s) => s.series === "36" || s.series === "38")
    .forEach((s) => {
      const suffix = s.spec_number.split(".")[1];
      suffixCounts.set(suffix, (suffixCounts.get(suffix) || 0) + 1);
    });

  const totalCitations = specs.reduce((sum, s) => sum + s.citation_count, 0);
  const seriesCovered = new Set(specs.map((s) => s.series)).size;
  const withEvolution = specs.filter(
    (s) => (s.series === "36" || s.series === "38") && (suffixCounts.get(s.spec_number.split(".")[1]) || 0) > 1
  ).length;

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Key Specs" }]} />

      <div className="mb-6 text-center">
        <h1 className="section-heading">Key 3GPP Specifications</h1>
        <p className="mx-auto mt-2 max-w-2xl text-secondary">
          The 50 most important 3GPP specifications, selected based on how frequently they are referenced
          by other documents.
        </p>
      </div>

      <div className="mb-8 rounded-lg border border-bordera bg-surface p-4 text-sm text-secondary">
        <p>
          <span className="font-semibold text-darktext">Methodology: </span>
          Ranking is derived from citation analysis — how often each specification is referenced by other
          3GPP documents. Specifications with a paired LTE/NR counterpart (e.g. TS 38.331 / TS 36.331)
          are flagged with an <span className="font-semibold text-primary">Evolution</span> badge,
          indicating AI-generated cross-release analysis is available.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm text-secondary">Filter by series:</span>
        {SERIES_FILTERS.map((s) => (
          <Link
            key={s}
            href={s === "All" ? "/key-specs/" : `/key-specs/?series=${s}`}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              (searchParams.series || "All") === s
                ? "bg-accent text-black"
                : "border border-borderb text-secondary hover:border-primary"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {specs.map((spec, i) => {
          const suffix = spec.spec_number.split(".")[1];
          const hasEvolution =
            (spec.series === "36" || spec.series === "38") && (suffixCounts.get(suffix) || 0) > 1;
          return (
            <Link
              key={`${spec.spec_id}-${spec.release}`}
              href={`/spec/?specNumber=${encodeURIComponent(spec.spec_number.replace(/^(TS|TR)\s*/i, ""))}&release=${encodeURIComponent(spec.release)}`}
              className="flex flex-col gap-2 rounded-lg border border-bordera bg-surface p-4 transition hover:border-primary sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="w-8 shrink-0 text-sm font-bold text-muted">#{i + 1}</span>
              <span className="spec-chip shrink-0">{spec.spec_number}</span>
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-darktext">{spec.title}</span>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <TypeBadge type={spec.type} />
                <TechBadge technology={spec.technology} />
                <span className="rounded border border-borderb bg-offwhite px-2 py-0.5 text-xs font-semibold text-secondary">
                  {spec.citation_count} citations
                </span>
                {hasEvolution && (
                  <span className="rounded bg-accent px-2 py-0.5 text-xs font-semibold text-black">
                    Evolution
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        {specs.length === 0 && (
          <div className="rounded-lg border border-bordera bg-surface p-10 text-center text-secondary">
            Loading specification details…
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 rounded-lg border border-bordera bg-surface p-6 text-center sm:grid-cols-4">
        <div>
          <div className="text-2xl font-extrabold text-primary">{specs.length}</div>
          <div className="mt-1 text-xs text-muted">Key Specifications</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-primary">{totalCitations.toLocaleString()}</div>
          <div className="mt-1 text-xs text-muted">Total Citations</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-primary">{seriesCovered}</div>
          <div className="mt-1 text-xs text-muted">Series Covered</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-primary">{withEvolution}</div>
          <div className="mt-1 text-xs text-muted">With Evolution Data</div>
        </div>
      </div>
    </div>
  );
}
