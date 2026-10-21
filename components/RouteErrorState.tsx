"use client";

import Link from "next/link";
import { useEffect } from "react";

export function RouteErrorState({
  error,
  retry,
  title,
  description,
  backHref,
  backLabel,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  useEffect(() => {
    // The digest lets production logs be matched without exposing server details.
    console.error("Storefront route failed to render", { digest: error.digest });
  }, [error]);

  return (
    <section
      className="container-page grid min-h-[60vh] place-items-center py-16 text-center"
      role="alert"
    >
      <div className="max-w-lg">
        <p className="eyebrow">Temporary problem</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 text-sm leading-relaxed text-ink-500">{description}</p>
        {error.digest ? (
          <p className="mt-3 text-xs text-ink-400">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={retry} className="btn btn-primary">
            Try again
          </button>
          <Link href={backHref} className="btn btn-secondary">
            {backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
