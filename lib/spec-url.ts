export function normalizeReleaseSlug(release: string): string {
  const value = decodeURIComponent(release).trim();
  if (/^r(?:el-?)?99$/i.test(value)) return "R99";
  const match = /^rel-?(\d+)$/i.exec(value);
  return match ? `Rel-${match[1]}` : value;
}

export function specPath(specId: string, release: string): string {
  const normalizedSpec = specId.replace(/^(TS|TR)\s*/i, "").trim();
  const releaseSlug = normalizeReleaseSlug(release).toLowerCase();
  return `/spec/${encodeURIComponent(normalizedSpec)}/${encodeURIComponent(releaseSlug)}/`;
}
