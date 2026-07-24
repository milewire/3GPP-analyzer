import type { Env } from "../types";
import { json, notFound, normalizeSpecId } from "../util";

const SORT_COLUMNS: Record<string, string> = {
  number: "spec_number",
  release: "release",
  updated: "last_updated",
};

export async function listSpecs(url: URL, env: Env): Promise<Response> {
  const params = url.searchParams;
  const release = params.get("release");
  const series = params.get("series");
  const type = params.get("type");
  const technology = params.get("technology");
  const technologyGroup = params.get("technology_group");
  const category = params.get("category");
  const networkLayer = params.get("network_layer");
  const search = params.get("search");
  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") || "20", 10) || 20));
  const sort = SORT_COLUMNS[params.get("sort") || "number"] || "spec_number";
  const offset = (page - 1) * limit;

  const where: string[] = [];
  const args: unknown[] = [];

  if (release && release !== "All") {
    where.push("release = ?");
    args.push(release);
  }
  if (series && series !== "All") {
    where.push("series = ?");
    args.push(series);
  }
  if (type && type !== "All") {
    where.push("type = ?");
    args.push(type);
  }
  if (technology && technology !== "All") {
    where.push("technology = ?");
    args.push(technology);
  }
  if (technologyGroup) {
    const techs = technologyGroup.split(",").map((t) => t.trim()).filter(Boolean);
    if (techs.length) {
      where.push(`technology IN (${techs.map(() => "?").join(",")})`);
      args.push(...techs);
    }
  }
  if (category && category !== "All") {
    where.push("category = ?");
    args.push(category);
  }
  if (networkLayer && networkLayer !== "All") {
    where.push("network_layer = ?");
    args.push(networkLayer);
  }
  if (search) {
    where.push("(spec_number LIKE ? OR title LIKE ? OR spec_id LIKE ?)");
    const like = `%${search}%`;
    args.push(like, like, like);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Dedupe multiple release-versions of the same spec_id down to their most
  // recently updated row before counting/paginating.
  const dedupedSubquery = `SELECT * FROM (SELECT * FROM specs ${whereClause} ORDER BY last_updated DESC) GROUP BY spec_id`;

  const countStmt = env.DB.prepare(`SELECT COUNT(*) as count FROM (${dedupedSubquery})`).bind(...args);
  const countResult = await countStmt.first<{ count: number }>();
  const total = countResult?.count ?? 0;

  const dataStmt = env.DB.prepare(
    `SELECT * FROM (${dedupedSubquery}) ORDER BY ${sort === "last_updated" ? "last_updated DESC" : `${sort} ASC`} LIMIT ? OFFSET ?`
  ).bind(...args, limit, offset);
  const { results } = await dataStmt.all();

  return json({
    specs: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

export async function getSpec(url: URL, env: Env): Promise<Response> {
  const specNumber = url.searchParams.get("specNumber");
  const release = url.searchParams.get("release");

  if (!specNumber) {
    return json({ error: "specNumber query param is required" }, { status: 400 });
  }

  const normalized = normalizeSpecId(specNumber);
  const withPrefix = `%${normalized}`;

  let stmt;
  if (release) {
    stmt = env.DB.prepare(
      `SELECT * FROM specs WHERE (spec_id = ? OR spec_number LIKE ?) AND release = ? LIMIT 1`
    ).bind(normalized, withPrefix, release);
  } else {
    stmt = env.DB.prepare(
      `SELECT * FROM specs WHERE spec_id = ? OR spec_number LIKE ? ORDER BY release DESC LIMIT 1`
    ).bind(normalized, withPrefix);
  }

  const spec = await stmt.first();
  if (!spec) return notFound("Specification not found");

  const versions = await env.DB.prepare(
    `SELECT release, version, last_updated, status FROM specs WHERE spec_id = ? ORDER BY release DESC`
  )
    .bind(spec.spec_id)
    .all();

  const related = await env.DB.prepare(
    `SELECT * FROM specs WHERE series = ? AND spec_id != ? GROUP BY spec_id ORDER BY citation_count DESC LIMIT 8`
  )
    .bind(spec.series, spec.spec_id)
    .all();

  return json({ spec, versions: versions.results, related: related.results });
}
