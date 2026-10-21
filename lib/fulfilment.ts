import { getMarket } from "@/lib/markets";
import { round2 } from "@/lib/format";

/**
 * Shipping and estimated tax.
 *
 * The rates come from the `markets` table (via the cache in `lib/markets.ts`)
 * and are labelled as estimates in the UI. The store is US-only, so nothing
 * here takes a market argument.
 */

export type ShippingMethodId = "standard" | "express";

export type ShippingMethod = {
  id: ShippingMethodId;
  name: string;
  description: string;
  days: string;
  price: number;
};

export function shippingMethods(): ShippingMethod[] {
  const market = getMarket();
  return [
    {
      id: "standard",
      name: "Standard shipping",
      description: "Tracked, carbon-offset delivery",
      days: market.standardDeliveryDays,
      price: market.standardShipping,
    },
    {
      id: "express",
      name: "Express shipping",
      description: "Priority handling, upgraded tracking",
      days: market.expressDeliveryDays,
      price: market.expressShipping,
    },
  ];
}

export function shippingPrice(method: ShippingMethodId, subtotal: number): number {
  const market = getMarket();
  if (method === "express") return market.expressShipping;
  return subtotal >= market.freeShippingThreshold ? 0 : market.standardShipping;
}

export type OrderTotals = {
  subtotal: number;
  itemCount: number;
  savings: number;
  shipping: number;
  freeShipping: boolean;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  tax: number;
  total: number;
  taxLabel: string;
  shippingLabel: string;
};

/** Estimated tax applied to merchandise + shipping. */
export function estimateTax(subtotal: number, shipping: number): number {
  return round2((subtotal + shipping) * getMarket().estimatedTaxRate);
}

export type TotalsInput = {
  subtotal: number;
  savings: number;
  itemCount: number;
  method: ShippingMethodId;
};

/** Builds every figure the cart and checkout show. */
export function calculateTotals({
  subtotal,
  savings,
  itemCount,
  method,
}: TotalsInput): OrderTotals {
  const market = getMarket();
  const shipping = shippingPrice(method, subtotal);
  const freeShippingRemaining = Math.max(0, round2(market.freeShippingThreshold - subtotal));
  const tax = estimateTax(subtotal, shipping);
  return {
    subtotal: round2(subtotal),
    itemCount,
    savings: round2(savings),
    shipping: round2(shipping),
    freeShipping: shipping === 0 && method === "standard",
    freeShippingRemaining,
    freeShippingProgress: Math.min(
      100,
      Math.round((subtotal / market.freeShippingThreshold) * 100),
    ),
    tax,
    total: round2(subtotal + shipping + tax),
    taxLabel: market.estimatedTaxLabel,
    shippingLabel:
      method === "express" ? `${market.name} express` : `${market.name} standard`,
  };
}
