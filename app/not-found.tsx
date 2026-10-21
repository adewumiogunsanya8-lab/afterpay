import Link from "next/link";
import { SearchIcon } from "@/components/Icons";

/** 404 page. */
export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-500">
          The link may be out of date, or the product may have been renamed. Try a search or
          start from the categories.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/categories" className="btn btn-primary">
            Browse categories
          </Link>
          <Link href="/search" className="btn btn-secondary">
            <SearchIcon className="h-4 w-4" />
            Search products
          </Link>
        </div>
      </div>
    </div>
  );
}
