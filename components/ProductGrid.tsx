import { ProductCard } from "@/components/ProductCard";
import { PackageIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";
import type { Product } from "@/data/types";

/**
 * Responsive product grid: 2 columns on mobile, 3 on tablet, 4 on desktop.
 * `priority` is applied to the first row so above-the-fold images load eagerly.
 */
export function ProductGrid({
  products,
  priorityCount = 4,
  className,
  emptyMessage = "No products match these filters yet.",
}: {
  products: Product[];
  priorityCount?: number;
  className?: string;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <PackageIcon className="h-10 w-10 text-ink-300" />
        <p className="text-sm font-medium text-ink-600">{emptyMessage}</p>
        <p className="max-w-sm text-xs text-ink-500">
          Try widening the price range, clearing a filter, or switching to a different category.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} priority={index < priorityCount} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
