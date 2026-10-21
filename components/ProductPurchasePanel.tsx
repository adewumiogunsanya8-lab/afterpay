"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartIcon, CheckIcon, MinusIcon, PlusIcon, TruckIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { toCartProduct, useStore } from "@/lib/store";
import type { Product } from "@/data/types";

/**
 * Product buy box: quantity selector, Add to Cart, Buy Now and the
 * "Pay in installments" call to action. Buy Now jumps straight into the
 * checkout with this product in the cart.
 */
export function ProductPurchasePanel({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const router = useRouter();
  const { addItem, market } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const total = product.price * quantity;
  const months = product.installment.suggestedMonths;

  function add() {
    addItem(toCartProduct(product), quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function buyNow() {
    addItem(toCartProduct(product), quantity);
    router.push("/checkout");
  }

  return (
    <div className={cn("rounded-2xl border border-line bg-white p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <p className="label mb-0">Quantity</p>
          <p className="text-[0.6875rem] text-ink-400">
            {outOfStock
              ? "Out of stock"
              : product.stock < 10
                ? `Only ${product.stock} left`
                : `${product.stock} in stock`}
          </p>
        </div>
        <div className="ml-auto inline-flex items-center rounded-full border border-ink-200">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            className="rounded-l-full p-2 text-ink-600 transition hover:bg-ink-50 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <span
            className="min-w-9 text-center text-sm font-semibold tabular-nums"
            aria-live="polite"
            aria-label="Quantity"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(product.stock || 99, value + 1))}
            disabled={outOfStock || quantity >= product.stock}
            className="rounded-r-full p-2 text-ink-600 transition hover:bg-ink-50 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={add}
          disabled={outOfStock}
          className={cn("btn btn-lg w-full", added ? "btn-mint" : "btn-primary")}
        >
          {added ? (
            <>
              <CheckIcon className="h-4.5 w-4.5" /> Added to cart
            </>
          ) : (
            <>
              <CartIcon className="h-4.5 w-4.5" />
              {outOfStock ? "Out of stock" : `Add to cart · ${formatMoney(total)}`}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={buyNow}
          disabled={outOfStock}
          className="btn btn-secondary btn-lg w-full"
        >
          Buy now
        </button>

        {product.installment.eligible ? (
          <Link
            href="/checkout"
            onClick={() => addItem(toCartProduct(product), quantity)}
            className="btn btn-dark btn-lg w-full"
          >
            Pay in installments · {formatMoney(total / months)}/mo
          </Link>
        ) : (
          <p className="rounded-xl bg-surface px-3 py-2.5 text-center text-xs text-ink-500">
            Installments are not available for this item.
          </p>
        )}
      </div>

      <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs text-ink-600">
        <li className="flex items-center gap-2">
          <TruckIcon className="h-3.5 w-3.5 text-mint-600" />
          {market.standardDeliveryDays} · {market.messaging.shippingNote}
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon className="h-3.5 w-3.5 text-mint-600" />
          {market.returnsSummary}
        </li>
      </ul>
    </div>
  );
}
