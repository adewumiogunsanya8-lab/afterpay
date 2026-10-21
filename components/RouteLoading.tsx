function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`skeleton rounded-xl ${className}`} />;
}

/** Full-page fallback while the request-time storefront data is being loaded. */
export function StoreBootstrapLoading() {
  return (
    <div
      className="min-h-[100dvh] bg-canvas"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading the store"
    >
      <span className="sr-only">Loading the store…</span>
      <header className="border-b border-line bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2.5 w-32" />
            </div>
          </div>
          <Skeleton className="hidden h-10 w-72 rounded-full lg:block" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="border-t border-line/70">
          <div className="container-page flex gap-2 py-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-7 w-24 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </header>
      <main className="container-page grid min-h-[65vh] place-items-center py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600 motion-reduce:animate-none" />
          <div>
            <p className="font-semibold text-ink-900">Getting the store ready</p>
            <p className="mt-1 text-sm text-ink-500">This should only take a moment.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Skeleton matching the category banner, filters and product listing. */
export function CategoryRouteLoading() {
  return (
    <div
      className="min-h-[70vh]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading category"
    >
      <span className="sr-only">Loading category and products…</span>
      <div className="border-b border-line bg-surface">
        <div className="container-page py-8 sm:py-10">
          <Skeleton className="h-4 w-48" />
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3 max-w-md" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-4/5 max-w-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-32 rounded-full" />
                <Skeleton className="h-7 w-48 rounded-full" />
              </div>
            </div>
            <Skeleton className="hidden aspect-4/3 w-full rounded-2xl lg:block" />
          </div>
        </div>
      </div>
      <div className="container-page py-8">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <Skeleton className="hidden h-80 rounded-2xl lg:block" />
          <div>
            <div className="mb-4 flex justify-end">
              <Skeleton className="h-10 w-40 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-line bg-white p-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="mt-4 h-4 w-4/5" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                  <Skeleton className="mt-5 h-9 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton matching the main product details while its slug data loads. */
export function ProductRouteLoading() {
  return (
    <div
      className="container-page min-h-[70vh] py-6 sm:py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading product"
    >
      <span className="sr-only">Loading product details…</span>
      <Skeleton className="h-4 w-56" />
      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-5 py-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-4/5 max-w-lg" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-4 w-5/6 max-w-lg" />
          <Skeleton className="h-14 w-56 rounded-xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
