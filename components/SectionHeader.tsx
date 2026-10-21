import Link from "next/link";
import { ArrowRightIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";

/** Section heading with an optional eyebrow, description and "view all" link. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  align = "start",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  align?: "start" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow ? (
          <p className="eyebrow mb-2 inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-brand-500"
            />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="heading">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-500 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 transition hover:text-brand-900"
        >
          {action.label}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
