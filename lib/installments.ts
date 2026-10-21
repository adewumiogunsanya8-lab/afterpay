import { round2 } from "@/lib/format";
import type { Product, ProductInstallment } from "@/data/types";

/**
 * FINANCING MATH.
 *
 * This module calculates monthly estimates and sample schedules from product
 * prices and configured payment periods.
 */

/** The installment periods the calculator offers. */
export const INSTALLMENT_PERIODS = [3, 6, 9, 12] as const;

export type InstallmentPeriod = (typeof INSTALLMENT_PERIODS)[number];

/** Picks the periods a given price supports. */
export function periodsForPrice(price: number): InstallmentPeriod[] {
  if (price >= 400) return [...INSTALLMENT_PERIODS];
  if (price >= 150) return [3, 6, 9];
  return [3];
}

/**
 * Builds the installment config for a product price.
 * `forceIneligible` is used by seeds that are explicitly excluded.
 */
export function buildInstallmentConfig(
  priceUsd: number,
  forceIneligible = false,
): ProductInstallment {
  const availableMonths = periodsForPrice(priceUsd);
  return {
    eligible: !forceIneligible && priceUsd >= 50,
    suggestedMonths: availableMonths[availableMonths.length - 1],
    availableMonths,
    minAmountUsd: 50,
  };
}

export type ScheduleRow = {
  /** 1-based payment number. */
  index: number;
  /** ISO date assigned to a scheduled payment. */
  date: string;
  amount: number;
  label: string;
};

/**
 * Splits a total into `months` equal payments. The final row absorbs the
 * rounding remainder so the schedule always sums back to `total`.
 */
export function buildSchedule(
  total: number,
  months: number,
  startDate: Date = new Date("2026-01-01T00:00:00.000Z"),
): ScheduleRow[] {
  if (months <= 0) return [];
  const perMonth = round2(total / months);
  const rows: ScheduleRow[] = [];
  for (let index = 1; index <= months; index += 1) {
    const date = new Date(startDate);
    date.setUTCMonth(date.getUTCMonth() + index);
    const isLast = index === months;
    const amount = isLast ? round2(total - perMonth * (months - 1)) : perMonth;
    rows.push({
      index,
      date: date.toISOString().slice(0, 10),
      amount,
      label: isLast && amount !== perMonth ? "Final payment" : `Payment ${index}`,
    });
  }
  return rows;
}

/** Monthly amount for a total and period. */
export function monthlyAmount(total: number, months: number): number {
  return round2(total / Math.max(months, 1));
}

export type InstallmentQuote = {
  total: number;
  months: number;
  monthly: number;
  schedule: ScheduleRow[];
  savingsLabel: string;
};

/** Full quote used by the calculator, product page and cart. */
export function quoteInstallment(total: number, months: number): InstallmentQuote {
  const symbol = "$";
  const monthly = monthlyAmount(total, months);
  return {
    total: round2(total),
    months,
    monthly,
    schedule: buildSchedule(total, months),
    savingsLabel:
      months === 0
        ? `Pay ${symbol}${round2(total).toFixed(2)} today`
        : `${months} payments of ${symbol}${monthly.toFixed(2)} — 0% interest`,
  };
}

/** The lowest monthly figure across a product's supported periods. */
export function lowestMonthlyFor(
  product: Product,
  quantity = 1,
): number | null {
  if (!product.installment.eligible) return null;
  const total = product.price * quantity;
  if (total < product.installment.minAmountUsd) return null;
  const periods = product.installment.availableMonths;
  return monthlyAmount(total, periods[periods.length - 1]);
}
