import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getSpec } from "@/lib/api";
import { specPath } from "@/lib/spec-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Specification redirect",
  robots: { index: false, follow: true },
};

/** Preserve old query-string links while consolidating indexing on clean paths. */
export default async function LegacySpecRoute({
  searchParams,
}: {
  searchParams: { specNumber?: string; release?: string };
}) {
  if (!searchParams.specNumber) notFound();

  try {
    const { spec } = await getSpec(searchParams.specNumber, searchParams.release);
    permanentRedirect(specPath(spec.spec_id, spec.release));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    notFound();
  }
}
