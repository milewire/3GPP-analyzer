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
  if (series === "21" || series === "30" || series === "50") return "General";
  if (series === "22" || series === "42") return "Service";
  if (series === "26" || series === "46") return "Codecs & Media";
  if (series === "27" || series === "47") return "Data";
  if (series === "28" || series === "32" || series === "48" || series === "52") return "Management";
  if (series === "31" || series === "51") return "Subscriber Identity";
  if (series === "34") return "Conformance Testing";
  if (["41", "43", "44", "45", "49"].includes(series)) return "GSM/EDGE";
  if (/^20[1-9]$|^21[1-5]$/.test(suffix)) return "Physical Layer";
  if (/^32[1-3]$|^331$|^413$|^423$|^473$/.test(suffix)) return "Protocol";
  if (/^300$|^401$|^501$|^502$|^503$/.test(suffix)) return "Architecture";
  if (series === "33") return "Security";
  if (series === "22") return "Service";
  return "Architecture";
}

function layerForSeries(series) {
  if (series === "33") return "Security";
  if (series === "35" || series === "55") return "Security";
  if (series === "22" || series === "42") return "Service";
  if (series === "26" || series === "46") return "Media";
  if (series === "27" || series === "47") return "Data";
  if (["28", "32", "48", "52"].includes(series)) return "Management";
  if (["31", "51"].includes(series)) return "Subscriber Identity";
  if (series === "34") return "Testing";
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

  if (["21", "30", "50"].includes(s)) {
    return { technology: "3GPP System", category, network_layer: "General" };
  }
  if (s === "22" || s === "42") {
    return { technology: "3GPP Services", category, network_layer };
  }
  if (s === "26" || s === "46") {
    return { technology: "Codecs & Media", category, network_layer };
  }
  if (s === "27" || s === "47") {
    return { technology: "Data Services", category, network_layer };
  }
  if (["28", "32", "48", "52"].includes(s)) {
    return { technology: "OAM & Charging", category, network_layer };
  }
  if (s === "31" || s === "51") {
    return { technology: "UICC & Smart Cards", category, network_layer };
  }
  if (s === "34") {
    return { technology: "Conformance Testing", category, network_layer };
  }
  if (["41", "43", "44", "45", "49"].includes(s)) {
    return { technology: "GSM/EDGE", category, network_layer: "GSM Network" };
  }
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
      technology: "Multi-RAT",
      category,
      network_layer,
    };
  }
  if (s === "33" || s === "35" || s === "55") {
    return { technology: "Security", category: "Security", network_layer: "Security" };
  }
  if (["23", "29"].includes(s)) {
    if (rel >= 15) return { technology: "5GC", category, network_layer: "Core Network" };
    if (rel >= 8) return { technology: "EPC", category, network_layer: "Core Network" };
    return { technology: "UMTS", category, network_layer: "Core Network" };
  }
  if (s === "24") {
    return { technology: "IMS", category: "Protocol", network_layer: "Core Network" };
  }
  if (s === "25") {
    return { technology: "UMTS", category, network_layer: "Radio Access Network" };
  }
  return null;
}

module.exports = { classifySpec, releaseNumber };
