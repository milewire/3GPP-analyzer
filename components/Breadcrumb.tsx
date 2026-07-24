import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? (
            <Link href={item.href} className="text-primary hover:text-accent hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-secondary">{item.label}</span>
          )}
          {i < items.length - 1 && <span className="mx-2 text-borderb">/</span>}
        </span>
      ))}
    </nav>
  );
}
