"use client";

import Link from "next/link";
import { useState } from "react";
import { CartIcon, CheckIcon } from "@/components/Icons";
import { PriceDisplay } from "@/components/PriceDisplay";
import { ProductImage } from "@/components/ProductImage";
import { RatingStars } from "@/components/RatingStars";
import { cn } from "@/lib/cn";
import { toCartProduct, useStore } from "@/lib/store";
import type { Product } from "@/data/types";

/** Ask the local illustration endpoint for its square, card-ready artwork. */
function getCardImageSrc(src: string): string {
  if (!src.startsWith("/api/product-image/")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}view=card`;
}

/**
 * The workhorse product card used by every grid on the site.
 * Two products per row on mobile, four on desktop.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  /** Eagerly load the first row of a grid. */
  priority?: boolean;
  className?: string;
}) {
  const { addItem, quantityOf } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = quantityOf(product.id);
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(toCartProduct(product), 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-within:-translate-y-0.5 focus-within:shadow-lift",
        className,
      )}
    >
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          className="block focus:outline-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ProductImage
            src={getCardImageSrc(product.image)}
            alt={product.name}
            priority={priority}
            fit="contain"
            className="aspect-square w-full"
            imgClassName="transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.discountPercent > 0 ? (
            <span className="badge bg-ember-500 text-white shadow-sm">
              Save {product.discountPercent}%
            </span>
          ) : null}
          {product.isNew ? (
            <span className="badge bg-ink-950 text-white shadow-sm">New</span>
          ) : null}
          {product.featured ? (
            <span className="badge bg-brand-600 text-white shadow-sm">Featured</span>
          ) : null}
        </div>

        {outOfStock ? (
          <span className="absolute right-3 top-3 badge bg-white/95 text-ink-600 shadow-sm">
            Out of stock
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
            {product.brand}
          </span>
          {product.reviewCount > 0 ? <RatingStars rating={product.rating} size="xs" /> : null}
        </div>

        <h3 className="text-sm font-semibold leading-snug text-ink-900">
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] hover:text-brand-700"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-1">
          <PriceDisplay product={product} size="md" />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className={cn(
            "btn w-full text-sm",
            justAdded ? "btn-mint" : "btn-secondary",
            "relative z-10",
          )}
          aria-label={`Add ${product.name} to cart`}
        >
          {justAdded ? (
            <>
              <CheckIcon className="h-4 w-4" /> Added
            </>
          ) : (
            <>
              <CartIcon className="h-4 w-4" />
              {outOfStock ? "Out of stock" : inCart > 0 ? `Add another (${inCart})` : "Add to cart"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}
