"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const isApiError = /spec API|API request failed/i.test(error.message);

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-xl rounded-lg border border-bordera bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold text-darktext">
          {isApiError ? "Spec data is unavailable" : "Something went wrong"}
        </h1>
        <p className="mt-3 text-secondary">
          {isApiError
            ? "The specification API is not reachable right now, so this page has no data to show."
            : "An unexpected error occurred while rendering this page."}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent hover:text-onaccent"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
