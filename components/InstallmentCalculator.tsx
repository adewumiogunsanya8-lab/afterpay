"use client";

import { useState } from "react";
import { CalculatorIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { INSTALLMENT_PERIODS, buildSchedule, monthlyAmount } from "@/lib/installments";
import type { Product } from "@/data/types";

/**
 * Installment calculator: Pay in full / 3 / 6, 9 / 12 months.
 * `monthly payment = price / months`, with the final payment absorbing the
 * rounding remainder. Product configuration controls displayed eligibility.
 */
export function InstallmentCalculator({
  product,
  quantity = 1,
  className,
  compact = false,
}: {
  product: Product;
  quantity?: number;
  className?: string;
  compact?: boolean;
}) {
  const total = product.price * quantity;
  const [months, setMonths] = useState<number>(
    product.installment.eligible ? product.installment.suggestedMonths : 0,
  );

  const eligible = product.installment.eligible;
  const schedule = eligible && months > 0 ? buildSchedule(total, months) : [];
  const monthly = monthlyAmount(total, months);

  return (
    <section
      className={cn("rounded-2xl border border-line bg-white p-4 sm:p-5", className)}
      aria-label="Installment calculator"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-950">
          <CalculatorIcon className="h-4 w-4 text-brand-600" />
          Pay in installments
        </h3>
        <span className="badge bg-brand-50 text-brand-700">Installments</span>
      </div>

      {!eligible ? (
        <p className="mt-3 text-sm text-ink-600">
          This product is not eligible for the installment option. Pay in full at checkout —
          total {formatMoney(total)}.
        </p>
      ) : (
        <>
          <fieldset className="mt-3">
            <legend className="sr-only">Choose a payment period</legend>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, ...INSTALLMENT_PERIODS].map((option) => {
                const active = months === option;
                const disabled =
                  option > 0 && !product.installment.availableMonths.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={disabled}
                    onClick={() => setMonths(option)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl border px-1 py-2 text-xs font-semibold transition",
                      active
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-ink-200 bg-white text-ink-700 hover:border-brand-400 hover:bg-brand-50",
                      disabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {option === 0 ? "Full" : `${option}mo`}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 rounded-xl bg-surface p-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium text-ink-600">
                {months === 0 ? "Due today" : "Monthly payment"}
              </span>
              <span className="text-xl font-bold tabular-nums text-ink-950">
                {formatMoney(months === 0 ? total : monthly)}
                {months > 0 ? <span className="text-xs font-medium text-ink-500"> /mo</span> : null}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              {months === 0
                ? "Paid in full — nothing else to pay later."
                : `${months} payments of ${formatMoney(monthly)}, 0% interest. Total ${formatMoney(total)}.`}
            </p>
          </div>

          {!compact && schedule.length > 0 ? (
            <details className="group mt-3">
              <summary className="cursor-pointer list-none text-xs font-semibold text-brand-700 hover:text-brand-900">
                View the {months}-payment schedule
              </summary>
              <ol className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
                {schedule.map((row) => (
                  <li
                    key={row.index}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs"
                  >
                    <span className="inline-flex items-center gap-2 text-ink-600">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint-100 text-[0.625rem] font-bold text-mint-700">
                        {row.index}
                      </span>
                      {row.label}
                      <span className="text-ink-400">· {row.date}</span>
                    </span>
                    <span className="font-semibold tabular-nums text-ink-900">
                      {formatMoney(row.amount)}
                    </span>
                  </li>
                ))}
              </ol>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}
