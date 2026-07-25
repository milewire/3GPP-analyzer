import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { CATALOG_COVERAGE_LABEL } from "@/lib/coverage";

const QUICK_LINKS = [
  { label: "Technologies", href: "/technologies/" },
  { label: "Glossary", href: "/glossary/" },
  { label: "Browse Specifications", href: "/specifications/" },
  { label: "Release Timeline", href: "/releases/" },
  { label: "Changelog", href: "/releases/" },
];

const TECH_LINKS = [
  { label: "5G", href: "/technology/5g/" },
  { label: "LTE-A Pro", href: "/technology/lte-advanced-pro/" },
  { label: "LTE-A", href: "/technology/lte-advanced/" },
  { label: "LTE", href: "/technology/lte/" },
  { label: "VoLTE", href: "/technology/volte/" },
  { label: "5GC", href: "/technology/5gc/" },
];

export default function Footer() {
  return (
    <footer className="border-t border-bordera bg-surface">
      <div className="container-page grid grid-cols-1 gap-8 py-12 sm:grid-cols-3">
        <div>
          <BrandLogo width={320} height={80} className="h-12 w-auto" />
          <p className="mt-3 text-sm text-secondary">
            A growing collection of 3GPP technical specifications with AI-powered search, version
            tracking, and intelligent categorization.
          </p>
          <p className="mt-2 text-xs text-muted">{CATALOG_COVERAGE_LABEL}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Quick Links</h3>
          <ul className="space-y-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-secondary hover:text-primary hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Technologies</h3>
          <ul className="space-y-2">
            {TECH_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-secondary hover:text-primary hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-bordera">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Data sourced from 3GPP FTP server. This is an unofficial community tool.</p>
          <p>© {new Date().getFullYear()} 3GPP Sniffer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
