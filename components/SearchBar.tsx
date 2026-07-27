"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({
  placeholder = "Search by spec number, title, or technology (e.g. 38.331, RRC, NR)",
  initialValue = "",
  large = false,
}: {
  placeholder?: string;
  initialValue?: string;
  large?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`/specifications/?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl">
      <div className="flex flex-col gap-2 rounded-lg border border-borderb bg-surface p-2 shadow-sm sm:flex-row sm:items-center sm:gap-2 sm:p-0">
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={`w-full min-w-0 flex-1 rounded-md border-none bg-transparent px-3 py-3 text-darktext outline-none sm:rounded-l-lg sm:rounded-r-none sm:px-4 ${
            large ? "text-base sm:text-lg" : "text-base"
          }`}
        />
        <button
          type="submit"
          className="w-full rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent hover:text-black sm:m-1 sm:w-auto sm:py-2.5"
        >
          Search
        </button>
      </div>
    </form>
  );
}
