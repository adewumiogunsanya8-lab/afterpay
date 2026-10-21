"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/Icons";
import { ProductImage } from "@/components/ProductImage";
import { useStore, type CartLine } from "@/lib/store";
import { formatMoney } from "@/lib/format";
import type { CheckoutData, PlacedOrder, StepId } from "./types";

/** Step 5 — review everything before placing the order. */
export function ReviewStep({
  data,
  lines,
  editStep,
}: {
  data: CheckoutData;
  lines: CartLine[];
  editStep: (step: StepId) => void;
}) {
  const { market } = useStore();
  const deliveryLabel =
    data.method === "express"
      ? `${market.code === "US" ? "Express shipping" : "Express delivery"} · ${market.expressDeliveryDays}`
      : `${market.code === "US" ? "Standard shipping" : "Standard delivery"} · ${market.standardDeliveryDays}`;

  return (
    <div>
      <h2 className="text-lg font-semibold text-ink-950">Review your order</h2>
      <p className="mt-1 text-sm text-ink-500">
        Check your contact, delivery and order details before confirming.
      </p>

      <dl className="mt-5 space-y-3">
        <ReviewRow label="Contact" step="contact" onEdit={editStep}>
          {data.email}
          <br />
          {data.firstName} {data.lastName}
          {data.phone ? ` · ${data.phone}` : ""}
        </ReviewRow>

        <ReviewRow label="Shipping address" step="address" onEdit={editStep}>
          {data.address1}
          {data.address2 ? `, ${data.address2}` : ""}
          <br />
          {data.city}, {data.state} {data.postcode}
        </ReviewRow>

        <ReviewRow label="Delivery" step="delivery" onEdit={editStep}>
          {deliveryLabel}
        </ReviewRow>

        <ReviewRow label="Payment" step="payment" onEdit={editStep}>
          <ul className="space-y-2">
            {lines.map((line) => {
              const selection = data.paymentSelections[line.product.id] ?? {
                choice: "full" as const,
                months: 0,
              };
              const lineTotal = line.product.price * line.quantity;

              return (
                <li key={line.product.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <span>{line.product.name} · Qty {line.quantity}</span>
                  <span className="font-medium">
                    {selection.choice === "installments"
                      ? `${selection.months} monthly payments of ${formatMoney(
                          lineTotal / selection.months,
                        )}`
                      : `Pay in full · ${formatMoney(lineTotal)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </ReviewRow>
      </dl>
    </div>
  );
}

function ReviewRow({
  label,
  step,
  onEdit,
  children,
}: {
  label: string;
  step: StepId;
  onEdit: (step: StepId) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-line p-3">
      <div className="min-w-0 text-sm text-ink-700">
        <dt className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
          {label}
        </dt>
        <dd>{children}</dd>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        className="text-xs font-semibold text-brand-700 hover:underline"
      >
        Edit
      </button>
    </div>
  );
}

/** Step 6 — the confirmation screen. */
export function Confirmation({ order }: { order: PlacedOrder }) {
  const { market } = useStore();
  const deliveryDays =
    order.data.method === "express" ? market.expressDeliveryDays : market.standardDeliveryDays;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="card overflow-hidden">
          <div className="bg-ink-950 px-6 py-8 text-center text-white">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint-500 text-ink-950">
              <CheckIcon className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Order confirmed</h1>
            <p className="mt-1 text-sm text-ink-300">
              Order {order.reference} · placed {order.placedAt.slice(0, 16).replace("T", " ")} UTC
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold text-ink-950">Contact</h2>
                <p className="mt-1 text-sm text-ink-600">{order.name}</p>
                <p className="text-sm text-ink-600">{order.email}</p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-ink-950">Shipping to</h2>
                <p className="mt-1 text-sm text-ink-600">{order.address}</p>
                <p className="text-sm text-ink-600">
                  {order.data.method === "express" ? "Express" : "Standard"} · {deliveryDays}
                </p>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold text-ink-950">Items</h2>
              <ul className="divide-y divide-line rounded-xl border border-line">
                {order.lines.map((line) => {
                  const selection = order.data.paymentSelections[line.product.id] ?? {
                    choice: "full" as const,
                    months: 0,
                  };
                  const lineTotal = line.product.price * line.quantity;

                  return (
                    <li key={line.product.id} className="flex items-center gap-3 p-3">
                      <ProductImage
                        src={line.product.image}
                        alt=""
                        className="h-14 w-16 shrink-0 rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-900">
                          {line.product.name}
                        </p>
                        <p className="text-xs text-ink-500">
                          {line.product.brand} · Qty {line.quantity}
                        </p>
                        <p className="text-xs text-ink-600">
                          {selection.choice === "installments"
                            ? `${selection.months} monthly payments of ${formatMoney(
                                lineTotal / selection.months,
                              )}`
                            : "Pay in full"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-ink-900">
                        {formatMoney(lineTotal)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-600">Subtotal</dt>
                <dd className="tabular-nums">{formatMoney(order.totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">Shipping</dt>
                <dd className="tabular-nums">
                  {order.totals.shipping === 0
                    ? "Free"
                    : formatMoney(order.totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">{order.totals.taxLabel}</dt>
                <dd className="tabular-nums">{formatMoney(order.totals.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(order.totals.total)}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2">
              <Link href="/categories" className="btn btn-primary">
                Continue shopping
              </Link>
              <Link href="/" className="btn btn-secondary">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

