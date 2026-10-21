import { cache } from "react";
import { prisma } from "@/lib/db";
import type {
  Category,
  CountryCode,
  CustomerReview,
  Market,
  Product,
  ProductSpec,
} from "@/data/types";
import type { MarketMap } from "@/lib/markets";
import { BOOTSTRAP_MARKET } from "@/lib/markets";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Read layer for the catalogue.
 *
 * This is the only place the app reads catalogue data from, and it reads it
 * from Postgres. It replaces the old in-memory generator (`data/products.ts`),
 * but every consumer still receives the same `Product` / `Category` shapes, so
 * components did not have to change.
 *
 * Queries are wrapped in React's `cache()` so a single render pass that asks for
 * the same product twice (page + `generateMetadata`) issues one query.
 */

/** A product row with every relation the UI needs. */
const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  prices: true,
  images: { orderBy: { position: "asc" } },
  specs: { orderBy: { position: "asc" } },
  tags: { orderBy: { tag: "asc" } },
  installment: true,
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

const categoryInclude = {
  specs: { orderBy: { position: "asc" } },
} satisfies Prisma.CategoryInclude;

type CategoryRow = Prisma.CategoryGetPayload<{ include: typeof categoryInclude }>;

/** Decimal columns come back as Decimal instances; the UI wants numbers. */
function num(value: Prisma.Decimal | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    artKey: row.artKey as Category["artKey"],
    priceRange: { min: num(row.priceMin), max: num(row.priceMax) },
    specs: row.specs.map((spec) => ({ label: spec.label, value: spec.value })),
  };
}

function mapProduct(row: ProductRow): Product {
  const usd = row.prices[0];

  // The store is US-only, so a product has exactly one price row. Guard anyway
  // rather than throw on a partially seeded catalogue.
  const price = usd ? num(usd.price) : 0;
  const originalPrice = usd ? num(usd.compareAtPrice) : 0;
  // The cover image is the first gallery row (lowest `position`), so editing
  // `product_images` in the database is all it takes to change what a card, the
  // cart, checkout or the search dropdown shows. `products.image` is kept purely
  // as a fallback for a product that has no gallery rows yet.
  const gallery = row.images.map((image) => image.url);
  const cover = gallery[0] ?? row.image;
  const images = gallery.length ? gallery : [cover];

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    categorySlug: row.category.slug,
    shortDescription: row.shortDescription,
    description: row.description,
    price,
    originalPrice,
    discountPercent: usd?.discountPercent ?? 0,
    image: cover,
    images,
    rating: num(row.rating),
    reviewCount: row.reviewCount,
    stock: row.stock,
    tags: row.tags.map((tag) => tag.tag),
    featured: row.featured,
    isNew: row.isNew,
    installment: row.installment
      ? {
          eligible: row.installment.eligible,
          suggestedMonths: row.installment.suggestedMonths,
          availableMonths: row.installment.availableMonths,
          minAmountUsd: num(row.installment.minAmountUsd),
        }
      : {
          eligible: false,
          suggestedMonths: 0,
          availableMonths: [],
          minAmountUsd: 0,
        },
    specs: row.specs.map<ProductSpec>((spec) => ({
      label: spec.label,
      value: spec.value,
    })),
    createdAt: row.releasedAt.toISOString(),
    popularity: row.popularity,
    soldCount: row.soldCount,
    color: row.color,
  };
}

function mapReview(
  row: {
    id: string;
    author: string;
    location: string;
    rating: number;
    title: string;
    body: string;
    reviewDate: Date;
    verified: boolean;
  },
  productName: string,
): CustomerReview {
  return {
    id: row.id,
    author: row.author,
    location: row.location,
    rating: row.rating,
    title: row.title,
    body: row.body,
    productName,
    date: row.reviewDate.toISOString().slice(0, 10),
    verified: row.verified,
  };
}

// ------------------------------------------------------------------ markets

/** The market row. The store is US-only, so this always returns the same row. */
export const getMarketRows = cache(async () => {
  return prisma.market.findMany({ orderBy: { sortOrder: "asc" } });
});

type MarketRow = Awaited<ReturnType<typeof getMarketRows>>[number];

/** Shape stored in `Market.messaging` (jsonb). */
type MarketMessaging = {
  shippingNote: string;
  freeReturnsNote: string;
  installmentNote: string;
};

function mapMarket(row: MarketRow) {
  const messaging = row.messaging as unknown as MarketMessaging;
  return {
    code: row.code,
    name: row.name,
    shortName: row.shortName,
    flag: row.flag,
    currency: row.currency,
    currencySymbol: row.currencySymbol,
    locale: row.locale,
    standardShipping: num(row.standardShipping),
    expressShipping: num(row.expressShipping),
    freeShippingThreshold: num(row.freeShippingThreshold),
    estimatedTaxRate: num(row.estimatedTaxRate),
    estimatedTaxLabel: row.estimatedTaxLabel,
    standardDeliveryDays: row.standardDeliveryDays,
    expressDeliveryDays: row.expressDeliveryDays,
    returnsSummary: row.returnsSummary,
    messaging,
  };
}

/** The market, keyed by country code, ready for `MarketsProvider`. */
export const getMarkets = cache(async (): Promise<MarketMap> => {
  const rows = await getMarketRows();
  const markets = {} as MarketMap;
  for (const row of rows) {
    markets[row.code as CountryCode] = mapMarket(row) as Market;
  }
  // Keep the admin login and empty-catalogue screens usable before the first
  // market has been created through the dashboard. This is not persisted.
  if (!markets.US) markets.US = BOOTSTRAP_MARKET;
  return markets;
});

// --------------------------------------------------------------- categories

export const getCategories = cache(async (): Promise<Category[]> => {
  const rows = await prisma.category.findMany({
    include: categoryInclude,
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapCategory);
});

/** A category plus the stored editorial banner image. */
export type CategoryDetail = Category & { bannerImage: string };

export const getCategoryBySlug = cache(
  async (slug: string): Promise<CategoryDetail | undefined> => {
    const row = await prisma.category.findUnique({
      where: { slug },
      include: categoryInclude,
    });
    return row ? { ...mapCategory(row), bannerImage: row.bannerImage } : undefined;
  },
);

/** A category row plus the derived figures the cards display. */
export type CategoryWithStats = Category & {
  bannerImage: string;
  productCount: number;
  /** Cheapest USD price in the category, or null when it has no products. */
  cheapestPrice: number | null;
  /** Lowest monthly figure in the category, or null when none qualify. */
  lowestMonthly: number | null;
};

/**
 * Categories with the figures the cards and the categories page display.
 *
 * Computed with grouped aggregates rather than by loading every product into
 * memory, so the categories page stays a small, fixed number of round trips.
 */
export const getCategoriesWithStats = cache(async (): Promise<CategoryWithStats[]> => {
  const [categories, priceGroups, eligibleConfigs, productCategories] = await Promise.all([
    prisma.category.findMany({ include: categoryInclude, orderBy: { sortOrder: "asc" } }),
    prisma.productPrice.groupBy({
      by: ["productId", "marketCode"],
      where: { marketCode: "US" },
      _min: { price: true },
    }),
    prisma.installmentConfig.findMany({
      where: { eligible: true },
      select: {
        suggestedMonths: true,
        product: { select: { categoryId: true, prices: true } },
      },
    }),
    prisma.product.findMany({ select: { id: true, categoryId: true } }),
  ]);

  // Cheapest price per product, then rolled up to the category.
  const cheapestByProduct = new Map<string, number>();
  for (const group of priceGroups) {
    if (!group._min.price) continue;
    const value = num(group._min.price);
    const current = cheapestByProduct.get(group.productId);
    if (current === undefined || value < current) cheapestByProduct.set(group.productId, value);
  }

  const countByCategory = new Map<string, number>();
  const minByCategory = new Map<string, number>();
  for (const product of productCategories) {
    countByCategory.set(product.categoryId, (countByCategory.get(product.categoryId) ?? 0) + 1);
    const price = cheapestByProduct.get(product.id);
    if (price === undefined) continue;
    const current = minByCategory.get(product.categoryId);
    if (current === undefined || price < current) minByCategory.set(product.categoryId, price);
  }

  // Lowest monthly figure per category, from installment-eligible products.
  const monthlyByCategory = new Map<string, number>();
  for (const config of eligibleConfigs) {
    const usd = config.product.prices[0];
    if (!usd || config.suggestedMonths <= 0) continue;
    const monthly = num(usd.price) / config.suggestedMonths;
    const current = monthlyByCategory.get(config.product.categoryId);
    if (current === undefined || monthly < current) {
      monthlyByCategory.set(config.product.categoryId, monthly);
    }
  }

  return categories.map((row) => ({
    ...mapCategory(row),
    bannerImage: row.bannerImage,
    productCount: countByCategory.get(row.id) ?? 0,
    cheapestPrice: minByCategory.get(row.id) ?? null,
    lowestMonthly: monthlyByCategory.get(row.id) ?? null,
  }));
});

// ------------------------------------------------------------------ products

export const getAllProducts = cache(async (): Promise<Product[]> => {
  const rows = await prisma.product.findMany({ include: productInclude });
  return rows.map(mapProduct);
});

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | undefined> => {
    const row = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });
    return row ? mapProduct(row) : undefined;
  },
);

/** Price range for a category, without loading full product records. */
export const getCategoryPriceBounds = cache(
  async (categorySlug: string): Promise<{ min: number; max: number }> => {
    const bounds = await prisma.productPrice.aggregate({
      where: {
        marketCode: "US",
        product: { category: { slug: categorySlug } },
      },
      _min: { price: true },
      _max: { price: true },
    });

    if (bounds._min.price === null || bounds._max.price === null) {
      return { min: 0, max: 0 };
    }

    return { min: num(bounds._min.price), max: num(bounds._max.price) };
  },
);

export const getProductById = cache(
  async (id: string): Promise<Product | undefined> => {
    const row = await prisma.product.findUnique({ where: { id }, include: productInclude });
    return row ? mapProduct(row) : undefined;
  },
);

export const getProductsByIds = cache(async (ids: string[]): Promise<Product[]> => {
  if (!ids.length) return [];
  const rows = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: productInclude,
  });
  // Preserve the caller's ordering, which the cart depends on.
  const byId = new Map(rows.map((row) => [row.id, mapProduct(row)]));
  return ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });
});

export const getProductsByCategory = cache(
  async (categorySlug: string): Promise<Product[]> => {
    const rows = await prisma.product.findMany({
      where: { category: { slug: categorySlug } },
      include: productInclude,
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(mapProduct);
  },
);

/** Product slugs for the optional database validation script. */
export const getProductSlugs = cache(async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({ select: { slug: true } });
  return rows.map((row) => row.slug);
});

/** Distinct brands within a category, for the filter panel. */
export const getBrandsByCategory = cache(
  async (categorySlug: string): Promise<string[]> => {
    const rows = await prisma.product.findMany({
      where: { category: { slug: categorySlug } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });
    return rows.map((row) => row.brand);
  },
);

/** Home page rails. Four small, indexed queries instead of loading 400 rows. */
export const getFeaturedProducts = cache(async (limit = 8): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    include: productInclude,
    orderBy: { popularity: "desc" },
    take: limit,
  });
  return rows.map(mapProduct);
});

export const getNewArrivals = cache(async (limit = 8): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    include: productInclude,
    orderBy: { releasedAt: "desc" },
    take: limit,
  });
  return rows.map(mapProduct);
});

export const getBestSellers = cache(async (limit = 8): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    include: productInclude,
    orderBy: { soldCount: "desc" },
    take: limit,
  });
  return rows.map(mapProduct);
});

/**
 * The biggest discounts.
 *
 * The discount lives on `product_prices` (one row per market), and Postgres
 * cannot order by a field on a to-many relation. So the discounted price rows
 * are ranked first, then the matching products are fetched and re-ordered to
 * match, which keeps this to two small indexed queries.
 */
export const getDeals = cache(
  async (limit = 8, minDiscount = 15): Promise<Product[]> => {
    const prices = await prisma.productPrice.findMany({
      where: { discountPercent: { gte: minDiscount } },
      select: { productId: true, discountPercent: true },
      orderBy: { discountPercent: "desc" },
      take: limit,
    });
    if (!prices.length) return [];

    const rows = await prisma.product.findMany({
      where: { id: { in: prices.map((price) => price.productId) } },
      include: productInclude,
    });

    const byId = new Map(rows.map((row) => [row.id, mapProduct(row)]));
    return prices.flatMap((price) => {
      const product = byId.get(price.productId);
      return product ? [product] : [];
    });
  },
);

/**
 * Same category first, then the nearest price, excluding the product itself.
 *
 * Two queries: the category's products, then a price-ordered sample of the rest
 * of the catalogue as a fallback when the category is thin.
 */
export const getRelatedProducts = cache(
  async (product: Product, limit = 4): Promise<Product[]> => {
    const [sameCategory, others] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: product.categoryId, id: { not: product.id } },
        include: productInclude,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { categoryId: { not: product.categoryId } },
        include: productInclude,
        orderBy: { popularity: "desc" },
        take: 40,
      }),
    ]);

    const byDistance = (a: Product, b: Product) =>
      Math.abs(a.price - product.price) - Math.abs(b.price - product.price);

    return [...sameCategory.map(mapProduct), ...others.map(mapProduct)]
      .sort(byDistance)
      .slice(0, limit);
  },
);

/** Complementary, cheaper, installment-eligible products from other categories. */
export const getFrequentlyBoughtTogether = cache(
  async (product: Product, limit = 2): Promise<Product[]> => {
    const rows = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        categoryId: { not: product.categoryId },
        installment: { eligible: true },
        prices: { some: { marketCode: "US", price: { lt: 350 } } },
      },
      include: productInclude,
      take: 40,
    });

    // Prefer products whose price sits near the classic ~$40 accessory band.
    const distance = (candidate: Product) =>
      Math.abs(Math.log(candidate.price / 40)) + (1 - candidate.popularity / 100);

    return rows
      .map(mapProduct)
      .sort((a, b) => distance(a) - distance(b))
      .slice(0, limit);
  },
);

/** Every distinct brand, for global search and filtering. */
export const getAllBrands = cache(async (): Promise<string[]> => {
  const rows = await prisma.product.findMany({
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return rows.map((row) => row.brand);
});

/** The newest products stored, for the site-wide "N products" figure. */
export const getProductCount = cache(async (): Promise<number> => {
  return prisma.product.count();
});

// ------------------------------------------------------------------- reviews

/** Reviews for one product, newest first. */
export const getProductReviews = cache(
  async (product: Product, limit = 6): Promise<CustomerReview[]> => {
    const rows = await prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { reviewDate: "desc" },
      take: limit,
    });
    return rows.map((row) => mapReview(row, product.name));
  },
);

// -------------------------------------------------------------------- search

/**
 * Product search.
 *
 * Matching happens in Postgres: every token must appear somewhere in the
 * searchable haystack, and results are then re-ranked in the application using
 * the same field weighting the seeded order (`scoreProduct` below). Ranking in
 * memory is safe because the candidate set is already narrowed by the query.
 */

/** Words that must all appear for a row to be a candidate. */
function buildMatch(tokens: string[]): Prisma.ProductWhereInput {
  return {
    AND: tokens.map((token) => ({
      OR: [
        { name: { contains: token, mode: "insensitive" } },
        { brand: { contains: token, mode: "insensitive" } },
        { shortDescription: { contains: token, mode: "insensitive" } },
        { tags: { some: { tag: { contains: token, mode: "insensitive" } } } },
        { category: { name: { contains: token, mode: "insensitive" } } },
      ],
    })),
  };
}

export type ProductFilters = {
  brands: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly: boolean;
  minDiscount?: number;
  installmentsOnly: boolean;
};

/** Translates the category-page filter panel into a Prisma `where` clause. */
function buildFilterWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [];

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const price: { gte?: number; lte?: number } = {};
    if (filters.minPrice !== undefined) price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) price.lte = filters.maxPrice;
    and.push({ prices: { some: { price } } });
  }

  if (filters.brands.length) and.push({ brand: { in: filters.brands } });
  if (filters.inStockOnly) and.push({ stock: { gt: 0 } });
  if (filters.installmentsOnly) and.push({ installment: { eligible: true } });
  if (filters.minRating !== undefined) and.push({ rating: { gte: filters.minRating } });
  if (filters.minDiscount !== undefined) {
    and.push({ prices: { some: { discountPercent: { gte: filters.minDiscount } } } });
  }

  return and.length ? { AND: and } : {};
}

export type CatalogueQuery = {
  categorySlug?: string;
  filters?: ProductFilters;
  limit?: number;
};

function scoreProduct(product: Product, tokens: string[]): number {
  const name = product.name.toLowerCase();
  const brand = product.brand.toLowerCase();
  const category = product.categoryName.toLowerCase();

  let total = 0;
  for (const token of tokens) {
    if (name.startsWith(token)) total += 60;
    else if (name.includes(token)) total += 40;
    if (brand.includes(token)) total += 18;
    if (category.includes(token)) total += 14;
    if (product.tags.some((tag) => tag.includes(token))) total += 8;
  }
  // Gentle quality bias so the best-reviewed matches float to the top.
  return total + product.rating * 3 + product.popularity / 20;
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    // The `$` is kept so "under $50" tokenizes usefully; the `£` was dropped
    // along with the rest of the GBP pricing.
    .split(/[^a-z0-9$%.]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

export type SearchOutcome = {
  products: Product[];
  categories: Category[];
  total: number;
};

/** Full-text-ish product and category search, ranked in the application. */
export const searchProducts = cache(
  async (query: string, options: { limit?: number; categorySlug?: string } = {}) => {
    const trimmed = query.trim();
    const tokens = tokenize(trimmed);

    const where: Prisma.ProductWhereInput = {};
    if (options.categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: options.categorySlug },
        select: { id: true },
      });
      if (!category) return { products: [], categories: [], total: 0 } satisfies SearchOutcome;
      where.categoryId = category.id;
    }
    if (tokens.length) Object.assign(where, buildMatch(tokens));

    const rows = await prisma.product.findMany({ where, include: productInclude });
    const products = rows.map(mapProduct);

    const ranked = tokens.length
      ? products
          .map((product) => ({ product, score: scoreProduct(product, tokens) }))
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((entry) => entry.product)
      : products;

    const categories = tokens.length
      ? (await getCategories()).filter((category) => {
          const haystack = `${category.name} ${category.tagline}`.toLowerCase();
          return tokens.every((token) => haystack.includes(token));
        })
      : [];

    return {
      products: options.limit ? ranked.slice(0, options.limit) : ranked,
      categories,
      total: ranked.length,
    } satisfies SearchOutcome;
  },
);

/** Products for a category page, filtered and sorted in the application. */
export const queryProducts = cache(async (query: CatalogueQuery = {}): Promise<Product[]> => {
  const where: Prisma.ProductWhereInput = {};

  if (query.categorySlug) {
    where.category = { slug: query.categorySlug };
  }
  if (query.filters) Object.assign(where, buildFilterWhere(query.filters));

  const rows = await prisma.product.findMany({ where, include: productInclude });
  return rows.map(mapProduct);
});
