"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

export default function AppError({
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
      title="This page did not load"
      description="A temporary issue interrupted the page. Please try again or return to the store."
      backHref="/"
      backLabel="Go to the store"
    />
  );
}
