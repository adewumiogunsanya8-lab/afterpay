"use client";

import { CheckIcon, ClockIcon, TruckIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { shippingMethods } from "@/lib/fulfilment";
import { useStore, type CartLine } from "@/lib/store";
import type { CheckoutData } from "./types";

/** Shared form-control helpers. */
function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
      {hint ? <p className="mt-1 text-[0.6875rem] text-ink-400">{hint}</p> : null}
    </div>
  );
}

function RadioCard({
  checked,
  onSelect,
  title,
  description,
  price,
  icon,
  badge,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  price: string;
  icon: React.ReactNode;
  badge?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition",
        checked ? "border-brand-600 bg-brand-50/60" : "border-line hover:border-brand-300",
      )}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onSelect}
        className="mt-1 h-4 w-4 border-ink-300 text-brand-600 focus:ring-brand-500"
      />
      <span className="flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-ink-900">{title}</span>
          {badge ? <span className="badge bg-mint-100 text-mint-700">{badge}</span> : null}
        </span>
        <span className="mt-0.5 block text-xs text-ink-500">{description}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-semibold tabular-nums text-ink-900">{price}</span>
        <span className="mt-0.5 block text-ink-400">{icon}</span>
      </span>
    </label>
  );
}

/** Step 1 — contact information. */
export function ContactStep({
  data,
  update,
}: {
  data: CheckoutData;
  update: (patch: Partial<CheckoutData>) => void;
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-ink-950">Contact information</legend>
      <p className="-mt-2 text-sm text-ink-500">
        Enter your contact details for order updates.
      </p>
      <Field
        id="email"
        label="Email address"
        type="email"
        value={data.email}
        onChange={(email) => update({ email })}
        placeholder="you@example.com"
        autoComplete="email"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          value={data.firstName}
          onChange={(firstName) => update({ firstName })}
          autoComplete="given-name"
        />
        <Field
          id="lastName"
          label="Last name"
          value={data.lastName}
          onChange={(lastName) => update({ lastName })}
          autoComplete="family-name"
        />
      </div>
      <Field
        id="phone"
        label="Phone (optional)"
        value={data.phone}
        onChange={(phone) => update({ phone })}
        placeholder="For delivery updates"
        autoComplete="tel"
        hint="Optional — leave it blank if you prefer."
      />
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-600">
        <input
          type="checkbox"
          checked={data.marketing}
          onChange={(event) => update({ marketing: event.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
        />
        Send me offers and new arrivals
      </label>
    </fieldset>
  );
}


/** Step 2 — shipping address, adapted to the selected market. */
export function AddressStep({
  data,
  update,
}: {
  data: CheckoutData;
  update: (patch: Partial<CheckoutData>) => void;
}) {

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-ink-950">Shipping address</legend>
      <Field
        id="address1"
        label="Street address"
        value={data.address1}
        onChange={(address1) => update({ address1 })}
        autoComplete="address-line1"
        placeholder="221B Baker Street"
      />
      <Field
        id="address2"
        label="Apartment, suite (optional)"
        value={data.address2}
        onChange={(address2) => update({ address2 })}
        autoComplete="address-line2"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="city"
          label="City"
          value={data.city}
          onChange={(city) => update({ city })}
          autoComplete="address-level2"
        />
        <Field
          id="state"
          label="State"
          value={data.state}
          onChange={(state) => update({ state })}
          autoComplete="address-level1"
          placeholder="CA"
        />
        <Field
          id="postcode"
          label="ZIP code"
          value={data.postcode}
          onChange={(postcode) => update({ postcode })}
          autoComplete="postal-code"
          placeholder="94107"
        />
      </div>
    </fieldset>
  );
}

/** Step 3 — delivery method. */
export function DeliveryStep({
  data,
  update,
  subtotal,
}: {
  data: CheckoutData;
  update: (patch: Partial<CheckoutData>) => void;
  subtotal: number;
}) {
  const { market } = useStore();
  const methods = shippingMethods();

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-ink-950">Delivery method</legend>
      <div className="space-y-2.5">
        {methods.map((method) => {
          const free = method.id === "standard" && subtotal >= market.freeShippingThreshold;
          return (
            <RadioCard
              key={method.id}
              checked={data.method === method.id}
              onSelect={() => update({ method: method.id })}
              title={method.name}
              description={`${method.description} · ${method.days}`}
              price={free ? "Free" : formatMoney(method.price)}
              icon={
                method.id === "express" ? (
                  <ClockIcon className="inline h-4 w-4" />
                ) : (
                  <TruckIcon className="inline h-4 w-4" />
                )
              }
            />
          );
        })}
      </div>
      <p className="flex items-start gap-2 rounded-xl bg-surface p-3 text-xs text-ink-500">
        <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
        {market.messaging.freeReturnsNote} · {market.returnsSummary}
      </p>
    </fieldset>
  );
}

/** Step 4 — choose a payment plan for each product in the cart. */
export function PaymentStep({
  data,
  update,
  lines,
}: {
  data: CheckoutData;
  update: (patch: Partial<CheckoutData>) => void;
  lines: CartLine[];
}) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-ink-950">Payment plan</legend>
      <p className="-mt-2 text-sm text-ink-500">
        Choose how you want to pay for each product.
      </p>

      {lines.map((line) => {
        const product = line.product;
        const lineTotal = product.price * line.quantity;
        const eligible =
          product.installment.eligible && lineTotal >= product.installment.minAmountUsd;
        const periods = product.installment.availableMonths.filter(
          (months) => Number.isInteger(months) && months > 0,
        );
        const selected = data.paymentSelections[product.id] ?? { choice: "full" as const, months: 0 };
        const options = [
          { choice: "full" as const, months: 0, label: "Pay in full", amount: lineTotal },
          ...(eligible
            ? periods.map((months) => ({
                choice: "installments" as const,
                months,
                label: `${months} months`,
                amount: lineTotal / months,
              }))
            : []),
        ];

        return (
          <section key={product.id} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink-950">{product.name}</h3>
              <p className="text-xs text-ink-500">
                Qty {line.quantity} · {formatMoney(lineTotal)}
              </p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {options.map((option) => {
                const isSelected =
                  selected.choice === option.choice && selected.months === option.months;

                return (
                  <button
                    key={`${option.choice}-${option.months}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      update({
                        paymentSelections: {
                          ...data.paymentSelections,
                          [product.id]: { choice: option.choice, months: option.months },
                        },
                      })
                    }
                    className={cn(
                      "flex min-h-14 items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition",
                      isSelected
                        ? "border-brand-600 bg-brand-50 text-brand-800"
                        : "border-line bg-white text-ink-700 hover:border-brand-300",
                    )}
                  >
                    <span>
                      <span className="block text-xs font-semibold">{option.label}</span>
                      <span className="mt-0.5 block text-xs tabular-nums text-ink-500">
                        {formatMoney(option.amount)}
                        {option.choice === "installments" ? "/month" : " total"}
                      </span>
                    </span>
                    {isSelected ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </fieldset>
  );
}
