"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartTotals } from "@/components/CartTotals";
import { CheckIcon, ChevronLeftIcon } from "@/components/Icons";
import { ProductImage } from "@/components/ProductImage";
import { submitOrder } from "@/app/checkout/actions";
import { calculateTotals } from "@/lib/fulfilment";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { AddressStep, ContactStep, DeliveryStep, PaymentStep } from "./steps";
import { Confirmation, ReviewStep } from "./ReviewConfirmation";
import {
  CHECKOUT_STEPS,
  EMPTY_CHECKOUT,
  validateStep,
  type CheckoutData,
  type PlacedOrder,
  type StepId,
} from "./types";

/** Six-step checkout. */
export function CheckoutFlow() {
  const { lines, isCartEmpty, clearCart, hydrated, market } = useStore();
  const [step, setStep] = useState<StepId>("contact");
  const [data, setData] = useState<CheckoutData>(EMPTY_CHECKOUT);
  const [errors, setErrors] = useState<string[]>([]);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    [lines],
  );
  const savings = useMemo(
    () =>
      lines.reduce(
        (sum, line) =>
          sum +
          Math.max(0, line.product.originalPrice - line.product.price) * line.quantity,
        0,
      ),
    [lines],
  );
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  const totals = calculateTotals({ subtotal, savings, itemCount, method: data.method });
  const stepIndex = CHECKOUT_STEPS.findIndex((entry) => entry.id === step);

  function update(patch: Partial<CheckoutData>) {
    setData((current) => ({ ...current, ...patch }));
  }

  function goTo(next: StepId) {
    setErrors([]);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    const problems = validateStep(step, data);
    if (problems.length) {
      setErrors(problems);
      return;
    }
    const target = CHECKOUT_STEPS[stepIndex + 1];
    if (target) goTo(target.id);
  }

  const [submitting, setSubmitting] = useState(false);

  /**
   * Hands the order to the server, which recomputes every figure from the
   * database and writes the order, its lines and their payment choices in one
   * transaction.
   */
  async function placeOrder() {
    const problems = validateStep("review", data);
    if (problems.length) {
      setErrors(problems);
      return;
    }
    setSubmitting(true);
    setErrors([]);

    const result = await submitOrder({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      state: data.state,
      postcode: data.postcode,
      marketCode: market.code,
      shippingMethod: data.method,
      paymentSelections: Object.fromEntries(
        lines.map((line) => [
          line.product.id,
          data.paymentSelections[line.product.id] ?? { choice: "full", months: 0 },
        ]),
      ),
      marketingOptIn: data.marketing,
      lines: lines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
      })),
    });

    if (!result.ok) {
      setErrors([result.error]);
      setSubmitting(false);
      return;
    }

    setOrder({
      reference: result.reference,
      placedAt: new Date().toISOString(),
      email: data.email,
      name: `${data.firstName} ${data.lastName}`.trim(),
      address: [data.address1, data.address2, data.city, data.state, data.postcode]
        .filter(Boolean)
        .join(", "),
      data,
      lines,
      totals,
    });
    clearCart();
    goTo("confirmation");
  }

  // Avoid an empty-state flash while the persisted cart is still being read.
  if (!order && isCartEmpty && !hydrated) {
    return (
      <div className="container-page grid min-h-[40vh] place-items-center py-16 text-center">
        <p className="text-sm text-ink-500">Loading your cart…</p>
      </div>
    );
  }

  // An empty cart (after placing an order) means there is nothing to check out.
  if (!order && isCartEmpty) {
    return (
      <div className="mx-auto grid max-w-2xl place-items-center gap-4 px-4 py-20 text-center">
        <h1 className="heading">Your cart is empty</h1>
        <p className="text-sm text-ink-500">
          Add a product from the catalogue before heading to checkout.
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
    );
  }

  if (order) return <Confirmation order={order} />;

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Checkout progress" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2">
          {CHECKOUT_STEPS.filter((entry) => entry.id !== "confirmation").map((entry, index) => {
            const state = index < stepIndex ? "done" : index === stepIndex ? "current" : "todo";
            return (
              <li key={entry.id} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={state === "todo"}
                  onClick={() => goTo(entry.id)}
                  aria-current={state === "current" ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    state === "current" && "border-brand-600 bg-brand-600 text-white",
                    state === "done" &&
                      "border-mint-200 bg-mint-50 text-mint-800 hover:border-mint-400",
                    state === "todo" && "border-line bg-white text-ink-400",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[0.5625rem]",
                      state === "current" && "bg-white/20",
                      state === "done" && "bg-mint-200",
                      state === "todo" && "bg-ink-100 text-ink-500",
                    )}
                  >
                    {state === "done" ? <CheckIcon className="h-2.5 w-2.5" /> : index + 1}
                  </span>
                  {entry.label}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="card p-5 sm:p-6">
          {errors.length > 0 ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-ember-400/50 bg-ember-100 p-3 text-sm text-ember-600"
            >
              <p className="font-semibold">Please fix the following:</p>
              <ul className="mt-1 list-inside list-disc">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {step === "contact" ? <ContactStep data={data} update={update} /> : null}
          {step === "address" ? <AddressStep data={data} update={update} /> : null}
          {step === "delivery" ? (
            <DeliveryStep data={data} update={update} subtotal={subtotal} />
          ) : null}
          {step === "payment" ? (
            <PaymentStep
              data={data}
              update={update}
              lines={lines}
            />
          ) : null}
          {step === "review" ? (
            <ReviewStep data={data} lines={lines} editStep={goTo} />
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={() => goTo(CHECKOUT_STEPS[stepIndex - 1].id)}
                className="btn btn-secondary"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Back
              </button>
            ) : (
              <Link href="/cart" className="btn btn-ghost">
                <ChevronLeftIcon className="h-4 w-4" />
                Back to cart
              </Link>
            )}

            {step === "review" ? (
              <button
                type="button"
                onClick={placeOrder}
                disabled={submitting}
                className="btn btn-primary btn-lg"
              >
                {submitting ? "Placing order…" : "Place order"}
              </button>
            ) : (
              <button type="button" onClick={next} className="btn btn-primary btn-lg">
                Continue
              </button>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <div className="card p-5">
            <h2 className="mb-3 text-base font-semibold text-ink-950">
              Order summary
            </h2>
            <ul className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {lines.map((line) => {
                const selection = data.paymentSelections[line.product.id] ?? {
                  choice: "full" as const,
                  months: 0,
                };
                const lineTotal = line.product.price * line.quantity;

                return (
                  <li key={line.product.id} className="flex items-center gap-3">
                    <ProductImage
                      src={line.product.image}
                      alt=""
                      className="h-14 w-16 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink-900">{line.product.name}</p>
                      <p className="text-[0.6875rem] text-ink-500">
                        Qty {line.quantity} · {formatMoney(line.product.price)}
                      </p>
                      <p className="mt-0.5 text-[0.6875rem] text-ink-600">
                        {selection.choice === "installments"
                          ? `${selection.months} monthly payments of ${formatMoney(
                              lineTotal / selection.months,
                            )}`
                          : "Pay in full"}
                      </p>
                    </div>
                    <p className="text-xs font-semibold tabular-nums text-ink-900">
                      {formatMoney(lineTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>
            <CartTotals lines={lines} method={data.method} />
          </div>

        </aside>
      </div>
    </div>
  );
}

