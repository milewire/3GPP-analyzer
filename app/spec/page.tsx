import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import ReleaseBadge from "@/components/ReleaseBadge";
import TypeBadge from "@/components/TypeBadge";
import TechBadge from "@/components/TechBadge";
import AISummary from "@/components/AISummary";
import SpecTable from "@/components/SpecTable";
import SpecCard from "@/components/SpecCard";
import { getSpec } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { specNumber?: string; release?: string };
}): Promise<Metadata> {
  const { specNumber, release } = searchParams;
  if (!specNumber) {
    return { title: "Specification", robots: { index: false, follow: true } };
  }

  try {
    const { spec } = await getSpec(specNumber, release);
    const title = `${spec.spec_number} — ${spec.title}`;
    const description =
      spec.ai_summary?.slice(0, 155) ||
      `${spec.spec_number}: ${spec.title}. 3GPP ${spec.type} for ${spec.release}${
        spec.technology ? ` (${spec.technology})` : ""
      }.`;
    const canonical = `/spec/?specNumber=${encodeURIComponent(specNumber)}${
      release ? `&release=${encodeURIComponent(release)}` : ""
    }`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description },
    };
  } catch {
    return { title: `Specification ${specNumber}` };
  }
}

function statusFromVersion(version: string | null): "Draft" | "Approved" {
  if (!version) return "Draft";
  const major = parseInt(version.split(".")[0] || "0", 10);
  return major >= 1 ? "Approved" : "Draft";
}

export default async function SpecDetailPage({
  searchParams,
}: {
  searchParams: { specNumber?: string; release?: string };
}) {
  const { specNumber, release } = searchParams;
  if (!specNumber) notFound();

  let data;
  try {
    data = await getSpec(specNumber, release);
  } catch {
    notFound();
  }

  const { spec, versions, related } = data!;
  const status = statusFromVersion(spec.version);

  return (
    <div className="container-page py-10">
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
          />

          <section>
            <h2 className="mb-3 text-lg font-semibold text-darktext">Versions</h2>
            <SpecTable versions={versions} />
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-darktext">Related Specifications</h2>
              <div className="flex flex-col gap-3">
                {related.map((r) => (
                  <SpecCard key={`${r.spec_id}-${r.release}`} spec={r} />
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
                <dt className="text-secondary">Last Updated</dt>
                <dd className="text-darktext">{spec.last_updated || "—"}</dd>
              </div>
              {spec.ftp_url && (
                <div className="flex justify-between gap-4">
                  <dt className="text-secondary">FTP URL</dt>
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
