"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CheckIcon, FilterIcon, StarIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { useStore } from "@/lib/store";

/**
 * Category-page filter panel. All filter state lives in the URL so results are
 * shareable, bookmarkable and server-rendered.
 *
 * Must be rendered inside a <Suspense> boundary because it reads search params.
 */
export function ProductFilters({
  brands,
  priceBounds,
  className,
}: {
  brands: string[];
  priceBounds: { min: number; max: number };
  className?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { market } = useStore();
  const symbol = "$";

  const selectedBrands = params.get("brand")?.split(",").filter(Boolean) ?? [];
  const minPrice = params.get("min");
  const maxPrice = params.get("max");
  const minRating = params.get("rating");
  const minDiscount = params.get("discount");
  const inStockOnly = params.get("stock") === "1";
  const installmentsOnly = params.get("installments") === "1";

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      next.delete("page");
      const query = next.toString();
      router.push(query ? `?${query}` : window.location.pathname, { scroll: false });
    },
    [params, router],
  );

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((item) => item !== brand)
      : [...selectedBrands, brand];
    update("brand", next.length ? next.join(",") : null);
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    Boolean(minPrice || maxPrice || minRating || minDiscount || inStockOnly || installmentsOnly);

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-950">
          <FilterIcon className="h-4 w-4 text-brand-600" />
          Filters
        </h2>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={() => router.push(window.location.pathname, { scroll: false })}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <fieldset>
        <legend className="label">Price</legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="filter-min-price">
            Minimum price
          </label>
          <input
            id="filter-min-price"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={`Min ${symbol}${Math.floor(priceBounds.min)}`}
            defaultValue={minPrice ?? ""}
            onBlur={(event) => update("min", event.target.value)}
            className="field h-10 py-1.5 text-sm"
          />
          <span className="text-ink-400">–</span>
          <label className="sr-only" htmlFor="filter-max-price">
            Maximum price
          </label>
          <input
            id="filter-max-price"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={`Max ${symbol}${Math.ceil(priceBounds.max)}`}
            defaultValue={maxPrice ?? ""}
            onBlur={(event) => update("max", event.target.value)}
            className="field h-10 py-1.5 text-sm"
          />
        </div>
        <p className="mt-1.5 text-[0.6875rem] text-ink-400">
          Catalogue range: {formatMoney(priceBounds.min)} –{" "}
          {formatMoney(priceBounds.max)} in {market.name}
        </p>
      </fieldset>

      <fieldset>
        <legend className="label">Rating</legend>
        <div className="flex flex-wrap gap-1.5">
          {[4.5, 4, 3.5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => update("rating", minRating === String(rating) ? null : String(rating))}
              aria-pressed={minRating === String(rating)}
              className={cn("chip", minRating === String(rating) && "chip-active")}
            >
              <StarIcon className="h-3.5 w-3.5 text-ember-500" filled />
              {rating} &amp; up
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Discount</legend>
        <div className="flex flex-wrap gap-1.5">
          {[10, 20, 25].map((discount) => (
            <button
              key={discount}
              type="button"
              onClick={() =>
                update("discount", minDiscount === String(discount) ? null : String(discount))
              }
              aria-pressed={minDiscount === String(discount)}
              className={cn("chip", minDiscount === String(discount) && "chip-active")}
            >
              {discount}% or more
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Availability</legend>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => update("stock", event.target.checked ? "1" : null)}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            In stock only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={installmentsOnly}
              onChange={(event) => update("installments", event.target.checked ? "1" : null)}
              className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="inline-flex items-center gap-1.5">
              Pay in installments eligible
              <span className="badge bg-mint-100 text-mint-700">Installments</span>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Brand</legend>
        <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {brands.map((brand) => {
            const checked = selectedBrands.includes(brand);
            return (
              <li key={brand}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition",
                    checked ? "bg-brand-50 text-brand-900" : "text-ink-700 hover:bg-ink-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand)}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="flex-1">{brand}</span>
                  {checked ? <CheckIcon className="h-3.5 w-3.5 text-brand-600" /> : null}
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}
