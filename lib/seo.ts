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
  name: "3GPP Sniffer",
  shortName: "3GPP Sniffer",
  tagline: "AI-powered 3GPP specification database",
  description:
    "Browse and search 3GPP technical specifications (Rel-15–Rel-20) with version tracking, release timelines, RAN technology guides, glossary terms, and AI summaries grounded in official Scope excerpts.",
  keywords: [
    "3GPP",
    "3GPP specifications",
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
    "LTE",
    "LTE-Advanced",
    "E-UTRAN",
    "NG-RAN",
    "Rel-15",
    "Rel-16",
    "Rel-17",
    "Rel-18",
    "Rel-19",
    "Rel-20",
    "telecom standards",
    "3GPP Sniffer",
  ],
  locale: "en_US",
  creator: "Milewire",
  twitterHandle: "",
};

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageTitle(title?: string): string {
  if (!title) return `${siteConfig.name} — ${siteConfig.tagline}`;
  return `${title} | ${siteConfig.name}`;
}
