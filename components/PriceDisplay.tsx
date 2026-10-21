"use client";

import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/data/types";

/**
 * Market-aware price block: selling price, struck-through original price and
 * the discount badge. Reads the active market from the storefront store.
 */
export function PriceDisplay({
  product,
  size = "md",
  showInstallment = true,
  className,
}: {
  product: Product;
  size?: "sm" | "md" | "lg" | "xl";
  showInstallment?: boolean;
  className?: string;
}) {
  return (
    <PriceDisplayStatic
      product={product}
      size={size}
      showInstallment={showInstallment}
      className={className}
    />
  );
}

const SIZE_CLASSES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl sm:text-5xl",
} as const;

/** Server-renderable variant used where the market is already known. */
export function PriceDisplayStatic({
  product,
  size = "md",
  showInstallment = true,
  className,
}: {
  product: Product;
  size?: keyof typeof SIZE_CLASSES;
  showInstallment?: boolean;
  className?: string;
}) {
  const price = product.price;
  const original = product.originalPrice;
  const hasDiscount = product.discountPercent > 0 && original > price;

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className={cn(
            "font-bold tracking-tight text-ink-950 tabular-nums",
            SIZE_CLASSES[size],
          )}
        >
          {formatMoney(price)}
        </span>
        {hasDiscount ? (
          <>
            <span className="text-sm text-ink-400 line-through tabular-nums">
              {formatMoney(original)}
            </span>
            <span className="badge bg-ember-100 text-ember-600">
              -{product.discountPercent}%
            </span>
          </>
        ) : null}
      </div>
      {showInstallment && product.installment.eligible ? (
        <InstallmentHint product={product} />
      ) : (
        <span className="text-xs text-ink-500">Pay in full at checkout</span>
      )}
    </div>
  );
}

/** "or $83.33/month" line shown directly under the price. */
export function InstallmentHint({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const price = product.price;
  const months = product.installment.suggestedMonths;
  const monthly = price / months;
  const symbol = "$";

  return (
    <p className={cn("text-xs font-medium text-mint-700", className)}>
      or{" "}
      <span className="font-semibold tabular-nums">
        {symbol}
        {monthly.toFixed(2)}
      </span>
      /month for {months} months
      
    </p>
  );
}
