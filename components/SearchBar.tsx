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
      <div className="flex items-center gap-2 rounded-lg border border-borderb bg-surface shadow-sm">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={`w-full flex-1 rounded-l-lg border-none bg-transparent px-4 py-3 text-darktext outline-none ${
            large ? "text-lg" : "text-base"
          }`}
        />
        <button
          type="submit"
          className="m-1 rounded-md bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-accent hover:text-black"
        >
          Search
        </button>
      </div>
    </form>
  );
}
