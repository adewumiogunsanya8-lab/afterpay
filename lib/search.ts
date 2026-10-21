import type { Product } from "@/data/types";

/**
 * Client-safe listing helpers: sorting and autocomplete payload shaping.
 *
 * This module deliberately has no database imports, because `components/SortSelect.tsx`
 * imports it from the client. Anything that needs to *fetch* products, filter
 * them or search the catalogue lives in `lib/catalogue.ts` (server-only) and
 * produces plain `Product[]` values that are then sorted here.
 */

export type SortKey =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating"
  | "discount";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "newest", label: "Newest" },
  { key: "rating", label: "Best Rated" },
  { key: "discount", label: "Biggest Discount" },
];

export function isSortKey(value: string | null | undefined): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value);
}

/**
 * Sorts a product list for the category / search pages.
 *
 * Sorting stays in the application because a category only ever holds ~20
 * products, so the extra round trip of ordering in SQL is not worth it.
 */
export function sortProducts(
  products: Product[],
  sort: SortKey,
): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "newest":
      return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "discount":
      return list.sort((a, b) => b.discountPercent - a.discountPercent);
    default:
      return list.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          b.rating * 100 + b.popularity - (a.rating * 100 + a.popularity),
      );
  }
}

/** Autocomplete payload — trimmed fields only, to keep responses small. */
export type Suggestion = {
  slug: string;
  name: string;
  brand: string;
  categoryName: string;
  categorySlug: string;
  image: string;
  price: number;
  installmentsEligible: boolean;
  suggestedMonths: number;
};

export function buildSuggestions(products: Product[]): Suggestion[] {
  return products.map((product) => ({
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    categoryName: product.categoryName,
    categorySlug: product.categorySlug,
    image: product.image,
    price: product.price,
    installmentsEligible: product.installment.eligible,
    suggestedMonths: product.installment.suggestedMonths,
  }));
}
