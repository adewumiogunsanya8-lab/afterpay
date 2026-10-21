"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS, isSortKey } from "@/lib/search";
import { cn } from "@/lib/cn";

/** Sort dropdown. Writes the choice to the URL so results stay shareable. */
export function SortSelect({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function onChange(next: string) {
    const search = new URLSearchParams(params.toString());
    if (next === "recommended") search.delete("sort");
    else search.set("sort", next);
    search.delete("page");
    const query = search.toString();
    router.push(query ? `?${query}` : window.location.pathname, { scroll: false });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="sort-select" className="text-xs font-medium text-ink-600">
        Sort
      </label>
      <select
        id="sort-select"
        value={isSortKey(value) ? value : "recommended"}
        onChange={(event) => onChange(event.target.value)}
        className="field h-10 w-auto py-1.5 pr-8 text-sm font-medium"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
