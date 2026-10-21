"use client";

import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import type { Suggestion } from "@/lib/search";

/** Autocomplete dropdown for {@link SearchBar}. */
export function SearchSuggestions({
  listboxId,
  suggestions,
  categories,
  activeIndex,
  onActivate,
  onDismiss,
  onNavigate,
}: {
  listboxId: string;
  suggestions: Suggestion[];
  categories: { slug: string; name: string }[];
  activeIndex: number;
  onActivate: (index: number) => void;
  onDismiss: () => void;
  onNavigate?: () => void;
}) {

  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-label="Search suggestions"
      className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-lift"
    >
      {suggestions.map((item, index) => (
        <li key={item.slug} role="none">
          <Link
            id={`${listboxId}-option-${index}`}
            role="option"
            aria-selected={activeIndex === index}
            href={`/product/${item.slug}`}
            onClick={onNavigate}
            onMouseEnter={() => onActivate(index)}
            className={cn(
              "flex items-center gap-3 rounded-xl p-2 transition",
              activeIndex === index ? "bg-brand-50" : "hover:bg-ink-50",
            )}
          >
            <ProductImage src={item.image} alt="" className="h-12 w-16 shrink-0 rounded-lg" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink-900">{item.name}</span>
              <span className="block truncate text-xs text-ink-500">
                {item.brand} · {item.categoryName}
              </span>
            </span>
            <span className="shrink-0 text-right text-xs">
              <span className="block font-semibold text-ink-900">
                {formatMoney(item.price)}
              </span>
              {item.installmentsEligible ? (
                <span className="block text-mint-700">
                  or ${(item.price / item.suggestedMonths).toFixed(2)}/mo
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}

      {categories.length > 0 ? (
        <li className="mt-1 border-t border-line pt-1" role="none">
          <p className="px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
            Categories
          </p>
          {categories.map((item, offset) => {
            const index = suggestions.length + offset;
            return (
              <Link
                key={item.slug}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                href={`/category/${item.slug}`}
                onClick={onDismiss}
                onMouseEnter={() => onActivate(index)}
                className={cn(
                  "block rounded-xl px-3 py-2 text-sm transition",
                  activeIndex === index
                    ? "bg-brand-50 text-brand-900"
                    : "text-ink-700 hover:bg-ink-50",
                )}
              >
                Browse all {item.name}
              </Link>
            );
          })}
        </li>
      ) : null}
    </ul>
  );
}
