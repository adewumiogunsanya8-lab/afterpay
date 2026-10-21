import Link from "next/link";
import { ArrowRightIcon, SparkleIcon } from "@/components/Icons";
import { ProductImage } from "@/components/ProductImage";
import type { CategoryWithStats } from "@/lib/catalogue";
import type { Category } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";

/**
 * Category tile used on the homepage rail and the categories page.
 *
 * Price details come from the caller (they are aggregated in SQL by
 * `getCategoriesWithStats`) so this card never queries the catalogue itself.
 */
export function CategoryCard({
  category,
  showPrice = true,
  priority = false,
  className,
}: {
  category: Category | CategoryWithStats;
  showPrice?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const stats = category as Partial<CategoryWithStats>;
  const cheapest = stats.cheapestPrice ?? null;
  const monthly = stats.lowestMonthly ?? null;

  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div className="relative">
        <ProductImage
          src={stats.bannerImage ?? ""}
          alt={`${category.name} category`}
          priority={priority}
          className="aspect-16/9 w-full"
          imgClassName="transition duration-500 group-hover:scale-[1.04]"
        />
        {monthly !== null ? (
          <span className="absolute right-3 top-3 badge bg-ink-950/85 text-mint-300 shadow-sm backdrop-blur-sm">
            from ${monthly.toFixed(2)}/mo
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-base font-semibold text-ink-950 group-hover:text-brand-700">
          {category.name}
        </h3>
        <p className="text-xs leading-relaxed text-ink-500">{category.tagline}</p>

        {showPrice ? (
          <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-xs">
            {cheapest !== null ? (
              <span className="font-semibold text-ink-800">
                from {formatMoney(cheapest)}
              </span>
            ) : null}
            {monthly !== null ? (
              <span className="text-mint-700">or ${monthly.toFixed(2)}/mo</span>
            ) : null}
          </div>
        ) : null}

        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
          Browse {category.name}
          <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Compact pill used for the category rail under the hero. */
export function CategoryPill({ category }: { category: Category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="chip shrink-0 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
    >
      <SparkleIcon className="h-3.5 w-3.5 text-brand-500" />
      {category.name}
    </Link>
  );
}
