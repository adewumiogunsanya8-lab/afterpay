"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Category } from "@/data/types";

/**
 * Client access to the category list.
 *
 * Categories live in Postgres, but the header, hero, category dropdown and cart
 * page all need the list synchronously in the browser. The root layout fetches
 * the rows on the server and provides them here, mirroring how markets are
 * handled in `lib/markets.tsx`.
 *
 * Only the flat, static fields are shipped - the per-category aggregates
 * (product counts, prices) are computed on the server and passed separately by
 * the components that display them.
 */
type CatalogueContextValue = {
  categories: Category[];
};

const CatalogueContext = createContext<CatalogueContextValue | null>(null);

export function CatalogueProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: ReactNode;
}) {
  return (
    <CatalogueContext.Provider value={{ categories }}>
      {children}
    </CatalogueContext.Provider>
  );
}

/** The category list, in site order. */
export function useCategories(): Category[] {
  const value = useContext(CatalogueContext);
  if (!value) {
    throw new Error("useCategories must be used inside <CatalogueProvider> (see app/layout.tsx).");
  }
  return value.categories;
}
