import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", "text-ink-400")}>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm max-w-sm mx-auto">{description}</p>
      ) : null}
      {action ? (
        <a
          href={action.href}
          className={cn("mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700")}
        >
          {action.label}
        </a>
      ) : null}
    </div>
  );
}