import Link from "next/link";
import type { GlossaryTerm } from "@/lib/api";

export default function GlossaryCard({ term }: { term: GlossaryTerm }) {
  const relatedSpecs = (term.related_specs || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Link
      href={`/glossary/${term.slug}/`}
      className="block rounded-lg border border-bordera bg-surface p-4 transition hover:border-primary"
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="font-bold text-darktext">{term.term}</span>
        {term.intro_release && (
          <span className="rounded border border-borderb bg-offwhite px-2 py-0.5 text-xs text-secondary">
            {term.intro_release}
          </span>
        )}
      </div>
      <p className="mb-1 text-sm italic text-secondary">{term.full_name}</p>
      <p className="text-sm text-secondary line-clamp-2">{term.definition}</p>
      {relatedSpecs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {relatedSpecs.map((s) => (
            <span key={s} className="spec-chip text-[11px]">
              {s}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
