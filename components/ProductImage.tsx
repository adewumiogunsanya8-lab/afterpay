"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Lazy-loaded product image with a graceful fallback.
 *
 * Image URLs come from the database (`product_images.url`, first row = cover), so
 * they can point at the local `/api/product-image/*` SVG route or at a remote host.
 * `unoptimized` keeps `next/image` from routing remote URLs through the optimiser,
 * which means no `images.remotePatterns` entry is needed in `next.config.ts` and
 * the SVG is served byte-for-byte — while `next/image` still provides lazy loading,
 * intrinsic sizing (no layout shift) and `sizes` hints.
 *
 * `referrerPolicy="no-referrer"` is set because some stock-photo CDNs (Pixabay
 * among them) refuse hotlinked requests that carry a referrer.
 *
 * If an image ever fails, a neutral placeholder keeps the layout intact.
 */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  fit = "cover",
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  /** How the source image should fill its frame. */
  fit?: "cover" | "contain";
  /** Set for above-the-fold imagery (hero, first row of a grid). */
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-ink-50 to-ink-100",
        className,
      )}
    >
      {failed ? (
        <div
          role="img"
          aria-label={alt}
          className="flex h-full w-full items-center justify-center bg-ink-100 text-xs font-medium uppercase tracking-widest text-ink-400"
        >
          AfterPay
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          referrerPolicy="no-referrer"
          priority={priority}
          sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
          onError={() => setFailed(true)}
          className={cn(fit === "contain" ? "object-contain" : "object-cover", imgClassName)}
        />
      )}
    </div>
  );
}

