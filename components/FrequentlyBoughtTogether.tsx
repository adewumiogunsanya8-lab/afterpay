"use client";

import { useState } from "react";
import { CheckIcon, SparkleIcon } from "@/components/Icons";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { toCartProduct, useStore } from "@/lib/store";
import type { Product } from "@/data/types";

/**
 * "Frequently bought together" bundle. Ticking accessories updates the running
 * bundle total and the monthly figure instantly.
 */
export function FrequentlyBoughtTogether({
  main,
  extras,
  className,
}: {
  main: Product;
  extras: Product[];
  className?: string;
}) {
  const { addItem } = useStore();
  // Default to the first suggestion selected; the component remounts per product.
  const [selected, setSelected] = useState<string[]>(() =>
    extras.length ? [extras[0].id] : [],
  );

  const chosen = extras.filter((extra) => selected.includes(extra.id));
  const bundleTotal =
    main.price + chosen.reduce((sum, extra) => sum + extra.price, 0);
  const allEligible = main.installment.eligible && chosen.every((extra) => extra.installment.eligible);
  const months = main.installment.suggestedMonths;

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <section
      className={cn("rounded-2xl border border-line bg-white p-4 sm:p-5", className)}
      aria-label="Frequently bought together"
    >
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink-950">
        <SparkleIcon className="h-4 w-4 text-brand-600" />
        Frequently bought together
      </h2>

      <ul className="mt-4 space-y-2">
        <li className="flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50/50 p-2.5">
          <ProductImage src={main.image} alt="" className="h-16 w-20 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-brand-800">This product</p>
            <p className="truncate text-sm font-medium text-ink-900">{main.name}</p>
            <p className="text-xs text-ink-500">{formatMoney(main.price)}</p>
          </div>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
        </li>

        {extras.map((extra) => {
          const active = selected.includes(extra.id);
          return (
            <li key={extra.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition",
                  active
                    ? "border-brand-300 bg-brand-50/50"
                    : "border-line hover:border-brand-200",
                )}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(extra.id)}
                  className="h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                <ProductImage src={extra.image} alt="" className="h-16 w-20 shrink-0 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
                    {extra.brand}
                  </span>
                  <span className="block truncate text-sm font-medium text-ink-900">
                    {extra.name}
                  </span>
                  <span className="block text-xs text-ink-500">
                    {formatMoney(extra.price)}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="text-xs text-ink-500">Bundle total</p>
          <p className="text-lg font-bold tabular-nums text-ink-950">
            {formatMoney(bundleTotal)}
          </p>
          {allEligible ? (
            <p className="text-xs font-medium text-mint-700">
              or {formatMoney(bundleTotal / months)}/month × {months}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={chosen.length === 0}
          onClick={() => [main, ...chosen].forEach((item) => addItem(toCartProduct(item), 1))}
          className="btn btn-primary"
        >
          Add bundle to cart
        </button>
      </div>
    </section>
  );
}
