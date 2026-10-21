import { hashString } from "@/lib/random";
import type { CategoryArtKey } from "@/data/types";

/**
 * Image helpers for the admin dashboard.
 *
 * The storefront serves product art from the local `app/api/product-image/[key]`
 * route, which renders a deterministic SVG. New products created in the
 * dashboard get their gallery built the same way, so an operator never has to
 * upload a file to publish a product.
 */

/** Number of gallery images a product gets. */
export const GALLERY_LENGTH = 4;

/** Stable per-product hue so every product looks different. */
export function hueFor(slug: string): number {
  return hashString(`hue:${slug}`) % 360;
}

/** One gallery image URL for a product. */
export function productImageUrl(
  seed: { slug: string; name: string; brand: string; artKey: CategoryArtKey; categoryName: string },
  variant: number,
): string {
  const params = new URLSearchParams({
    h: String(hueFor(seed.slug)),
    v: String(variant),
    n: seed.name,
    b: seed.brand,
    c: seed.categoryName,
  });
  return `/api/product-image/${seed.artKey}?${params.toString()}`;
}

/** Main image plus three gallery images. */
export function productImageUrls(
  seed: { slug: string; name: string; brand: string; artKey: CategoryArtKey; categoryName: string },
): string[] {
  return Array.from({ length: GALLERY_LENGTH }, (_, variant) =>
    productImageUrl(seed, variant),
  );
}

/** Editorial banner for a category card and category page header. */
export function categoryBannerUrl(
  artKey: CategoryArtKey,
  hue: number,
  label: string,
  tagline: string,
): string {
  const params = new URLSearchParams({
    h: String(hue),
    v: "1",
    n: tagline,
    b: label,
    c: "AfterPay category",
  });
  return `/api/product-image/${artKey}?${params.toString()}`;
}
