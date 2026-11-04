"use client";

import type { ReactNode } from "react";
import { TruckIcon } from "@/components/Icons";
import { calculateTotals, type ShippingMethodId } from "@/lib/fulfilment";
import { formatMoney } from "@/lib/format";
import { useStore, type CartLine, type PaymentSelection } from "@/lib/store";
import { cn } from "@/lib/cn";

/**
 * Order summary block shared by the cart page, the drawer and checkout.
 * Shared order summary for the cart, drawer and checkout.
 */
export function CartTotals({
  lines,
  method = "standard",
  className,
  showAction = true,
  action,
  paymentSelections,
}: {
  lines: CartLine[];
  method?: ShippingMethodId;
  className?: string;
  showAction?: boolean;
  action?: ReactNode;
  /** Per-product payment plan selections. Falls back to the cart store. */
  paymentSelections?: Record<string, PaymentSelection>;
}) {
  const { market, paymentSelections: storeSelections } = useStore();
  const selections = paymentSelections ?? storeSelections;

  /**
   * Plan-aware subtotal: the sum of each line's selected payment-plan amount.
   * Pay-in-full lines contribute their full price; installment lines contribute
   * their per-month amount (line total ÷ months). Defaults (all pay-in-full)
   * behave exactly as before.
   */
  const planSubtotal = lines.reduce((sum, line) => {
    const selection = selections[line.product.id] ?? {
      choice: "full",
      months: 0,
    };
    const lineTotal = line.product.price * line.quantity;
    if (selection.choice === "installments" && selection.months > 0) {
      return sum + lineTotal / selection.months;
    }
    return sum + lineTotal;
  }, 0);

  const savings = lines.reduce(
    (sum, line) =>
      sum +
      Math.max(0, line.product.originalPrice - line.product.price) * line.quantity,
    0,
  );
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const totals = calculateTotals({ subtotal: planSubtotal, savings, itemCount, method });

  return (
    <div className={cn("space-y-4", className)}>
      <dl className="space-y-2.5 text-sm">
        <Row
          label="Subtotal"
          value={formatMoney(totals.subtotal)}
        />
        {totals.savings > 0 ? (
          <Row
            label="Product savings"
            value={`−${formatMoney(totals.savings)}`}
            valueClassName="text-mint-700"
          />
        ) : null}
        <Row
          label={totals.shippingLabel}
          value={
            totals.shipping === 0 ? (
              <span className="font-semibold text-mint-700">Free</span>
            ) : (
              formatMoney(totals.shipping)
            )
          }
        />
        <Row label={totals.taxLabel} value={formatMoney(totals.tax)} />
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3 text-base">
          <dt className="font-semibold text-ink-950">Total</dt>
          <dd className="text-xl font-bold tabular-nums text-ink-950">
            {formatMoney(totals.total)}
          </dd>
        </div>
      </dl>

      <ul className="space-y-1.5 text-xs text-ink-500">
        <li className="flex items-start gap-2">
          <TruckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-600" />
          {market.messaging.shippingNote}
        </li>
      </ul>

      {showAction && action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-600">{label}</dt>
      <dd className={cn("font-medium tabular-nums text-ink-900", valueClassName)}>{value}</dd>
    </div>
  );
}
