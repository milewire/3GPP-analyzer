import { notFound, permanentRedirect } from "next/navigation";
import { getSpec } from "@/lib/api";
import { specPath } from "@/lib/spec-url";

export const dynamic = "force-dynamic";

export default async function LatestSpecRoute({
  params,
}: {
  params: { specId: string };
}) {
  try {
    const { spec } = await getSpec(decodeURIComponent(params.specId));
    permanentRedirect(specPath(spec.spec_id, spec.release));
  } catch (error) {
    // Next implements redirects as thrown control-flow errors.
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
