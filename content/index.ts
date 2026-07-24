import type { TechSection } from "./types";
import { lteSections } from "./technology-lte";
import { nrSections } from "./technology-5g";
import { lteAdvancedSections } from "./technology-lte-advanced";

const CONTENT_MAP: Record<string, TechSection[]> = {
  lte: lteSections,
  "5g": nrSections,
  "lte-advanced": lteAdvancedSections,
};

export function getTechContent(slug: string): TechSection[] | null {
  return CONTENT_MAP[slug] || null;
}

export const RELEASE_YEARS: Record<string, string> = {
  R99: "2000", "Rel-2": "2000", "Rel-4": "2001", "Rel-5": "2003", "Rel-6": "2005",
  "Rel-7": "2007", "Rel-8": "2008", "Rel-9": "2009", "Rel-10": "2011", "Rel-11": "2012",
  "Rel-12": "2015", "Rel-13": "2016", "Rel-14": "2017", "Rel-15": "2018", "Rel-16": "2020",
  "Rel-17": "2022", "Rel-18": "2024", "Rel-19": "2025", "Rel-20": "2026",
};

export const TECH_RELEASE_TAGS: Record<string, string[]> = {
  lte: ["Rel-8", "Rel-9"],
  "5g": ["Rel-15", "Rel-16", "Rel-17"],
  "lte-advanced": ["Rel-10", "Rel-11"],
};
