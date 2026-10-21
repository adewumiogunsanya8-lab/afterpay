"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";

/** Builds a window of page numbers with ellipses: 1 … 4 5 6 … 12 */
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const output: (number | "gap")[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) output.push("gap");
    output.push(page);
    previous = page;
  }
  return output;
}

/** URL-driven pagination for the category and search grids. */
export function Pagination({
  page,
  totalPages,
  className,
}: {
  page: number;
  totalPages: number;
  className?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  function go(next: number) {
    const search = new URLSearchParams(params.toString());
    if (next <= 1) search.delete("page");
    else search.set("page", String(next));
    const query = search.toString();
    router.push(query ? `?${query}` : window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-medium transition";

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={cn(
          base,
          "border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700 disabled:opacity-40",
        )}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {pageWindow(page, totalPages).map((entry, index) =>
        entry === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-ink-400">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => go(entry)}
            aria-current={entry === page ? "page" : undefined}
            aria-label={`Page ${entry}`}
            className={cn(
              base,
              entry === page
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700",
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={cn(
          base,
          "border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:text-brand-700 disabled:opacity-40",
        )}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
