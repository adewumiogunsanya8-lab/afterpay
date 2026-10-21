"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/Icons";
import { useCategories } from "@/lib/catalogue-context";
import { cn } from "@/lib/cn";

/** Desktop "Shop" dropdown listing every category. */
export function CategoryMenu() {
  const categories = useCategories();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className="btn btn-ghost px-3 text-sm"
      >
        Shop
        <ChevronDownIcon className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[32rem] rounded-2xl border border-line bg-white p-4 shadow-lift">
          <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
            Browse the full catalogue
          </p>
          <ul className="grid grid-cols-2 gap-1">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-ink-700 transition hover:bg-brand-50 hover:text-brand-800"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
