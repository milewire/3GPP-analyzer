const TECH_COLORS: Record<string, string> = {
  LTE: "#003399",
  "LTE-Advanced": "#003399",
  "LTE-Advanced Pro": "#003399",
  "5G NR": "#006633",
  "5G-Advanced": "#006633",
  "5GC": "#660099",
  NTN: "#0B6E4F",
  "Network Slicing": "#7C3AED",
  Security: "#CC3300",
  EPC: "#336699",
  IMS: "#996600",
  VoLTE: "#996600",
};

export default function TechBadge({ technology }: { technology: string | null | undefined }) {
  if (!technology) return null;
  const bg = TECH_COLORS[technology] || "#4A5568";
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: bg }}
    >
      {technology}
    </span>
  );
}
