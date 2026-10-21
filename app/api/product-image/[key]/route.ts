import type { NextRequest } from "next/server";
import { GLYPHS } from "@/lib/art/glyphs";
import { renderProductImage } from "@/lib/art";
import type { CategoryArtKey } from "@/data/types";

/**
 * Local product-image endpoint.
 *
 * `GET /api/product-image/electronics?h=210&v=0&n=55%22%204K%20Smart%20TV&b=Lumex`
 * returns a deterministic SVG illustration. Nothing leaves the machine, and no
 * external image host is required.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext<"/api/product-image/[key]">,
) {
  const { key } = await context.params;
  const params = request.nextUrl.searchParams;
  const artKey = (key in GLYPHS ? key : "electronics") as CategoryArtKey;
  const hue = Number(params.get("h") ?? 210) || 210;
  const variant = Number(params.get("v") ?? 0) || 0;
  const view = params.get("view") === "card" ? "card" : "gallery";

  const svg = renderProductImage({
    artKey,
    hue: ((hue % 360) + 360) % 360,
    variant: Math.min(Math.max(variant, 0), 3),
    name: params.get("n") ?? "AfterPay",
    brand: params.get("b") ?? "AfterPay",
    category: params.get("c") ?? "",
    view,
  });

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
