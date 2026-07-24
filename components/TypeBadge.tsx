export default function TypeBadge({ type }: { type: string | null | undefined }) {
  if (!type) return null;
  const isTS = type === "TS";
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
        isTS ? "bg-primary text-white" : "border border-primary text-primary"
      }`}
    >
      {type}
    </span>
  );
}
