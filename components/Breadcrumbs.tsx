import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";

export type Crumb = {
  label: string;
  href?: string;
};

/** Breadcrumb trail — the final item is marked as the current page. */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-ink-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="rounded hover:text-brand-700 hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("font-medium", isLast ? "text-ink-800" : "text-ink-500")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRightIcon className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
