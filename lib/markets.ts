import type { CountryCode, Market } from "@/data/types";

/**
 * Synchronous access to the storefront's market configuration.
 *
 * The market rows live in Postgres, which is asynchronous, but `formatMoney`,
 * `calculateTotals` and the price displays all need them *synchronously* while
 * rendering.
 *
 * This module is a tiny cache over the DB rows. It is safe as a module-level
 * cache because the market is global reference data: the same row is served to
 * every visitor, so there is no per-request state to leak between concurrent
 * renders. The cache is primed:
 *
 *  - on the server, by the root layout before it renders its children, and
 *  - in the browser, by `MarketsProvider` before its children render.
 *
 * Both happen during the first render, so the server HTML and the first client
 * render always agree and there is no hydration mismatch.
 *
 * The store is US-only, so `getMarket()` takes no argument. A multi-market
 * store would key this cache by country and take the code as a parameter.
 */

export type MarketMap = Record<CountryCode, Market>;

/**
 * Temporary storefront settings used only until an operator creates the US
 * market in the admin dashboard. These values are never written to the DB.
 */
export const BOOTSTRAP_MARKET: Market = {
  code: "US",
  name: "United States",
  shortName: "US",
  flag: "🇺🇸",
  currency: "USD",
  currencySymbol: "$",
  locale: "en-US",
  standardShipping: 4.99,
  expressShipping: 14.99,
  freeShippingThreshold: 75,
  estimatedTaxRate: 0.0825,
  estimatedTaxLabel: "Estimated sales tax",
  standardDeliveryDays: "3–5 business days",
  expressDeliveryDays: "1–2 business days",
  returnsSummary: "Free 30-day returns",
  messaging: {
    shippingNote: "Free standard shipping on orders over $75",
    freeReturnsNote: "Free 30-day returns",
    installmentNote: "Choose an installment plan at checkout.",
  },
};

let registry: MarketMap | null = null;

/** Publishes the market row to the synchronous accessors below. */
export function primeMarkets(markets: MarketMap): void {
  registry = markets;
}

const NOT_LOADED =
  "The market is not loaded yet. Fetch it in the root layout and pass it to " +
  "<MarketsProvider> before any component calls getMarket().";

/** The storefront's market. */
export function getMarket(): Market {
  if (!registry) throw new Error(NOT_LOADED);
  return registry.US;
}
