import { searchProducts } from "@/lib/catalogue";
import { buildSuggestions } from "@/lib/search";

/**
 * Search API used by the header autocomplete.
 *
 * GET /api/search?q=laptop
 * → { query, total, products: Suggestion[], categories: {slug,name}[] }
 *
 * Runs on the server, so the catalogue is queried in Postgres and only the
 * trimmed suggestion payload is sent to the browser.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ query, total: 0, products: [], categories: [] });
  }

  const result = await searchProducts(query, { limit: 6 });

  return Response.json(
    {
      query,
      total: result.total,
      products: buildSuggestions(result.products),
      categories: result.categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        tagline: category.tagline,
      })),
    },
    { headers: { "cache-control": "public, max-age=60" } },
  );
}
