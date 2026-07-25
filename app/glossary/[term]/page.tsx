import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import SpecCard from "@/components/SpecCard";
import { getGlossaryTerm } from "@/lib/api";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { term: string };
}): Promise<Metadata> {
  try {
    const { term } = await getGlossaryTerm(params.term);
    const title = `${term.term} — ${term.full_name}`;
    const description = term.definition.slice(0, 160);
    return {
      title,
      description,
      alternates: { canonical: `/glossary/${term.slug}/` },
      openGraph: { title, description },
    };
  } catch {
    return { title: "Glossary term" };
  }
}

export default async function GlossaryTermPage({ params }: { params: { term: string } }) {
  let data;
  try {
    data = await getGlossaryTerm(params.term);
  } catch {
    notFound();
  }
  const { term, relatedSpecs } = data!;

  const relatedTermSlugs = (term.related_terms || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const evolutionEntries = (term.evolution || "")
    .split(/(?<=\.)\s+(?=[A-Z(])/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="container-page py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Glossary", href: "/glossary/" },
          { label: term.term },
        ]}
      />

      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-darktext">{term.term}</h1>
        <p className="mt-1 text-lg italic text-secondary">{term.full_name}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {term.category && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {term.category}
            </span>
          )}
          {term.intro_release && (
            <span className="rounded-full border border-borderb bg-surface px-3 py-1 text-xs font-semibold text-secondary">
              Introduced {term.intro_release}
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-lg font-bold text-darktext">Definition</h2>
            <p className="text-sm leading-relaxed text-secondary">{term.definition}</p>
          </section>

          {evolutionEntries.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-darktext">Evolution Across Releases</h2>
              <div className="rounded-lg border border-bordera bg-surface p-4">
                <ul className="space-y-2 text-sm leading-relaxed text-secondary">
                  {evolutionEntries.map((entry, i) => (
                    <li key={i} className="border-l-2 border-primary pl-3">
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {relatedSpecs.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold text-darktext">Related Specifications</h2>
              <div className="flex flex-col gap-3">
                {relatedSpecs.map((spec) => (
                  <SpecCard key={`${spec.spec_id}-${spec.release}`} spec={spec} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside>
          {relatedTermSlugs.length > 0 && (
            <div className="rounded-lg border border-bordera bg-surface p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Related Terms</h3>
              <div className="flex flex-wrap gap-2">
                {relatedTermSlugs.map((slug) => (
                  <Link
                    key={slug}
                    href={`/glossary/${slug}/`}
                    className="rounded-full border border-borderb bg-offwhite px-3 py-1 text-xs font-semibold text-secondary hover:border-primary hover:text-primary"
                  >
                    {slug.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
