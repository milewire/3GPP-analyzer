import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import GlossaryCard from "@/components/GlossaryCard";
import { getGlossary } from "@/lib/api";

export const metadata: Metadata = {
  title: "RAN Glossary",
  description:
    "Definitions for 3GPP and RAN terms across core network, radio access, physical layer, security, and protocols.",
  alternates: { canonical: "/glossary/" },
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const CATEGORIES: { label: string; emoji: string }[] = [
  { label: "Core Network", emoji: "🏛" },
  { label: "Radio Access Network", emoji: "📡" },
  { label: "Physical Layer", emoji: "📊" },
  { label: "Services", emoji: "🔧" },
  { label: "Security", emoji: "🔒" },
  { label: "Protocol", emoji: "📦" },
  { label: "Interface", emoji: "🔗" },
  { label: "Identifier", emoji: "🏷" },
  { label: "QoS", emoji: "📈" },
  { label: "Mobility", emoji: "📶" },
  { label: "IoT", emoji: "📱" },
  { label: "Network Slicing", emoji: "🥧" },
  { label: "Management", emoji: "⚙" },
  { label: "Other", emoji: "📄" },
];

export default async function GlossaryPage({ searchParams }: { searchParams: { category?: string } }) {
  const { terms } = await getGlossary();
  const activeCategory = searchParams.category;

  const filtered = activeCategory ? terms.filter((t) => t.category === activeCategory) : terms;

  const grouped = new Map<string, typeof terms>();
  filtered.forEach((term) => {
    const key = term.category || "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(term);
  });

  const countsByCategory = new Map<string, number>();
  terms.forEach((t) => {
    const key = t.category || "Other";
    countsByCategory.set(key, (countsByCategory.get(key) || 0) + 1);
  });

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Glossary" }]} />

      <div className="mb-8 text-center">
        <h1 className="section-heading">3GPP Glossary</h1>
        <p className="mt-2 text-secondary">
          Comprehensive reference of mobile network terms, components, and technologies
        </p>
        <p className="mt-1 text-sm text-muted">{terms.length} terms</p>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/glossary/"
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
            !activeCategory ? "bg-accent text-black" : "border border-borderb text-secondary hover:border-primary"
          }`}
        >
          All ({terms.length})
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            href={`/glossary/?category=${encodeURIComponent(cat.label)}`}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              activeCategory === cat.label
                ? "bg-accent text-black"
                : "border border-borderb text-secondary hover:border-primary"
            }`}
          >
            {cat.emoji} {cat.label} ({countsByCategory.get(cat.label) || 0})
          </Link>
        ))}
      </div>

      <div className="space-y-10">
        {Array.from(grouped.entries()).map(([category, categoryTerms]) => (
          <section key={category}>
            <h2 className="mb-4 text-lg font-bold text-darktext">
              {category} <span className="text-sm font-normal text-muted">({categoryTerms.length})</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTerms.map((term) => (
                <GlossaryCard key={term.slug} term={term} />
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-bordera bg-surface p-10 text-center text-secondary">
            No terms found in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
