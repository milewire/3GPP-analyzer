const fallbackSiteUrl = "https://3gppsniffer.com";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    fallbackSiteUrl;
  const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, "");
}

export const siteConfig = {
  name: "3GPP Analyzer",
  shortName: "3GPP Analyzer",
  tagline: "AI-powered 3GPP specification database",
  description:
    "Browse and search 3GPP LTE and 5G technical specifications (Rel-15–Rel-20) with version tracking, release timelines, technology guides for NR, NTN, network slicing, glossary terms, and AI summaries grounded in official Scope excerpts.",
  keywords: [
    "3GPP",
    "3GPP specifications",
    "3GPP Analyzer",
    "3GPP FTP",
    "TS",
    "TR",
    "S1AP",
    "RRC",
    "NGAP",
    "RAN",
    "5G",
    "5G NR",
    "5G-Advanced",
    "5GC",
    "NTN",
    "Non-Terrestrial Networks",
    "network slicing",
    "S-NSSAI",
    "LTE",
    "LTE-Advanced",
    "LTE-Advanced Pro",
    "E-UTRAN",
    "NG-RAN",
    "IMS",
    "EPC",
    "VoLTE",
    "Rel-15",
    "Rel-16",
    "Rel-17",
    "Rel-18",
    "Rel-19",
    "Rel-20",
    "telecom standards",
  ],
  locale: "en_US",
  creator: "Milewire",
  twitterHandle: "",
};

/** Featured technology slugs used for homepage and sitemap priority. Newest first. */
export const FEATURED_TECH_SLUGS = [
  "5g-advanced",
  "ntn",
  "network-slicing",
  "5g",
  "lte-advanced-pro",
  "lte-advanced",
  "lte",
  "ims",
  "epc",
  "security",
] as const;

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageTitle(title?: string): string {
  if (!title) return `${siteConfig.name} — ${siteConfig.tagline}`;
  return `${title} | ${siteConfig.name}`;
}
