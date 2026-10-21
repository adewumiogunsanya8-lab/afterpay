import { ChevronDownIcon } from "@/components/Icons";
import { FAQS } from "@/data/site";
import { cn } from "@/lib/cn";

/**
 * FAQ accordion built on native <details>/<summary> so it is keyboard
 * accessible and works without JavaScript.
 */
export function FAQ({
  items = FAQS,
  className,
}: {
  items?: readonly { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card",
        className,
      )}
    >
      {items.map((item) => (
        <details key={item.question} className="group px-5 py-1">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-ink-900 marker:hidden transition hover:text-brand-700">
            <span>{item.question}</span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-ink-400 transition group-open:rotate-180 group-open:bg-brand-50 group-open:text-brand-700">
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </span>
          </summary>
          <p className="pb-4 pr-10 text-sm leading-relaxed text-ink-600">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
