"use client";

import Link from "next/link";
import { useState } from "react";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Technologies", href: "/technologies/" },
  { label: "Glossary", href: "/glossary/" },
  { label: "Specifications", href: "/specifications/" },
  { label: "Releases", href: "/releases/" },
  { label: "Key Specs", href: "/key-specs/" },
];

export default function NavHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-bordera bg-surface">
      <div className="container-page flex h-20 items-center justify-between sm:h-24">
        <Link href="/" className="flex shrink-0 items-center" aria-label="3GPP Analyzer home">
          <BrandLogo width={480} height={120} className="h-12 w-auto sm:h-16" priority />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-secondary transition hover:text-primary hover:underline hover:decoration-accent hover:decoration-2 hover:underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded border border-bordera text-primary"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-bordera bg-surface md:hidden">
          <div className="container-page flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2.5 text-sm font-medium text-secondary hover:text-primary"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
