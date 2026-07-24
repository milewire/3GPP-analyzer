const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT =
  "You are a senior RAN engineer with 20+ years of experience across LTE and 5G NR on Ericsson, Nokia, and Samsung platforms. " +
  "Provide concise, technically precise summaries of 3GPP specifications for experienced engineers. No marketing language. " +
  "Focus on what the spec actually specifies — the key procedures and interfaces it defines — and when an engineer would need " +
  "to reference it during network design, integration, or troubleshooting. Keep it under 250 words.";

export interface SpecSummaryInput {
  specId: string;
  title: string;
}

export interface SpecSummaryResult {
  summary: string;
  relevanceScore: number;
}

export async function generateSpecSummary(
  input: SpecSummaryInput,
  apiKey: string
): Promise<SpecSummaryResult> {
  const userMessage = `Summarize 3GPP ${input.specId}: '${input.title}'. What does it specify, what are the key procedures and interfaces, and when would a RAN engineer use it?`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
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

  const relevanceScore = deriveRelevanceScore(summary);

  return { summary, relevanceScore };
}

function deriveRelevanceScore(summary: string): number {
  const length = summary.length;
  if (length > 900) return 95;
  if (length > 600) return 88;
  if (length > 300) return 80;
  return 70;
}
