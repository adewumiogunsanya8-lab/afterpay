import { getMarket } from "@/lib/markets";

/**
 * Formats an amount in the storefront's currency, e.g. `$1,199.99`.
 *
 * The locale and currency come from the `markets` table via the cache in
 * `lib/markets.ts`, which the root layout primes before rendering.
 */
export function formatMoney(amount: number): string {
  const market = getMarket();
  return new Intl.NumberFormat(market.locale, {
    style: "currency",
    currency: market.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Formats an amount without the currency symbol, e.g. `1,199.99`. */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat(getMarket().locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Formats a product's selling price. */
export function formatProductPrice(price: number): string {
  return formatMoney(price);
}

/** Rounds to 2 decimals, avoiding binary float drift in installment math. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Turns a title into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
