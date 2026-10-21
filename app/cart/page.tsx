"use client";

import Link from "next/link";
import { CartItem } from "@/components/CartItem";
import { CartTotals } from "@/components/CartTotals";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CartIcon, ShieldIcon, TagIcon, TruckIcon } from "@/components/Icons";
import { useCategories } from "@/lib/catalogue-context";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { useStore } from "@/lib/store";

/** Full cart page: line items, running totals and checkout call to action. */
export default function CartPage() {
  const categories = useCategories();
  const { lines, isCartEmpty, market, clearCart, hydrated } = useStore();

  const subtotal = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  );
  const remaining = Math.max(0, market.freeShippingThreshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / market.freeShippingThreshold) * 100));
  const freeShipping = remaining <= 0 && subtotal > 0;
  const shippingNoun = market.code === "US" ? "shipping" : "delivery";

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading">Your cart</h1>
          <p className="mt-1 text-sm text-ink-500">
            {hydrated && !isCartEmpty
              ? `Prices in ${market.currencySymbol} ${market.currency}`
              : "Your cart is empty."}
          </p>
        </div>
        {!isCartEmpty ? (
          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-semibold text-ink-500 transition hover:text-ember-600"
          >
            Empty cart
          </button>
        ) : null}
      </div>

      {isCartEmpty ? (
        <div className="mt-8 grid place-items-center gap-4 rounded-2xl border border-dashed border-ink-200 px-6 py-16 text-center">
          <CartIcon className="h-10 w-10 text-ink-300" />
          <h2 className="text-lg font-semibold text-ink-950">Nothing here yet</h2>
          <p className="max-w-md text-sm text-ink-500">
            Add anything from the catalogue. Eligible items can be split into 3, 6, 9 or 12
            monthly payments at checkout.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/categories" className="btn btn-primary">
              Browse categories
            </Link>
            <Link href="/search?deals=1" className="btn btn-secondary">
              Shop deals
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="card mb-4 p-4">
              <p className="text-sm font-medium text-ink-800">
                {freeShipping ? (
                  <span className="text-mint-700">
                    You have qualified for free {shippingNoun}.
                  </span>
                ) : (
                  <>
                    You are{" "}
                    <span className="font-semibold text-ink-950">
                      {formatMoney(remaining)}
                    </span>{" "}
                    away from free {shippingNoun}
                  </>
                )}
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress towards free shipping"
              >
                <div
                  className={cn("h-full rounded-full", freeShipping ? "bg-mint-500" : "bg-brand-600")}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="card divide-y divide-line px-4">
              {lines.map((line) => (
                <CartItem key={line.product.id} line={line} />
              ))}
            </ul>

            <div className="mt-4">
              <Link href="/categories" className="btn btn-secondary">
                Continue shopping
              </Link>
            </div>

            <ul className="mt-6 grid gap-3 text-xs text-ink-600 sm:grid-cols-3">
              <li className="card flex items-start gap-2 p-3">
                <TruckIcon className="h-4 w-4 shrink-0 text-mint-600" />
                {market.messaging.shippingNote}
              </li>
              <li className="card flex items-start gap-2 p-3">
                <TagIcon className="h-4 w-4 shrink-0 text-ember-500" />
                Discounts are already applied.
              </li>
              <li className="card flex items-start gap-2 p-3">
                <ShieldIcon className="h-4 w-4 shrink-0 text-brand-600" />
                Review delivery and order details before confirming.
              </li>
            </ul>
          </div>

          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="card p-5">
              <h2 className="mb-4 text-base font-semibold text-ink-950">Order summary</h2>
              <CartTotals
                lines={lines}
                showAction
                action={
                  <Link href="/checkout" className="btn btn-primary btn-lg w-full">
                    Proceed to checkout
                  </Link>
                }
              />
            </div>
          </aside>
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-ink-950">Popular with shoppers</h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {categories.slice(0, 12).map((category) => (
            <li key={category.slug}>
              <Link
                href={`/category/${category.slug}`}
                className="chip transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
