"use client";

import { primeMarkets, type MarketMap } from "@/lib/markets";
import { createContext, useContext, type ReactNode } from "react";

/**
 * Client provider for the storefront's market.
 *
 * The root layout is a Server Component, so it reads the `markets` table and
 * passes the row down as a serialisable prop. This provider ships that data to
 * the browser and primes the synchronous cache in `lib/markets.ts` so helpers
 * like `formatMoney` can read it without becoming async or hook-based.
 *
 * The store is US-only, so there is nothing to switch between; the provider
 * exists purely to deliver the database-backed configuration.
 */
type MarketsContextValue = {
  market: MarketMap["US"];
};

const MarketsContext = createContext<MarketsContextValue | null>(null);

export function MarketsProvider({
  markets,
  children,
}: {
  markets: MarketMap;
  children: ReactNode;
}) {
  // Primes `lib/markets.ts` during this render, before any child reads it.
  primeMarkets(markets);

  const value: MarketsContextValue = { market: markets.US };
  return <MarketsContext.Provider value={value}>{children}</MarketsContext.Provider>;
}

/**
 * Reads the market from context.
 *
 * Prefer `getMarket()` from `lib/markets.ts` for plain data access; this hook
 * exists for components that want the value directly.
 */
export function useMarket(): MarketMap["US"] {
  const value = useContext(MarketsContext);
  if (!value) {
    throw new Error("useMarket must be used inside <MarketsProvider> (see app/layout.tsx).");
  }
  return value.market;
}
