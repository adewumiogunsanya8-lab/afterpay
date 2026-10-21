"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon, SparkleIcon, TagIcon } from "@/components/Icons";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SearchBar } from "@/components/SearchBar";
import { CategoryMenu } from "@/components/CategoryMenu";
import { CategoryPill } from "@/components/CategoryCard";
import { useCategories } from "@/lib/catalogue-context";
import { useStore } from "@/lib/store";

/**
 * Sticky site header: AfterPay brand mark, search, quick links, category menu and cart.
 * The mobile drawer keeps full navigation available below the `lg` breakpoint.
 */
export function Header() {
  const { openCart, itemCount } = useStore();
  const categories = useCategories();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  // Close overlays whenever the route changes (render-time adjustment, so the
  // drawer never flashes open on the next page).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setMobileSearch(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <AnnouncementBar />

      <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/85">
        <div className="container-page">
          <div className="flex h-16 items-center gap-3 lg:h-18 lg:gap-6">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-1 rounded-xl p-2 text-ink-700 transition hover:bg-ink-50 lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5"
              aria-label="AfterPay home"
            >
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-700 to-ink-950 text-lg font-black text-white shadow-[0_10px_24px_-8px_rgb(37_99_235/0.45)] transition-transform duration-200 group-hover:scale-105">
                A
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-mint-400 ring-2 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-950" />
                </span>
              </span>
              <span className="flex flex-col leading-none">
                <span className="flex items-center gap-1 text-lg font-extrabold tracking-tight text-ink-950 sm:text-xl">
                  After<span className="text-brand-600">Pay</span>
                </span>
                <span className="hidden text-[0.625rem] font-medium tracking-wide text-ink-400 sm:block">
                  Shop now. Pay over time.
                </span>
              </span>
            </Link>

            <div className="hidden flex-1 lg:block">
              <SearchBar className="max-w-xl" />
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <div className="hidden items-center gap-1 md:flex">
                <CategoryMenu />
                <Link
                  href="/search?deals=1"
                  className="btn btn-ghost hidden px-3 py-2 text-sm text-ink-700 hover:text-brand-700 lg:inline-flex"
                >
                  <TagIcon className="h-4 w-4 text-ember-500" />
                  Deals
                </Link>
                <Link
                  href="/search?sort=newest"
                  className="btn btn-ghost hidden px-3 py-2 text-sm text-ink-700 hover:text-brand-700 xl:inline-flex"
                >
                  New Arrivals
                </Link>
                <Link
                  href="/#how-it-works"
                  className="btn btn-ghost hidden px-3 py-2 text-sm text-ink-700 hover:text-brand-700 2xl:inline-flex"
                >
                  How It Works
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setMobileSearch((value) => !value)}
                className="rounded-xl p-2.5 text-ink-700 transition hover:bg-ink-50 lg:hidden"
                aria-label="Search products"
                aria-expanded={mobileSearch}
              >
                {mobileSearch ? <CloseIcon className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={openCart}
                className="relative inline-flex items-center gap-2 rounded-full border border-ink-200 bg-surface px-3.5 py-2 text-sm font-semibold text-ink-900 shadow-xs transition hover:border-brand-300 hover:bg-brand-50/60"
                aria-label={`Open cart${itemCount ? `, ${itemCount} ${itemCount === 1 ? "item" : "items"}` : ""}`}
              >
                <CartIcon className="h-5 w-5 text-brand-600" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[0.625rem] font-bold leading-none text-white ring-2 ring-white"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {mobileSearch ? (
            <div className="pb-3 lg:hidden">
              <SearchBar
                autoFocus
                onSubmitted={() => setMobileSearch(false)}
                placeholder="Search products on AfterPay..."
              />
            </div>
          ) : null}
        </div>

        <nav aria-label="Categories" className="border-t border-line/70 bg-surface/80">
          <div className="container-page">
            <ul className="no-scrollbar flex items-center gap-2 overflow-x-auto py-2">
              <li className="shrink-0">
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  <SparkleIcon className="h-3.5 w-3.5 text-mint-300" />
                  All Categories
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.slug} className="shrink-0">
                  <CategoryPill category={category} />
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-ink-950/50"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-slide-in flex-col bg-white shadow-lift"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-ink-950 text-base font-black text-white">
                  A
                </span>
                <span className="font-extrabold tracking-tight text-ink-950">
                  After<span className="text-brand-600">Pay</span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-ink-600 hover:bg-ink-50"
                aria-label="Close menu"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto p-4">
              <ul className="grid grid-cols-2 gap-1.5">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="block rounded-xl border border-line px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
                {[
                  { href: "/categories", label: "All categories" },
                  { href: "/search?deals=1", label: "Deals" },
                  { href: "/search?sort=newest", label: "New arrivals" },
                  { href: "/search?sort=rating", label: "Best sellers" },
                  { href: "/cart", label: "Cart" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-lg px-3 py-2 font-medium text-ink-800 hover:bg-ink-50"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
