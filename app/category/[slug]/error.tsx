"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

export default function CategoryError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteErrorState
      error={error}
      retry={retry}
      title="We could not load this category"
      description="Please try again. If the problem continues, browse another category or search the store."
      backHref="/categories"
      backLabel="Browse categories"
    />
  );
}
