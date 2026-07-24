import Link from "next/link";
import type { Spec } from "@/lib/api";
import TechBadge from "./TechBadge";
import ReleaseBadge from "./ReleaseBadge";
import TypeBadge from "./TypeBadge";

export default function SpecCard({ spec }: { spec: Spec }) {
  const href = `/spec/?specNumber=${encodeURIComponent(spec.spec_number.replace(/^(TS|TR)\s*/i, ""))}&release=${encodeURIComponent(
    spec.release
  )}`;

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-lg border border-bordera bg-white p-4 transition hover:border-primary sm:flex-row sm:items-center sm:gap-6"
    >
      <div className="shrink-0">
        <span className="spec-chip">{spec.spec_number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="truncate text-base font-semibold text-darktext">{spec.title}</h3>
        {spec.category && <p className="mt-0.5 text-sm text-secondary">{spec.category}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <ReleaseBadge release={spec.release} />
        <TypeBadge type={spec.type} />
        <TechBadge technology={spec.technology} />
        {spec.last_updated && <span className="text-xs text-muted">Updated {spec.last_updated}</span>}
      </div>
    </Link>
  );
}
