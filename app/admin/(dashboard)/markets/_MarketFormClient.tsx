"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminCreateMarket, adminUpdateMarket } from "../../actions/markets";
import { cn } from "@/lib/cn";

export type MarketFormValues = {
  name: string;
  shortName: string;
  flag: string;
  currencySymbol: string;
  locale: string;
  standardShipping: number;
  expressShipping: number;
  freeShippingThreshold: number;
  estimatedTaxRate: number;
  estimatedTaxLabel: string;
  standardDeliveryDays: string;
  expressDeliveryDays: string;
  returnsSummary: string;
  shippingNote: string;
  freeReturnsNote: string;
  installmentNote: string;
  isDefault: boolean;
  sortOrder: number;
};

const EMPTY_MARKET: MarketFormValues = {
  name: "United States",
  shortName: "US",
  flag: "🇺🇸",
  currencySymbol: "$",
  locale: "en-US",
  standardShipping: 4.99,
  expressShipping: 14.99,
  freeShippingThreshold: 75,
  estimatedTaxRate: 0.0825,
  estimatedTaxLabel: "Estimated sales tax",
  standardDeliveryDays: "3-5 business days",
  expressDeliveryDays: "1-2 business days",
  returnsSummary: "Free 30-day returns",
  shippingNote: "Free standard shipping on orders over $75",
  freeReturnsNote: "Free 30-day returns",
  installmentNote: "Choose an installment plan at checkout.",
  isDefault: true,
  sortOrder: 0,
};

function Field({
  label,
  name,
  value,
  type = "text",
  required,
  min,
  max,
  step,
  help,
}: {
  label: string;
  name: string;
  value: string | number;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
  help?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-ink-700">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        min={min}
        max={max}
        step={step}
        className="block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm ring-1 ring-inset ring-ink-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 transition"
      />
      {help ? <p className="text-xs text-ink-500">{help}</p> : null}
    </div>
  );
}

export default function MarketFormClient({
  initial,
}: {
  initial?: MarketFormValues;
}) {
  const marketCode = initial ? "US" : undefined;
  const action = marketCode
    ? adminUpdateMarket.bind(null, marketCode)
    : adminCreateMarket;
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();
  const values = initial ?? EMPTY_MARKET;
  const editing = Boolean(marketCode);

  useEffect(() => {
    if (state?.ok) router.push("/admin/markets");
  }, [router, state]);

  return (
    <div className="rounded-xl border border-line bg-white shadow-sm">
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-lg font-semibold text-ink-950">{editing ? `Edit ${values.name}` : "Add US market"}</h2>
      </div>
      <form action={formAction} className="space-y-6 p-6">
        {state && !state.ok ? (
          <ul className="list-disc space-y-1 rounded-lg bg-ember-50 p-4 text-sm text-ember-700">
            {state.errors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        ) : null}

        <div className="rounded-lg bg-surface p-4 text-sm text-ink-700">
          This storefront currently supports the United States and USD. The market code is US.
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Market name" name="name" value={values.name} required />
          <Field label="Short name" name="shortName" value={values.shortName} required />
          <Field label="Flag emoji" name="flag" value={values.flag} required />
          <Field label="Currency symbol" name="currencySymbol" value={values.currencySymbol} required />
          <Field label="Locale" name="locale" value={values.locale} required />
          <Field label="Estimated tax rate" name="estimatedTaxRate" type="number" value={values.estimatedTaxRate} min={0} max={1} step="0.0001" help="Enter a fraction, for example 0.0825 for 8.25%." required />
          <Field label="Tax label" name="estimatedTaxLabel" value={values.estimatedTaxLabel} required />
          <Field label="Standard shipping (USD)" name="standardShipping" type="number" value={values.standardShipping} min={0} step="0.01" required />
          <Field label="Express shipping (USD)" name="expressShipping" type="number" value={values.expressShipping} min={0} step="0.01" required />
          <Field label="Free shipping threshold (USD)" name="freeShippingThreshold" type="number" value={values.freeShippingThreshold} min={0} step="0.01" required />
          <Field label="Standard delivery estimate" name="standardDeliveryDays" value={values.standardDeliveryDays} required />
          <Field label="Express delivery estimate" name="expressDeliveryDays" value={values.expressDeliveryDays} required />
          <Field label="Returns summary" name="returnsSummary" value={values.returnsSummary} required />
          <Field label="Shipping note" name="shippingNote" value={values.shippingNote} />
          <Field label="Free returns note" name="freeReturnsNote" value={values.freeReturnsNote} />
          <Field label="Installment note" name="installmentNote" value={values.installmentNote} />
          <Field label="Sort order" name="sortOrder" type="number" value={values.sortOrder} min={0} required />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input defaultChecked={values.isDefault} name="isDefault" type="checkbox" className="rounded border-ink-300 text-brand-600 focus:ring-brand-600" />
          Default market
        </label>

        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <Link href="/admin/markets" className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50">Cancel</Link>
          <button type="submit" disabled={isPending} className={cn("rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70", isPending && "pointer-events-none")}>
            {isPending ? "Saving…" : editing ? "Save market" : "Create market"}
          </button>
        </div>
      </form>
    </div>
  );
}
