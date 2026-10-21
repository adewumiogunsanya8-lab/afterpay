import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Pagination } from "@/components/Pagination";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductImage } from "@/components/ProductImage";
import { SortSelect } from "@/components/SortSelect";
import {
  getBrandsByCategory,
  getCategoryBySlug,
  getCategoryPriceBounds,
  queryProducts,
} from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";
import { isSortKey, sortProducts, type SortKey } from "@/lib/search";

const PAGE_SIZE = 12;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} — pay in installments`,
    description: `${category.description} Browse our ${category.name.toLowerCase()} catalogue, priced in US dollars.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const sortParam = first(query.sort);
  const sort: SortKey = isSortKey(sortParam) ? sortParam : "recommended";

  // Filtering happens in SQL (see `queryProducts`); sorting is applied in the
  // application because a category only holds a handful of products.
  const filters = {
    brands: first(query.brand)?.split(",").filter(Boolean) ?? [],
    minPrice: first(query.min) ? Number(first(query.min)) : undefined,
    maxPrice: first(query.max) ? Number(first(query.max)) : undefined,
    minRating: first(query.rating) ? Number(first(query.rating)) : undefined,
    minDiscount: first(query.discount) ? Number(first(query.discount)) : undefined,
    inStockOnly: first(query.stock) === "1",
    installmentsOnly: first(query.installments) === "1",
  };

  const [brands, priceBounds, filtered] = await Promise.all([
    getBrandsByCategory(category.slug),
    getCategoryPriceBounds(category.slug),
    queryProducts({ categorySlug: category.slug, filters }),
  ]);

  const sorted = sortProducts(filtered, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(first(query.page) ?? 1) || 1), totalPages);
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {/* Category banner */}
      <div className="border-b border-line bg-surface">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Categories", href: "/categories" },
              { label: category.name },
            ]}
          />

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
                {category.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-base">
                {category.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                <li className="chip">From {formatMoney(priceBounds.min)}</li>
                <li className="chip">Installment options on eligible products</li>
              </ul>
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-line lg:block">
              <ProductImage
                src={category.bannerImage}
                alt={`${category.name} banner`}
                className="aspect-4/3 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="card p-4">
              <Suspense fallback={<p className="text-sm text-ink-400">Loading filters…</p>}>
                <ProductFilters brands={brands} priceBounds={priceBounds} />
              </Suspense>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Suspense fallback={null}>
                <SortSelect value={sort} />
              </Suspense>
            </div>

            <ProductGrid
              products={visible}
              priorityCount={8}
              emptyMessage={`No ${category.name.toLowerCase()} products match these filters.`}
            />

            <Pagination page={page} totalPages={totalPages} className="mt-10" />

            <p className="mt-6 text-center text-xs text-ink-400">
              All prices shown in US dollars.{" "}
              <Link href="/categories" className="link">
                browse all categories
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
