import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductGrid";
import { SortSelect } from "@/components/SortSelect";
import { SearchBar } from "@/components/SearchBar";
import { getCategories, searchProducts } from "@/lib/catalogue";
import { isSortKey, sortProducts, type SortKey } from "@/lib/search";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Search the catalogue",
  description: "Search the AfterPay catalogue across every category.",
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = await searchParams;
  const term = (first(query.q) ?? "").trim();
  const categorySlug = first(query.category);
  const sortParam = first(query.sort);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "recommended";
  const dealsOnly = first(query.deals) === "1";
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === categorySlug);

  // An empty query returns the whole (filtered) catalogue, which also covers the
  // "Deals" view - that is just a discount filter.
  const result = await searchProducts(dealsOnly ? "" : term, {
    categorySlug: category?.slug,
  });

  const products = dealsOnly
    ? result.products.filter((product) => product.discountPercent > 0)
    : result.products;

  const sorted = sortProducts(products, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(first(query.page) ?? 1) || 1), totalPages);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const heading = dealsOnly
    ? "Deals"
    : category
      ? category.name
      : term
        ? `Results for “${term}”`
        : "All products";

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(category ? [{ label: "Categories", href: "/categories" }, { label: category.name }] : [{ label: "Search" }]),
        ]}
      />

      <div className="mt-4 max-w-2xl">
        <Suspense fallback={null}>
          <SearchBar autoFocus={Boolean(term)} />
        </Suspense>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading">{heading}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {term && !dealsOnly ? `Matching “${term}”` : "Browse the catalogue"}
            {category
              ? ` in ${category.name}`
              : ""}{" "}
            · prices in USD
          </p>
        </div>
        <Suspense fallback={null}>
          <SortSelect value={sort} />
        </Suspense>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {categories.map((item) => {
          const active = item.slug === categorySlug;
          return (
            <Link
              key={item.slug}
              href={`/search?${new URLSearchParams({
                ...(term ? { q: term } : {}),
                category: item.slug,
              }).toString()}`}
              className={active ? "chip chip-active" : "chip"}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        <ProductGrid
          products={visible}
          priorityCount={4}
          emptyMessage={
            term
              ? `Nothing matched “${term}”. Try a shorter word, like “laptop” or “sofa”.`
              : "No products match these filters."
          }
        />
      </div>

      <Pagination page={page} totalPages={totalPages} className="mt-10" />
    </div>
  );
}

