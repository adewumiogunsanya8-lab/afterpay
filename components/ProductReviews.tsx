import { RatingStars } from "@/components/RatingStars";
import type { CustomerReview } from "@/data/types";

/** Renders product reviews stored in the database. */
export function ProductReviews({
  reviews,
  className,
}: {
  reviews: CustomerReview[];
  className?: string;
}) {
  return (
    <section className={className} aria-label="Customer reviews">
      <ul className="space-y-3">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800"
                >
                  {review.author.slice(0, 1)}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{review.author}</p>
                  <p className="text-[0.6875rem] text-ink-500">{review.location}</p>
                </div>
              </div>
              <div className="text-right">
                <RatingStars rating={review.rating} size="xs" />
                <p className="text-[0.6875rem] text-ink-400">{review.date}</p>
              </div>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-ink-900">{review.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">{review.body}</p>
            {review.verified ? (
              <p className="mt-2 inline-flex items-center gap-1 text-[0.6875rem] font-medium text-mint-700">
                <span className="h-1.5 w-1.5 rounded-full bg-mint-500" aria-hidden="true" />
                Verified purchase
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
