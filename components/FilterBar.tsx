"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const RELEASES = [
  "All", "Rel-20", "Rel-19", "Rel-18", "Rel-17", "Rel-16", "Rel-15", "Rel-14",
  "Rel-13", "Rel-12", "Rel-11", "Rel-10", "Rel-9", "Rel-8",
];

const CATEGORIES = [
  "All", "Architecture", "Protocol", "Physical Layer", "Interface", "Requirements",
  "Security", "Management", "Services", "Study", "Reference",
];

const GENERATIONS = ["All", "5G", "LTE"];

const NETWORK_LAYERS = ["All", "Radio Access Network", "Core Network", "Service", "Other"];

const GENERATION_TECH_MAP: Record<string, string[]> = {
  "5G": ["5G NR", "5G-Advanced", "5GC", "NTN", "Network Slicing"],
  LTE: ["LTE", "LTE-Advanced", "LTE-Advanced Pro", "EPC", "VoLTE"],
};

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentRelease = searchParams.get("release") || "All";
  const currentCategory = searchParams.get("category") || "All";
  const currentNetworkLayer = searchParams.get("network_layer") || "All";
  const currentType = searchParams.get("type") || "All";
  const currentGeneration = searchParams.get("generation") || "All";

  function onGenerationChange(gen: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (gen === "All") {
      params.delete("generation");
      params.delete("technology_group");
    } else {
      params.set("generation", gen);
      params.set("technology_group", GENERATION_TECH_MAP[gen].join(","));
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-bordera bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-1 items-center gap-2 text-sm text-secondary sm:flex-none">
          Release
          <select
            value={currentRelease}
            onChange={(e) => setParam("release", e.target.value)}
            className="min-w-0 flex-1 rounded border border-borderb bg-surface px-2 py-1.5 text-sm text-darktext sm:flex-none"
          >
            {RELEASES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 items-center gap-2 text-sm text-secondary sm:flex-none">
          Category
          <select
            value={currentCategory}
            onChange={(e) => setParam("category", e.target.value)}
            className="min-w-0 flex-1 rounded border border-borderb bg-surface px-2 py-1.5 text-sm text-darktext sm:flex-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 items-center gap-2 text-sm text-secondary sm:flex-none">
          Network Layer
          <select
            value={currentNetworkLayer}
            onChange={(e) => setParam("network_layer", e.target.value)}
            className="min-w-0 flex-1 rounded border border-borderb bg-surface px-2 py-1.5 text-sm text-darktext sm:flex-none"
          >
            {NETWORK_LAYERS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex w-full items-center justify-center gap-1 rounded border border-borderb p-1 sm:ml-auto sm:w-auto">
          {["All", "TS", "TR"].map((t) => (
            <button
              key={t}
              onClick={() => setParam("type", t)}
              className={`rounded px-3 py-1 text-sm font-medium transition ${
                currentType === t ? "bg-primary text-white" : "text-secondary hover:bg-offwhite"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-secondary">Generation:</span>
        {GENERATIONS.map((g) => (
          <button
            key={g}
            onClick={() => onGenerationChange(g)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition ${
              currentGeneration === g
                ? "bg-accent text-black"
                : "border border-borderb text-secondary hover:border-primary"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
