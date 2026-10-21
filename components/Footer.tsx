import Link from "next/link";
import { ShieldIcon, TruckIcon } from "@/components/Icons";
import { FOOTER_COLUMNS, SITE } from "@/data/site";
import { getCategories } from "@/lib/catalogue";

/** Site footer: category shortcuts and store information. */
export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-line bg-ink-950 text-ink-200">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent"
      />
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-black text-white shadow-sm">
                A
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-mint-400 ring-2 ring-ink-950" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                After<span className="text-mint-400">Pay</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-ink-300">
              {SITE.tagline} Browse the catalogue and compare monthly payment estimates shown
              alongside eligible products.
            </p>

            <ul className="grid grid-cols-2 gap-3 pt-2 text-xs text-ink-300">
              <li className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <TruckIcon className="h-4 w-4 shrink-0 text-mint-400" /> Free shipping $75+
              </li>
              <li className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <ShieldIcon className="h-4 w-4 shrink-0 text-mint-400" /> 30-day returns
              </li>
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-white">
                  {column.heading}
                </h2>
                <ul className="space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-ink-300 transition hover:text-mint-300 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-400">
            Popular categories on {SITE.name}
          </h2>
          <ul className="flex flex-wrap gap-2 text-xs text-ink-300">
            {categories.slice(0, 12).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:border-mint-400/40 hover:bg-white/10 hover:text-white"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
