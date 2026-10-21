import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { productImageUrls } from "@/lib/admin/images";
import type { CategoryArtKey } from "@/data/types";
import type { AdminResult } from "@/lib/admin/catalogue-admin";
import type { Prisma } from "@/lib/generated/prisma/client";

/** The illustration set a product's art is drawn from. */
type ArtKey = CategoryArtKey;

/**
 * Product mutations for the admin dashboard.
 *
 * A product is always written together with its price row, its gallery and its
 * installment configuration, because the storefront expects those relations to
 * exist - `lib/catalogue.ts` reads `prices[0]` as the product's price.
 */

/** Everything the dashboard needs to create or update a product. */
export type ProductInput = {
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  color: string;
  /** Selling price, in USD. */
  price: number;
  /** Pre-discount price, in USD. 0 means "no discount". */
  compareAtPrice: number;
  /** Discount percentage, 0-60. */
  discountPercent: number;
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  isNew: boolean;
  soldCount: number;
  popularity: number;
  sortOrder: number;
  /** Comma or newline separated tags. */
  tags: string;
  /** `label: value` per line. */
  specs: string;
  /** Optional image URLs, separated by commas or new lines. Empty uses category artwork. */
  images: string;
  /** Whether the product may be split into installments. */
  installmentEligible: boolean;
  suggestedMonths: number;
  availableMonths: string;
  minAmountUsd: number;
};

/** The market every price is written in. The store is US-only. */
const DEFAULT_MARKET = "US";

/** Parses the image URL list submitted by both create and update forms. */
function splitImageUrls(value: string): string[] {
  return value
    .split(/[\r\n,]+/)
    .map((url) => url.trim())
    .filter(Boolean);
}

/** Splits a comma or newline separated list into clean parts. */
function splitList(value: string): string[] {
  const unique = new Set<string>();
  return value
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter((part) => {
      const normalized = part.toLowerCase();
      if (!part || unique.has(normalized)) return false;
      unique.add(normalized);
      return true;
    });
}

/** Parses `label: value` spec lines. */
function parseSpecs(value: string): { label: string; value: string }[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator === -1) return { label: line, value: "" };
      return {
        label: line.slice(0, separator).trim(),
        value: line.slice(separator + 1).trim(),
      };
    })
    .filter((spec) => spec.label.length > 0);
}

/** Validates the numeric and text fields before anything is written. */
export function validateProduct(input: ProductInput): string[] {
  const errors: string[] = [];

  if (!input.name.trim()) errors.push("Name is required.");
  if (!input.brand.trim()) errors.push("Brand is required.");
  if (!input.categoryId.trim()) errors.push("Choose a category.");
  if (!input.shortDescription.trim()) errors.push("Short description is required.");
  if (!input.description.trim()) errors.push("Description is required.");
  if (!input.color.trim()) errors.push("Colour is required.");
  if (!Number.isFinite(input.price) || input.price < 0) {
    errors.push("Price must be zero or more.");
  }
  if (!Number.isFinite(input.compareAtPrice) || input.compareAtPrice < 0) {
    errors.push("Compare-at price must be zero or more.");
  }
  if (input.compareAtPrice > 0 && input.compareAtPrice < input.price) {
    errors.push("Compare-at price cannot be lower than the selling price.");
  }
  if (!Number.isFinite(input.discountPercent) || input.discountPercent < 0 || input.discountPercent > 60) {
    errors.push("Discount must be between 0 and 60 percent.");
  }
  if (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 5) {
    errors.push("Rating must be between 0 and 5.");
  }
  if (!Number.isInteger(input.reviewCount) || input.reviewCount < 0) errors.push("Review count cannot be negative.");
  if (!Number.isInteger(input.stock) || input.stock < 0) errors.push("Stock cannot be negative.");
  if (!Number.isInteger(input.soldCount) || input.soldCount < 0) errors.push("Sold count cannot be negative.");
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) errors.push("Sort order cannot be negative.");
  if (!Number.isFinite(input.popularity) || input.popularity < 0 || input.popularity > 100) {
    errors.push("Popularity must be between 0 and 100.");
  }
  if (!Number.isInteger(input.suggestedMonths) || (input.installmentEligible && input.suggestedMonths <= 0)) {
    errors.push("A suggested installment period is required when installments are on.");
  }
  if (!Number.isFinite(input.minAmountUsd) || input.minAmountUsd < 0) {
    errors.push("Minimum installment amount must be zero or more.");
  }
  const invalidImage = splitImageUrls(input.images).some((url) => {
      if (url.startsWith("/") && !url.startsWith("//")) return false;
      try {
        return !["http:", "https:"].includes(new URL(url).protocol);
      } catch {
        return true;
      }
    });
  if (invalidImage) errors.push("Image URLs must be local paths or start with http:// or https://.");

  return errors;
}

/** Derives a unique slug for a product. */
async function buildSlug(
  table: "product" | "category",
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || "item";
  let candidate = root;
  let counter = 2;

  for (;;) {
    const existing =
      table === "product"
        ? await prisma.product.findUnique({
            where: { slug: candidate },
            select: { id: true },
          })
        : await prisma.category.findUnique({
            where: { slug: candidate },
            select: { id: true },
          });

    if (!existing || existing.id === excludeId) return candidate;

    candidate = `${root}-${counter}`;
    counter += 1;
  }
}

/** Derives a unique SKU from the product name. */
async function buildSku(preferred: string, excludeId?: string): Promise<string> {
  const root = slugify(preferred).toUpperCase() || "PRODUCT";
  let candidate = root;
  let counter = 2;

  for (;;) {
    const existing = await prisma.product.findUnique({
      where: { sku: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter}`;
    counter += 1;
  }
}

/** Parses the comma separated installment periods, e.g. "3, 6, 9, 12". */
function parseMonths(value: string): number[] {
  const months = value
    .split(/[\s,]+/)
    .map((part) => Number(part))
    .filter((part) => Number.isInteger(part) && part > 0);
  return months.length ? months : [3, 6, 9, 12];
}

/**
 * Creates a product together with its price, gallery, tags, specs and
 * installment configuration.
 *
 * The id is generated by Postgres, so the caller never supplies one.
 */
export async function createProduct(
  input: ProductInput,
): Promise<AdminResult<{ id: string; slug: string }>> {
  const errors = validateProduct(input);
  if (errors.length) {
    return { ok: false, errors: errors.map((message) => ({ message })) };
  }

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true, artKey: true, name: true },
  });
  if (!category) {
    return { ok: false, errors: [{ message: "That category no longer exists." }] };
  }

  const market = await prisma.market.findUnique({
    where: { code: DEFAULT_MARKET },
    select: { code: true },
  });
  if (!market) {
    return { ok: false, errors: [{ message: "Create the US market before adding products." }] };
  }

  const slug = await buildSlug("product", input.name);
  const sku = await buildSku(input.sku.trim() || input.name);
  const artKey = category.artKey as ArtKey;

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        sku,
        slug,
        name: input.name.trim(),
        brand: input.brand.trim(),
        categoryId: category.id,
        shortDescription: input.shortDescription.trim(),
        description: input.description.trim(),
        color: input.color.trim(),
        image: "",
        rating: input.rating,
        reviewCount: input.reviewCount,
        stock: input.stock,
        featured: input.featured,
        isNew: input.isNew,
        popularity: input.popularity,
        soldCount: input.soldCount,
        releasedAt: new Date(),
        sortOrder: input.sortOrder,
        prices: {
          create: {
            marketCode: DEFAULT_MARKET,
            price: input.price,
            compareAtPrice: input.compareAtPrice,
            discountPercent: input.discountPercent,
          },
        },
      },
      select: { id: true, slug: true },
    });

    await writeProductChildren(tx, created.id, created.slug, input, category.name, artKey);
    return created;
  });

  return { ok: true, value: { id: product.id, slug: product.slug } };
}

/** Updates an existing product and replaces its child rows. */
export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<AdminResult<{ id: string; slug: string }>> {
  const errors = validateProduct(input);
  if (errors.length) {
    return { ok: false, errors: errors.map((message) => ({ message })) };
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, errors: [{ message: "That product no longer exists." }] };
  }

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true, artKey: true, name: true },
  });
  if (!category) {
    return { ok: false, errors: [{ message: "That category no longer exists." }] };
  }

  const market = await prisma.market.findUnique({
    where: { code: DEFAULT_MARKET },
    select: { code: true },
  });
  if (!market) {
    return { ok: false, errors: [{ message: "Create the US market before adding products." }] };
  }

  const slug = await buildSlug("product", input.name, id);
  const sku = await buildSku(input.sku.trim() || input.name, id);

  const product = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id },
      data: {
        sku,
        slug,
        name: input.name.trim(),
        brand: input.brand.trim(),
        categoryId: category.id,
        shortDescription: input.shortDescription.trim(),
        description: input.description.trim(),
        color: input.color.trim(),
        rating: input.rating,
        reviewCount: input.reviewCount,
        stock: input.stock,
        featured: input.featured,
        isNew: input.isNew,
        popularity: input.popularity,
        soldCount: input.soldCount,
        sortOrder: input.sortOrder,
      },
      select: { id: true, slug: true },
    });

    await tx.productPrice.deleteMany({ where: { productId: id } });
    await tx.productPrice.create({
      data: {
        productId: id,
        marketCode: DEFAULT_MARKET,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
        discountPercent: input.discountPercent,
      },
    });

    await writeProductChildren(tx, updated.id, updated.slug, input, category.name, category.artKey as ArtKey);
    return updated;
  });

  return { ok: true, value: { id: product.id, slug: product.slug } };
}

/**
 * Replaces the gallery, tags, specs and installment configuration of a product.
 */
async function writeProductChildren(
  tx: Prisma.TransactionClient,
  productId: string,
  slug: string,
  input: ProductInput,
  categoryName: string,
  artKey: ArtKey,
): Promise<void> {
  await tx.productImage.deleteMany({ where: { productId } });
  await tx.productTag.deleteMany({ where: { productId } });
  await tx.productSpec.deleteMany({ where: { productId } });

  const generatedUrls = productImageUrls({
    slug,
    name: input.name.trim(),
    brand: input.brand.trim(),
    artKey,
    categoryName,
  });
  const suppliedUrls = splitImageUrls(input.images);
  const urls = suppliedUrls.length ? suppliedUrls : generatedUrls;

  await tx.productImage.createMany({
    data: urls.map((url, position) => ({
      productId,
      url,
      position,
      alt: `${input.name.trim()} - view ${position + 1}`,
    })),
  });

  // `products.image` mirrors gallery position 0 so anything reading the column
  // directly still sees the cover image.
  await tx.product.update({
    where: { id: productId },
    data: { image: urls[0] ?? "" },
  });

  const tags = splitList(input.tags);
  if (tags.length) {
    await tx.productTag.createMany({
      data: tags.map((tag) => ({ productId, tag })),
    });
  }

  const specs = parseSpecs(input.specs);
  if (specs.length) {
    await tx.productSpec.createMany({
      data: specs.map((spec, position) => ({ productId, ...spec, position })),
    });
  }

  await tx.installmentConfig.upsert({
    where: { productId },
    create: {
      productId,
      eligible: input.installmentEligible,
      suggestedMonths: input.suggestedMonths,
      availableMonths: parseMonths(input.availableMonths),
      minAmountUsd: input.minAmountUsd,
    },
    update: {
      eligible: input.installmentEligible,
      suggestedMonths: input.suggestedMonths,
      availableMonths: parseMonths(input.availableMonths),
      minAmountUsd: input.minAmountUsd,
    },
  });
}

/** Deletes a product and all its related rows. */
export async function deleteProduct(id: string): Promise<AdminResult<null>> {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!existing) {
    return { ok: false, errors: [{ message: "That product no longer exists." }] };
  }

  await prisma.product.delete({ where: { id } });
  return { ok: true, value: null };
}

