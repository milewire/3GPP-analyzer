import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import SpecCard from "@/components/SpecCard";
import { getTechnology, getTechnologies } from "@/lib/api";
import { getTechContent, RELEASE_YEARS, TECH_RELEASE_TAGS } from "@/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const { technology } = await getTechnology(params.slug);
    const title = technology.name;
    const description =
      technology.description ||
      `${technology.full_name || technology.name} — 3GPP technology overview, key specs, and related documents.`;
    return {
      title,
      description,
      alternates: { canonical: `/technology/${technology.slug}/` },
      openGraph: { title, description },
    };
  } catch {
    return { title: "Technology" };
  }
}

export default async function TechnologyDetailPage({ params }: { params: { slug: string } }) {
  let data;
  try {
    data = await getTechnology(params.slug);
  } catch {
    notFound();
  }
  const { technology, specs } = data!;

  const { technologies: allTech } = await getTechnologies();
  const otherGenerations = allTech.filter((t) => t.slug !== technology.slug).slice(0, 6);

  const sections = getTechContent(technology.slug);
  const releaseTags = TECH_RELEASE_TAGS[technology.slug] || (technology.intro_release ? [technology.intro_release] : []);

  return (
    <div className="container-page py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Technologies", href: "/technologies/" },
          { label: technology.name },
        ]}
      />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3">
          {technology.generation && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {technology.generation}
            </span>
          )}
        </div>
          <h1 className="mt-3 text-2xl font-extrabold text-darktext sm:text-3xl md:text-4xl">{technology.name}</h1>
        {technology.full_name && <p className="mt-1 text-lg text-secondary">{technology.full_name}</p>}
        {releaseTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {releaseTags.map((r) => (
              <span key={r} className="rounded-full border border-borderb bg-surface px-3 py-1 text-xs font-semibold text-secondary">
                {r} {RELEASE_YEARS[r] ? `(${RELEASE_YEARS[r]})` : ""}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-12">
          {sections ? (
            sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mb-4 border-b border-bordera pb-2 text-xl font-bold text-darktext">
                  {section.title}
                </h2>
                {section.body}
              </section>
            ))
          ) : (
            <>
              <section id="overview" className="scroll-mt-24">
                <h2 className="mb-4 border-b border-bordera pb-2 text-xl font-bold text-darktext">Overview</h2>
                <p className="text-sm leading-relaxed text-secondary">{technology.description}</p>
                <p className="mt-4 text-sm text-muted">
                  Full technical content for {technology.name} is coming soon. In the meantime, browse the
                  related specifications below.
                </p>
              </section>

              {specs.length > 0 && (
                <section id="specifications" className="scroll-mt-24">
                  <h2 className="mb-4 border-b border-bordera pb-2 text-xl font-bold text-darktext">
                    Specifications
                  </h2>
                  <div className="flex flex-col gap-3">
                    {specs.map((spec) => (
                      <SpecCard key={`${spec.spec_id}-${spec.release}`} spec={spec} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {sections && (
              <div className="rounded-lg border border-bordera bg-surface p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">On this page</h3>
                <nav className="flex flex-col gap-1.5 text-sm">
                  {sections.map((s) => (
                    <a key={s.id} href={`#${s.id}`} className="text-secondary hover:text-primary">
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className="rounded-lg border border-bordera bg-surface p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Other Generations</h3>
              <nav className="flex flex-col gap-1.5 text-sm">
                {otherGenerations.map((t) => (
                  <Link key={t.slug} href={`/technology/${t.slug}/`} className="text-secondary hover:text-primary">
                    {t.icon} {t.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="rounded-lg border border-bordera bg-surface p-4 text-sm">
              <Link href="/glossary/" className="font-semibold text-primary hover:text-accent hover:underline">
                Need definitions? Browse the glossary →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
