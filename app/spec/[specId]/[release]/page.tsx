import type { Metadata } from "next";
import SpecDetailPage from "@/components/SpecDetailPage";
import { getSpec } from "@/lib/api";
import { normalizeReleaseSlug, specPath } from "@/lib/spec-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { specId: string; release: string };
}): Promise<Metadata> {
  const specId = decodeURIComponent(params.specId);
  const release = normalizeReleaseSlug(params.release);

  try {
    const { spec } = await getSpec(specId, release);
    const title = `${spec.spec_number} — ${spec.title}`;
    const description =
      spec.ai_summary?.slice(0, 155) ||
      `${spec.spec_number}: ${spec.title}. 3GPP ${spec.type} for ${spec.release}${
        spec.technology ? ` (${spec.technology})` : ""
      }.`;

    return {
      title,
      description,
      keywords: [
        spec.spec_number,
        spec.spec_id,
        spec.release,
        spec.type,
        spec.technology,
        "3GPP",
        "specification",
      ].filter(Boolean) as string[],
      alternates: { canonical: specPath(spec.spec_id, spec.release) },
      openGraph: {
        title,
        description,
        url: specPath(spec.spec_id, spec.release),
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return { title: `Specification ${specId}`, robots: { index: false, follow: true } };
  }
}

export default function SpecRoute({
  params,
}: {
  params: { specId: string; release: string };
}) {
  return (
    <SpecDetailPage
      specNumber={decodeURIComponent(params.specId)}
      release={normalizeReleaseSlug(params.release)}
    />
  );
}
