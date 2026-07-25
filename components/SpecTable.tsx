import type { Spec } from "@/lib/api";

function statusFromVersion(version: string | null): string {
  if (!version) return "Unknown";
  const major = parseInt(version.split(".")[0] || "0", 10);
  return major >= 1 ? "Approved" : "Draft";
}

export default function SpecTable({ versions }: { versions: Spec[] }) {
  if (!versions.length) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-bordera bg-surface">
      <table className="w-full min-w-[500px] text-left text-sm">
        <thead>
          <tr className="border-b border-bordera bg-offwhite text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-semibold">Version</th>
            <th className="px-4 py-3 font-semibold">Release</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((v, i) => (
            <tr key={i} className="border-b border-bordera last:border-0">
              <td className="px-4 py-3 font-mono text-primary">{v.version}</td>
              <td className="px-4 py-3 text-secondary">{v.release}</td>
              <td className="px-4 py-3 text-secondary">{v.last_updated || "—"}</td>
              <td className="px-4 py-3 text-secondary">{statusFromVersion(v.version)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
