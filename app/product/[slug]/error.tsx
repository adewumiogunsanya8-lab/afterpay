"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

export default function ProductError({
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
      title="We could not load this product"
      description="Please try again. You can also search for the product or continue browsing the store."
      backHref="/search"
      backLabel="Search products"
    />
  );
}
