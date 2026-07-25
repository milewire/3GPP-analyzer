"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export default function AISummary({
  specId,
  release,
  initialSummary,
  initialGeneratedAt,
  initialRelevanceScore,
}: {
  specId: string;
  release: string;
  initialSummary: string | null;
  initialGeneratedAt: string | null;
  initialRelevanceScore: number | null;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt);
  const [relevanceScore, setRelevanceScore] = useState(initialRelevanceScore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ specId, release });
      const res = await fetch(`${API_URL}/api/ai-summary?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");
      setSummary(data.summary);
      setGeneratedAt(data.generated_at);
      setRelevanceScore(data.relevance_score);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-bordera bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-darktext">
          <span aria-hidden>✨</span> AI Summary
        </h2>
        {relevanceScore !== null && relevanceScore !== undefined && (
          <span
            title="AI relevance score reflects estimated summary depth and confidence based on the generated response."
            className="inline-flex cursor-help items-center rounded border border-primary px-2 py-0.5 text-xs font-semibold text-primary"
          >
            Relevance {relevanceScore}
          </span>
        )}
      </div>

      {summary ? (
        <div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-secondary">{summary}</p>
          {generatedAt && (
            <p className="mt-3 text-xs text-muted">
              Generated {new Date(generatedAt).toLocaleDateString()} · cached for 90 days
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm text-secondary">
            No AI summary has been generated for this specification yet.
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate AI Summary"}
          </button>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
