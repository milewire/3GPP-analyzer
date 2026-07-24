export default function ReleaseBadge({ release }: { release: string | null | undefined }) {
  if (!release) return null;
  return (
    <span className="inline-flex items-center rounded border border-borderb bg-offwhite px-2 py-0.5 text-xs font-semibold text-secondary">
      {release}
    </span>
  );
}
