import { hashString } from "@/lib/random";
import type { CategoryArtKey } from "@/data/types";

/** Generated artwork URL for a category card and category page header. */
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

/** Stable per-category hue for the generated banner. */
export function categoryHue(slug: string): number {
  return hashString(`hue:${slug}`) % 360;
}