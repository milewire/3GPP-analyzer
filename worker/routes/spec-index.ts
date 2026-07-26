import type { Env } from "../types";
import { json } from "../util";

/** Minimal versioned spec index used to generate canonical sitemap entries. */
export async function listSpecIndex(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT spec_id, release, MAX(last_updated) AS last_updated
     FROM specs
     WHERE spec_id IS NOT NULL AND release IS NOT NULL
     GROUP BY spec_id, release
     ORDER BY spec_id ASC`
  ).all();

  return json(
    { specs: results },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" } }
  );
}
