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
    "Browse, search, and understand 3GPP technical specifications with AI-powered summaries, version tracking, release timelines, and RAN technology guides.",
  keywords: [
    "3GPP",
    "3GPP specifications",
    "TS",
    "TR",
    "RAN",
    "5G",
    "5G NR",
    "LTE",
    "LTE-Advanced",
    "RRC",
    "NG-RAN",
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
