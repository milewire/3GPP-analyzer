import Link from "next/link";

export function SpecLink({ number, children }: { number: string; children?: React.ReactNode }) {
  const digits = number.replace(/^(TS|TR)\s*/i, "").trim();
  return (
    <Link href={`/spec/?specNumber=${encodeURIComponent(digits)}`} className="spec-chip">
      {children || number}
    </Link>
  );
}

export function SpecRefs({ numbers }: { numbers: string[] }) {
  return (
    <p className="mt-3 text-sm text-secondary">
      <span className="mr-1">📋 Specifications:</span>
      {numbers.map((n, i) => (
        <span key={n}>
          <SpecLink number={n} />
          {i < numbers.length - 1 && " "}
        </span>
      ))}
    </p>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 text-sm leading-relaxed text-secondary">{children}</div>;
}

export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-bordera">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-bordera bg-offwhite text-xs uppercase tracking-wide text-muted">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-bordera last:border-0 odd:bg-white even:bg-offwhite/40">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top text-secondary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-secondary">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function NumberedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-secondary">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}
