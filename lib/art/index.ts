import { GLYPHS } from "./glyphs";
import type { CategoryArtKey } from "@/data/types";

/**
 * Renders the SVG used as an AfterPay product image.
 *
 * The image is produced on the server by `app/api/product-image/[key]`, so the
 * storefront never depends on an external image host. Swapping in real
 * photography later only means replacing the URLs in `data/images.ts`.
 */

export const PRODUCT_IMAGE_WIDTH = 800;
export const PRODUCT_IMAGE_HEIGHT = 600;

/** Gallery view captions, indexed by variant (0 = main image). */
export const VARIANT_LABELS = ["Front view", "Detail", "In the box", "Scale"];

export type ProductImageOptions = {
  artKey: CategoryArtKey;
  /** Base hue (0–359) so no two products share the same palette. */
  hue: number;
  /** 0 = main image, 1–3 = gallery images. */
  variant?: number;
  name?: string;
  brand?: string;
  category?: string;
  /** Square, simplified composition used in storefront product cards. */
  view?: "gallery" | "card";
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Greedy word wrap, capped at `maxLines` with an ellipsis. */
function wrap(value: string, maxChars: number, maxLines: number): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = candidate;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  const output = lines.slice(0, maxLines);
  const consumed = output.join(" ").length;
  if (consumed < value.length && output.length) {
    output[output.length - 1] = `${output[output.length - 1].slice(0, Math.max(4, maxChars - 1))}…`;
  }
  return output;
}

/** Builds the complete SVG document for one product image. */
export function renderProductImage({
  artKey,
  hue,
  variant = 0,
  name = "AfterPay",
  brand = "AfterPay",
  category = "",
  view = "gallery",
}: ProductImageOptions): string {
  const glyph = (GLYPHS[artKey] ?? GLYPHS.electronics)
    .replaceAll("%INK%", `hsl(${hue} 42% 22%)`)
    .replaceAll("%ACCENT%", `hsl(${(hue + 28) % 360} 78% 56%)`);

  const ink = `hsl(${hue} 45% 16%)`;
  const muted = `hsl(${hue} 18% 42%)`;
  const accent = `hsl(${(hue + 28) % 360} 78% 52%)`;
  const tintA = `hsl(${hue} 70% 96%)`;
  const tintB = `hsl(${(hue + 40) % 360} 68% 88%)`;
  const shift = variant * 6;

  if (view === "card") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="${escapeXml(name)} - illustration">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tintA}"/>
      <stop offset="100%" stop-color="${tintB}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <circle cx="130" cy="132" r="190" fill="${accent}" opacity="0.12"/>
  <circle cx="704" cy="680" r="228" fill="hsl(${(hue + 300) % 360} 70% 60%)" opacity="0.1"/>
  <rect x="118" y="110" width="564" height="580" rx="52" fill="#ffffff" opacity="0.78"/>
  <rect x="118" y="110" width="564" height="580" rx="52" fill="none" stroke="${accent}" stroke-width="2" opacity="0.28"/>
  <g transform="translate(168 218) scale(1.45)">${glyph}</g>
</svg>`;
  }

  const nameLines = wrap(name, 30, 2);
  const nameMarkup = nameLines
    .map(
      (line, index) =>
        `<text x="400" y="${508 + index * 38}" text-anchor="middle" font-size="32" font-weight="700" fill="${ink}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">${escapeXml(line)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PRODUCT_IMAGE_WIDTH} ${PRODUCT_IMAGE_HEIGHT}" width="${PRODUCT_IMAGE_WIDTH}" height="${PRODUCT_IMAGE_HEIGHT}" role="img" aria-label="${escapeXml(name)} — illustration">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tintA}"/>
      <stop offset="100%" stop-color="${tintB}"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="hsl(${(hue + 60) % 360} 76% 60%)"/>
    </linearGradient>
  </defs>
  <rect width="${PRODUCT_IMAGE_WIDTH}" height="${PRODUCT_IMAGE_HEIGHT}" fill="url(#bg)"/>
  <circle cx="${120 + shift * 4}" cy="${110 + shift * 2}" r="150" fill="${accent}" opacity="0.12"/>
  <circle cx="${700 - shift * 3}" cy="${500 - shift * 2}" r="190" fill="hsl(${(hue + 300) % 360} 70% 60%)" opacity="0.1"/>
  <path d="M0 ${470 + shift * 3}h800" stroke="${accent}" stroke-width="2" opacity="0.18"/>
  <rect x="200" y="92" width="400" height="316" rx="30" fill="#ffffff" opacity="0.92"/>
  <rect x="200" y="92" width="400" height="316" rx="30" fill="none" stroke="${accent}" stroke-width="2" opacity="0.35"/>
  <g transform="translate(240 130)">${glyph}</g>
  <text x="400" y="462" text-anchor="middle" font-size="22" font-weight="600" letter-spacing="5" fill="${muted}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">${escapeXml(brand.toUpperCase())}</text>
  <rect x="330" y="474" width="140" height="4" rx="2" fill="url(#bar)"/>
  ${nameMarkup}
  <g>
    <rect x="40" y="524" width="196" height="36" rx="18" fill="#ffffff" opacity="0.85"/>
    <text x="138" y="548" text-anchor="middle" font-size="18" font-weight="600" fill="${muted}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">${escapeXml(VARIANT_LABELS[variant] ?? VARIANT_LABELS[0])}</text>
  </g>
  <g>
    <rect x="${800 - 268}" y="524" width="228" height="36" rx="18" fill="${accent}" opacity="0.16"/>
    <text x="${800 - 154}" y="548" text-anchor="middle" font-size="17" font-weight="700" letter-spacing="1.5" fill="${accent}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">AFTERPAY</text>
  </g>
  <text x="40" y="60" font-size="19" font-weight="600" letter-spacing="3" fill="${muted}" opacity="0.9" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif">${escapeXml(category.toUpperCase())}</text>
</svg>`;
}
