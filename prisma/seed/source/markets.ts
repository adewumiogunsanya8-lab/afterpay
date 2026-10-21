import type { CountryCode, Market } from "@/data/types";

/**
 * The storefront's single market: United States, US dollars.
 *
 * The store is US-only, so this is a one-entry record rather than a
 * multi-market table. It is still seeded into the `markets` table so tax,
 * shipping thresholds and delivery copy stay in the database rather than in
 * code.
 */
export const MARKETS: Record<CountryCode, Market> = {
  US: {
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
      freeReturnsNote: "Free returns to any of 500+ US drop-off points",
      installmentNote: "",
    },
  },
};
