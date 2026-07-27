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
      <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-20 md:h-24">
        <Link href="/" className="flex min-w-0 shrink items-center" aria-label="3GPP Analyzer home">
          <BrandLogo
            width={480}
            height={120}
            className="h-9 w-auto max-w-[min(220px,55vw)] sm:h-12 sm:max-w-[280px] md:h-16 md:max-w-none"
            priority
          />
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

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center rounded border border-bordera text-primary"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="text-lg" aria-hidden="true">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-bordera bg-surface md:hidden">
          <div className="container-page flex flex-col py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 text-base font-medium text-secondary hover:text-primary"
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
