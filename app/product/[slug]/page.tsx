import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { ProductReviews } from "@/components/ProductReviews";
import { InstallmentCalculator } from "@/components/InstallmentCalculator";
import { FrequentlyBoughtTogether } from "@/components/FrequentlyBoughtTogether";
import { SectionHeader } from "@/components/SectionHeader";
import { CheckIcon, PackageIcon, RefreshIcon, TruckIcon } from "@/components/Icons";
import { PriceDisplay } from "@/components/PriceDisplay";
import { RatingStars } from "@/components/RatingStars";
import {
  getFrequentlyBoughtTogether,
  getProductBySlug,
  getProductReviews,
  getRelatedProducts,
} from "@/lib/catalogue";
import type { Product } from "@/data/types";

async function ProductBundle({ product }: { product: Product }) {
  try {
    const extras = await getFrequentlyBoughtTogether(product, 2);
    return <FrequentlyBoughtTogether main={product} extras={extras} />;
  } catch (error) {
    console.error("Failed to load product bundle", error);
    return null;
  }
}

async function RelatedProductsSection({ product }: { product: Product }) {
  try {
    const related = await getRelatedProducts(product, 4);
    return (
      <section className="mt-12">
        <SectionHeader
          eyebrow="You might also like"
          title="Related products"
          action={{ label: `All ${product.categoryName}`, href: `/category/${product.categorySlug}` }}
        />
        <ProductGrid products={related} />
      </section>
    );
  } catch (error) {
    console.error("Failed to load related products", error);
    return null;
  }
}

async function ProductReviewsSection({ product }: { product: Product }) {
  try {
    const reviews = await getProductReviews(product, 6);
    if (!reviews.length) return null;

    return (
      <section className="mt-10">
        <SectionHeader eyebrow="Ratings and reviews" title="Customer reviews" />
        <ProductReviews reviews={reviews} />
      </section>
    );
  } catch (error) {
    console.error("Failed to load product reviews", error);
    return null;
  }
}

function BundleLoading() {
  return <div className="skeleton h-48 rounded-2xl" aria-label="Loading recommendations" />;
}

function ReviewsLoading() {
  return (
    <section className="mt-10" aria-label="Loading customer reviews" aria-busy="true">
      <div className="skeleton mb-6 h-8 w-56 rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="skeleton h-36 rounded-2xl" />
        <div className="skeleton h-36 rounded-2xl" />
      </div>
    </section>
  );
}

function RelatedProductsLoading({ product }: { product: Product }) {
  return (
    <section className="mt-12" aria-label="Loading related products" aria-busy="true">
      <SectionHeader
        eyebrow="You might also like"
        title="Related products"
        action={{ label: `All ${product.categoryName}`, href: `/category/${product.categorySlug}` }}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-2xl border border-line bg-white p-3">
            <div className="skeleton aspect-square rounded-xl" />
            <div className="skeleton mt-4 h-4 w-4/5 rounded-lg" />
            <div className="skeleton mt-2 h-3 w-2/3 rounded-lg" />
            <div className="skeleton mt-5 h-9 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — ${product.brand}`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="container-page py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: product.categoryName, href: `/category/${product.categorySlug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <ProductGallery
          images={product.images}
          name={product.name}
          badges={
            <div className="flex flex-col gap-1.5">
              {product.discountPercent > 0 ? (
                <span className="badge bg-ember-500 text-white shadow-sm">
                  Save {product.discountPercent}%
                </span>
              ) : null}
              {product.isNew ? <span className="badge bg-ink-950 text-white">New</span> : null}
            </div>
          }
        />

        <div className="flex flex-col gap-5">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              {product.brand}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {product.reviewCount > 0 ? <RatingStars rating={product.rating} /> : null}
              <span className="text-xs text-ink-400">SKU {product.sku}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{product.shortDescription}</p>
          </header>

          <PriceDisplay product={product} size="xl" />

          <ProductPurchasePanel product={product} />

          <InstallmentCalculator product={product} />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeader title="Description" />
          <div className="space-y-3 text-sm leading-relaxed text-ink-600">
            {product.description.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <h2 className="mt-8 text-lg font-semibold text-ink-950">Specifications</h2>
          <dl className="mt-3 overflow-hidden rounded-2xl border border-line">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="grid grid-cols-[8rem_1fr] gap-4 border-b border-line px-4 py-2.5 text-sm last:border-b-0 even:bg-surface"
              >
                <dt className="font-medium text-ink-500">{spec.label}</dt>
                <dd className="text-ink-800">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-6 text-sm font-semibold text-ink-950">Tags</h2>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <li key={tag} className="chip text-xs">
                {tag}
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-ink-950">Shipping &amp; returns</h2>
            <ul className="mt-3 space-y-3 text-xs text-ink-600">
              <li className="flex gap-2">
                <TruckIcon className="h-4 w-4 shrink-0 text-mint-600" />
                <span>
                  Standard delivery in 3–5 business days. Express available at checkout.
                </span>
              </li>
              <li className="flex gap-2">
                <RefreshIcon className="h-4 w-4 shrink-0 text-mint-600" />
                <span>Free 30-day returns.</span>
              </li>
              <li className="flex gap-2">
                <PackageIcon className="h-4 w-4 shrink-0 text-mint-600" />
                <span>Ships from an AfterPay warehouse with tracked delivery.</span>
              </li>
            </ul>
          </div>

          <Suspense fallback={<BundleLoading />}>
            <ProductBundle product={product} />
          </Suspense>
        </aside>
      </div>

      <Suspense fallback={<ReviewsLoading />}>
        <ProductReviewsSection product={product} />
      </Suspense>

      <Suspense fallback={<RelatedProductsLoading product={product} />}>
        <RelatedProductsSection product={product} />
      </Suspense>

      <p className="mt-10 flex items-center justify-center gap-2 rounded-2xl bg-surface p-4 text-center text-xs text-ink-500">
        <CheckIcon className="h-4 w-4 shrink-0 text-mint-600" />
        SKU {product.sku}.
      </p>
    </div>
  );
}
