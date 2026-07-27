import type { Env } from "../types";
import { json, notFound, toPublicSpec } from "../util";

const RELEASE_ORDER = [
  "Rel-20", "Rel-19", "Rel-18", "Rel-17", "Rel-16", "Rel-15", "Rel-14", "Rel-13",
  "Rel-12", "Rel-11", "Rel-10", "Rel-9", "Rel-8",
];

export async function listReleases(url: URL, env: Env): Promise<Response> {
  // Hide stub/empty releases from the catalog by default. Pass ?all=1 to include them.
  const includeEmpty = url.searchParams.get("all") === "1";

  const { results } = await env.DB.prepare(
    `SELECT r.*,
            (SELECT COUNT(*) FROM specs s WHERE s.release = r.name) AS spec_count
     FROM releases r`
  ).all();

  let sorted = (results as Record<string, unknown>[]).sort(
    (a, b) => RELEASE_ORDER.indexOf(a.name as string) - RELEASE_ORDER.indexOf(b.name as string)
  );

  if (!includeEmpty) {
    sorted = sorted.filter((r) => (r.spec_count as number) > 0);
  }

  return json({ releases: sorted });
}

export async function getRelease(release: string, url: URL, env: Env): Promise<Response> {
  const name = decodeURIComponent(release);
  const releaseRow = await env.DB.prepare(
    `SELECT r.*,
            (SELECT COUNT(*) FROM specs s WHERE s.release = r.name) AS spec_count
     FROM releases r
     WHERE r.name = ?`
  )
    .bind(name)
    .first();
  if (!releaseRow) return notFound("Release not found");

  const series = url.searchParams.get("series");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10) || 20));
  const offset = (page - 1) * limit;

  const where = ["release = ?"];
  const args: unknown[] = [name];
  if (series && series !== "All") {
    where.push("series = ?");
    args.push(series);
  }
  const whereClause = `WHERE ${where.join(" AND ")}`;

  const countResult = await env.DB.prepare(`SELECT COUNT(*) as count FROM specs ${whereClause}`)
    .bind(...args)
    .first<{ count: number }>();
  const total = countResult?.count ?? 0;

  const { results: specs } = await env.DB.prepare(
    `SELECT * FROM specs ${whereClause} ORDER BY series ASC, spec_number ASC LIMIT ? OFFSET ?`
  )
    .bind(...args, limit, offset)
    .all();

  const { results: seriesList } = await env.DB.prepare(
    `SELECT DISTINCT series FROM specs WHERE release = ? ORDER BY series ASC`
  )
    .bind(name)
    .all();

  return json({
    release: releaseRow,
    specs: (specs as Record<string, unknown>[]).map(toPublicSpec),
    seriesList: (seriesList as { series: string }[]).map((r) => r.series),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}
