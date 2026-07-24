"use client";

import Link from "next/link";
import { useState } from "react";

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
    <header className="sticky top-0 z-40 border-b border-bordera bg-white">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          RAN Reference
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
        </nav>

        <button
          aria-label="Toggle menu"
          className="flex h-9 w-9 items-center justify-center rounded border border-bordera text-primary md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-bordera bg-white md:hidden">
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
