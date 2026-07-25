import type { Env } from "./types";
import { CORS_HEADERS, json, notFound } from "./util";
import { listSpecs, getSpec } from "./routes/specs";
import { listReleases, getRelease } from "./routes/releases";
import { listTechnologies, getTechnology } from "./routes/technologies";
import { listGlossary, getGlossaryTerm } from "./routes/glossary";
import { listKeySpecs } from "./routes/key-specs";
import { getStats } from "./routes/stats";
import { search } from "./routes/search";
import { getAiSummary } from "./routes/ai-summary";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      if (pathname === "/api/specs") return listSpecs(url, env);
      if (pathname === "/api/spec") return getSpec(url, env);
      if (pathname === "/api/releases") return listReleases(env);
      if (pathname.startsWith("/api/release/")) {
        const release = pathname.replace("/api/release/", "");
        return getRelease(release, url, env);
      }
      if (pathname === "/api/technologies") return listTechnologies(env);
      if (pathname.startsWith("/api/technology/")) {
        const slug = pathname.replace("/api/technology/", "");
        return getTechnology(slug, env);
      }
      if (pathname === "/api/glossary") return listGlossary(url, env);
      if (pathname.startsWith("/api/glossary/")) {
        const slug = pathname.replace("/api/glossary/", "");
        return getGlossaryTerm(slug, env);
      }
      if (pathname === "/api/key-specs") return listKeySpecs(url, env);
      if (pathname === "/api/ai-summary") return getAiSummary(url, env);
      if (pathname === "/api/stats") return getStats(env);
      if (pathname === "/api/search") return search(url, env);

      if (pathname === "/" || pathname === "/api") {
        return json({ name: "3gpp-sniffer-worker", status: "ok" });
      }

      return notFound();
    } catch (err) {
      return json({ error: (err as Error).message }, { status: 500 });
    }
  },
};
