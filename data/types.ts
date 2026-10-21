/**
 * Core domain types for the FlexiBuy storefront.
 *
 * The store is US-only and quotes in USD, so `CountryCode` and `CurrencyCode`
 * each have a single member. They are kept as named types (rather than being
 * inlined) because they mirror the database enums of the same name.
 */

/** The market the storefront serves. */
export type CountryCode = "US";

export type CurrencyCode = "USD";

/** The storefront's market: currency, tax rate and fulfilment rules. */
export type Market = {
  code: CountryCode;
  /** Name shown in the country selector. */
  name: string;
  shortName: string;
  flag: string;
  currency: CurrencyCode;
  currencySymbol: string;
  /** Intl locale used for price formatting. */
  locale: string;
  /** Flat standard shipping price, in local currency. */
  standardShipping: number;
  /** Express shipping price, in local currency. */
  expressShipping: number;
  /** Order subtotal (local currency) above which standard shipping is free. */
  freeShippingThreshold: number;
  /** Estimated tax rate applied to (subtotal + shipping). */
  estimatedTaxRate: number;
  /** Human label for the estimated tax row. */
  estimatedTaxLabel: string;
  /** Days shown in the delivery estimates. */
  standardDeliveryDays: string;
  expressDeliveryDays: string;
  /** Returns copy shown in the UI. */
  returnsSummary: string;
  /** Storefront-wide marketing / compliance copy. */
  messaging: {
    shippingNote: string;
    freeReturnsNote: string;
    installmentNote: string;
  };
};

export type ProductSpec = {
  label: string;
  value: string;
};

/** Installment (BNPL) configuration attached to every product. */
export type ProductInstallment = {
  /** Whether this product may be shown with a "Pay in installments" option. */
  eligible: boolean;
  /** The period highlighted on the product page by default. */
  suggestedMonths: number;
  /** Installment periods the calculator offers for this product. */
  availableMonths: number[];
  /** Smallest order value the calculator will split, in USD. */
  minAmountUsd: number;
};

export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  /** Selling price in USD. */
  price: number;
  /** Pre-discount "was" price in USD. */
  originalPrice: number;
  /** 0 when there is no discount, otherwise 5–60. */
  discountPercent: number;
  /** Main product image. */
  image: string;
  /** Main image + 3 gallery images. */
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  featured: boolean;
  isNew: boolean;
  installment: ProductInstallment;
  specs: ProductSpec[];
  /** ISO date used for "Newest" sorting. */
  createdAt: string;
  /** Deterministic 0–100 popularity score used for "Recommended" sorting. */
  popularity: number;
  /** Deterministic sales count used for "Best Sellers". */
  soldCount: number;
  color: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  /** Short line used on category cards. */
  tagline: string;
  /** Longer description shown at the top of the category page. */
  description: string;
  /** Key into the product image generator's illustration set. */
  artKey: CategoryArtKey;
  /** Price envelope, in USD, shown on the category page. */
  priceRange: { min: number; max: number };
  /** Category specific specification rows merged into every product. */
  specs: ProductSpec[];
};

export const CATEGORY_ART_KEYS = [
  "electronics",
  "furniture",
  "appliances",
  "mobile",
  "gaming",
  "fashion",
  "jewelry",
  "fitness",
  "auto",
  "homeImprovement",
  "photography",
  "music",
  "toys",
  "wedding",
  "travel",
  "outdoor",
  "beauty",
  "mattresses",
  "computers",
  "smartHome",
] as const;

export type CategoryArtKey = (typeof CATEGORY_ART_KEYS)[number];

export type CartLine = {
  productId: string;
  quantity: number;
};

/**
 * The category-page filter panel's state.
 *
 * Lives in the shared type module because both the server (which turns it into a
 * Prisma `where` clause in `lib/catalogue.ts`) and the client filter controls
 * need it, and `lib/catalogue.ts` is server-only.
 */
export type ProductFilters = {
  brands: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly: boolean;
  minDiscount?: number;
  installmentsOnly: boolean;
};

export type CustomerReview = {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  productName: string;
  date: string;
  verified: boolean;
};
