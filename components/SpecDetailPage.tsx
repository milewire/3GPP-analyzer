import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import ReleaseBadge from "@/components/ReleaseBadge";
import TypeBadge from "@/components/TypeBadge";
import TechBadge from "@/components/TechBadge";
import AISummary from "@/components/AISummary";
import SpecTable from "@/components/SpecTable";
import SpecCard from "@/components/SpecCard";
import { getSpec } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";
import { specPath } from "@/lib/spec-url";

function statusFromVersion(version: string | null): "Draft" | "Approved" {
  if (!version) return "Draft";
  const major = parseInt(version.split(".")[0] || "0", 10);
  return major >= 1 ? "Approved" : "Draft";
}

export default async function SpecDetailPage({
  specNumber,
  release,
}: {
  specNumber: string;
  release?: string;
}) {
  let data;
  try {
    data = await getSpec(specNumber, release);
  } catch {
    notFound();
  }

  const { spec, versions, related } = data!;
  const status = statusFromVersion(spec.version);
  const canonical = absoluteUrl(specPath(spec.spec_id, spec.release));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${spec.spec_number} — ${spec.title}`,
    name: spec.spec_number,
    description:
      spec.ai_summary?.slice(0, 300) ||
      `${spec.spec_number}: ${spec.title}. 3GPP ${spec.type} for ${spec.release}.`,
    url: canonical,
    dateModified: spec.last_updated || undefined,
    version: spec.version || undefined,
    about: {
      "@type": "Thing",
      name: spec.title,
    },
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: spec.release,
    },
    keywords: [spec.spec_number, spec.release, spec.type, spec.technology, "3GPP"]
      .filter(Boolean)
      .join(", "),
  };

  return (
    <div className="container-page py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Specifications", href: "/specifications/" },
          { label: spec.spec_number },
        ]}
      />

      <header className="mb-8">
        <p className="font-mono text-2xl font-bold text-primary">{spec.spec_number}</p>
        <h1 className="mt-2 text-2xl font-semibold text-darktext sm:text-3xl">{spec.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ReleaseBadge release={spec.release} />
          <TypeBadge type={spec.type} />
          <TechBadge technology={spec.technology} />
          <span
            className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
              status === "Approved" ? "bg-primary text-white" : "border border-accent text-black"
            }`}
          >
            {status}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <AISummary
            specId={spec.spec_id}
            release={spec.release}
            initialSummary={spec.ai_summary}
            initialGeneratedAt={spec.ai_summary_generated_at}
            initialRelevanceScore={spec.ai_relevance_score}
            initialGrounded={spec.source_grounded}
          />

          <section>
            <h2 className="mb-3 text-lg font-semibold text-darktext">Versions</h2>
            <SpecTable versions={versions} />
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-darktext">Related Specifications</h2>
              <div className="flex flex-col gap-3">
                {related.map((relatedSpec) => (
                  <SpecCard
                    key={`${relatedSpec.spec_id}-${relatedSpec.release}`}
                    spec={relatedSpec}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-lg border border-bordera bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Metadata</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Version</dt>
                <dd className="font-mono text-darktext">{spec.version || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Release</dt>
                <dd className="text-darktext">{spec.release}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Series</dt>
                <dd className="text-darktext">{spec.series}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Status</dt>
                <dd className="text-darktext">{status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">Cataloged</dt>
                <dd className="text-darktext">{spec.last_updated || "—"}</dd>
              </div>
              {spec.ftp_url && (
                <div className="flex justify-between gap-4">
                  <dt className="text-secondary">3GPP source</dt>
                  <dd>
                    <a
                      href={spec.ftp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-accent hover:underline"
                    >
                      View ↗
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {spec.ftp_url && (
            <a
              href={spec.ftp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-primary bg-surface px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              View on 3GPP.org ↗
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
