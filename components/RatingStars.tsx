import { StarIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";

/** Accessible star rating. Renders five stars plus the numeric value. */
export function RatingStars({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const dimension = size === "xs" ? "h-3 w-3" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className="flex items-center gap-0.5 text-ember-500"
        role="img"
        aria-label={`Rated ${rating} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((position) => (
          <StarIcon
            key={position}
            className={dimension}
            filled={rounded >= position}
            style={
              rounded === position - 0.5
                ? { opacity: 0.55 }
                : { opacity: rounded >= position ? 1 : 0.25 }
            }
          />
        ))}
      </span>
      <span className="text-xs font-semibold text-ink-700">{rating.toFixed(1)}</span>
    </div>
  );
}
