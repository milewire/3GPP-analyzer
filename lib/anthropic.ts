const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT =
  "You are a senior RAN engineer summarizing 3GPP specifications for other experienced engineers. " +
  "Be concise and technically precise. No marketing language, no markdown tables, no disclaimer banners. " +
  "Use only the official 3GPP Scope excerpt and the supplied metadata. Do not invent procedures, IEs, " +
  "message names, working groups, or cross-references that are not in the excerpt. Keep it under 180 words.";

export interface SpecSummaryInput {
  specId: string;
  title: string;
  release: string;
  type?: string | null;
  technology?: string | null;
  sourceUrl?: string | null;
  sourceExcerpt?: string | null;
}

export interface SpecSummaryResult {
  summary: string;
  relevanceScore: number;
  grounded: boolean;
}

/** Short honest fallback used when no official Scope excerpt is stored. */
export function metadataOnlySummary(input: SpecSummaryInput): SpecSummaryResult {
  const parts = [
    `${input.specId} (${input.release}): ${input.title}.`,
    "No official Scope excerpt is stored for this version yet, so this is catalog metadata only.",
  ];
  if (input.type) parts.push(`Document type: ${input.type}.`);
  if (input.technology) parts.push(`Catalog technology tag: ${input.technology}.`);
  parts.push(
    input.sourceUrl
      ? `Open the official document from the 3GPP archive linked on this page for normative procedures and interfaces.`
      : `Consult the official 3GPP specification for normative procedures and interfaces.`
  );

  return {
    summary: parts.join(" "),
    relevanceScore: 40,
    grounded: false,
  };
}

export async function generateSpecSummary(
  input: SpecSummaryInput,
  apiKey: string
): Promise<SpecSummaryResult> {
  const source = input.sourceExcerpt?.trim();
  if (!source) {
    return metadataOnlySummary(input);
  }

  const userMessage = `Summarize 3GPP ${input.specId} (${input.release}): "${input.title}".

Official 3GPP Scope excerpt:
---
${source}
---

Write 2 short paragraphs:
1) What the Scope says this specification covers.
2) When a RAN/core engineer would open it.

Only mention procedures or interfaces if the excerpt explicitly supports them.`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    content: { type: string; text: string }[];
  };

  const summary = data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return {
    summary,
    relevanceScore: deriveRelevanceScore(summary),
    grounded: true,
  };
}

function deriveRelevanceScore(summary: string): number {
  const length = summary.length;
  if (length > 900) return 95;
  if (length > 600) return 88;
  if (length > 300) return 80;
  return 70;
}
