"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/cn";

/**
 * Product gallery: one main image plus 2–4 thumbnails.
 * Keyboard accessible — thumbnails are real buttons in a labelled group.
 *
 * Duplicate URLs are collapsed before rendering. A gallery may legitimately hold
 * the same file more than once (one hero photo reused across angles, or a
 * half-migrated catalogue), and rendering those repeats would both duplicate
 * thumbnails and hand React duplicate `key`s, which breaks reconciliation.
 */
export function ProductGallery({
  images,
  name,
  badges,
  className,
}: {
  images: string[];
  name: string;
  badges?: React.ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  // Keep the first occurrence of each URL, preserving gallery order.
  const unique = Array.from(new Set(images));
  const safeActive = Math.min(active, unique.length - 1);
  const current = unique[safeActive] ?? "";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-line bg-white">
        <ProductImage
          key={safeActive}
          src={current}
          alt={`${name} product image`}
          priority
          className="aspect-4/3 w-full"
        />
        {badges ? <div className="pointer-events-none absolute left-4 top-4">{badges}</div> : null}
      </div>

      <div
        role="group"
        aria-label={`${name} images`}
        className="grid grid-cols-4 gap-2 sm:gap-3"
      >
        {unique.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            aria-pressed={index === safeActive}
            aria-label={`Show another ${name} image`}
            className={cn(
              "overflow-hidden rounded-xl border-2 bg-white transition",
              index === safeActive
                ? "border-brand-600 shadow-card"
                : "border-line hover:border-brand-300",
            )}
          >
            <ProductImage src={image} alt="" className="aspect-4/3 w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
