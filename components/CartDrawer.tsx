"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CartItem } from "@/components/CartItem";
import { CartTotals } from "@/components/CartTotals";
import { CloseIcon, GlobeIcon } from "@/components/Icons";
import { useStore } from "@/lib/store";

/** Slide-over cart. Opens from the header cart button or after "Add to cart". */
export function CartDrawer() {
  const { cartOpen, closeCart, lines, isCartEmpty, market } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus the close button on open and close on Escape.
  useEffect(() => {
    if (!cartOpen) return;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cartOpen, closeCart]);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-100" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/50"
        onClick={closeCart}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col bg-white shadow-drawer"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink-950">
            Your cart
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="rounded-lg p-2 text-ink-600 transition hover:bg-ink-50"
            aria-label="Close cart"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        {isCartEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-ink-600">Your cart is empty.</p>
            <p className="text-xs text-ink-500">
              Browse the catalogue and add anything eligible for an installment plan.
            </p>
            <Link href="/categories" onClick={closeCart} className="btn btn-primary">
              Start shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {lines.map((line) => (
                <CartItem key={line.product.id} line={line} />
              ))}
            </ul>

            <div className="border-t border-line bg-surface px-5 py-4">
              <CartTotals
                lines={lines}
                className="mb-4"
                action={
                  <div className="space-y-2">
                    <Link href="/checkout" onClick={closeCart} className="btn btn-primary btn-lg w-full">
                      Checkout
                    </Link>
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="btn btn-secondary w-full"
                    >
                      View full cart
                    </Link>
                    <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[0.6875rem] text-ink-500">
                      <GlobeIcon className="h-3.5 w-3.5" />
                      Prices shown in {market.currencySymbol} {market.currency} ·{" "}
                      {market.name}
                    </p>
                  </div>
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
