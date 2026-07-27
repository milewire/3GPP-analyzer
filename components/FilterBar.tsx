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
    <div className="flex flex-col gap-4 rounded-lg border border-bordera bg-surface p-3 sm:p-4">
      <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <label className="flex flex-col gap-1 text-sm text-secondary sm:flex-row sm:items-center sm:gap-2">
          Release
          <select
            value={currentRelease}
            onChange={(e) => setParam("release", e.target.value)}
            className="w-full min-w-0 rounded border border-borderb bg-surface px-2 py-2.5 text-sm text-darktext sm:w-auto sm:py-1.5"
          >
            {RELEASES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-secondary sm:flex-row sm:items-center sm:gap-2">
          Category
          <select
            value={currentCategory}
            onChange={(e) => setParam("category", e.target.value)}
            className="w-full min-w-0 rounded border border-borderb bg-surface px-2 py-2.5 text-sm text-darktext sm:w-auto sm:py-1.5"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-secondary sm:flex-row sm:items-center sm:gap-2">
          Network Layer
          <select
            value={currentNetworkLayer}
            onChange={(e) => setParam("network_layer", e.target.value)}
            className="w-full min-w-0 rounded border border-borderb bg-surface px-2 py-2.5 text-sm text-darktext sm:w-auto sm:py-1.5"
          >
            {NETWORK_LAYERS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex w-full items-center justify-stretch gap-1 rounded border border-borderb p-1 sm:ml-auto sm:w-auto sm:justify-center">
          {["All", "TS", "TR"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setParam("type", t)}
              className={`flex-1 rounded px-3 py-2 text-sm font-medium transition sm:flex-none sm:py-1 ${
                currentType === t ? "bg-primary text-white" : "text-secondary hover:bg-offwhite"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="w-full text-sm text-secondary sm:w-auto">Generation:</span>
        {GENERATIONS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onGenerationChange(g)}
            className={`rounded-full px-3 py-2 text-sm font-medium transition sm:py-1 ${
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
