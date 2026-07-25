/**
 * Heuristic technology / category / layer tagging for ingested specs.
 * Used by ingest and the one-shot backfill script.
 */

function releaseNumber(release) {
  if (!release) return 0;
  if (release === "R99" || release === "Rel-99") return 99;
  const m = /^Rel-(\d+)$/i.exec(release);
  return m ? parseInt(m[1], 10) : 0;
}

function categoryForSpec(specId, series) {
  const suffix = (specId || "").split(".")[1] || "";
  if (/^20[1-9]$|^21[1-5]$/.test(suffix)) return "Physical Layer";
  if (/^32[1-3]$|^331$|^413$|^423$|^473$/.test(suffix)) return "Protocol";
  if (/^300$|^401$|^501$|^502$|^503$/.test(suffix)) return "Architecture";
  if (series === "33") return "Security";
  if (series === "22") return "Service";
  return "Architecture";
}

function layerForSeries(series) {
  if (series === "33") return "Security";
  if (series === "22") return "Service";
  if (["23", "24", "29"].includes(series)) return "Core Network";
  return "Radio Access Network";
}

/**
 * @returns {{ technology: string, category: string, network_layer: string } | null}
 */
function classifySpec({ series, release, spec_id }) {
  const s = String(series || "");
  const rel = releaseNumber(release);
  const category = categoryForSpec(spec_id, s);
  const network_layer = layerForSeries(s);

  if (s === "38") {
    return {
      technology: rel >= 18 ? "5G-Advanced" : "5G NR",
      category,
      network_layer,
    };
  }
  if (s === "36") {
    let technology = "LTE";
    if (rel >= 13) technology = "LTE-Advanced Pro";
    else if (rel >= 10) technology = "LTE-Advanced";
    return { technology, category, network_layer };
  }
  if (s === "37") {
    return {
      technology: rel >= 15 ? "5G NR" : "LTE",
      category,
      network_layer,
    };
  }
  if (s === "33") {
    return { technology: "Security", category: "Security", network_layer: "Security" };
  }
  if (s === "23" || s === "29") {
    if (rel >= 15) return { technology: "5GC", category, network_layer: "Core Network" };
    if (rel >= 8) return { technology: "EPC", category, network_layer: "Core Network" };
    return { technology: "UMTS", category, network_layer: "Core Network" };
  }
  if (s === "24") {
    return { technology: "IMS", category: "Protocol", network_layer: "Core Network" };
  }
  if (s === "22") {
    return {
      technology: rel >= 15 ? "5G NR" : rel >= 8 ? "LTE" : "UMTS",
      category: "Service",
      network_layer: "Service",
    };
  }
  if (s === "25") {
    return { technology: "UMTS", category, network_layer: "Radio Access Network" };
  }
  return null;
}

module.exports = { classifySpec, releaseNumber };
