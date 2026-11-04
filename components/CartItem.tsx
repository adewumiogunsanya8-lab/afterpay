"use client";

import Link from "next/link";
import { CheckIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/Icons";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { useStore, type CartLine, type PaymentSelection } from "@/lib/store";

/** A single cart row with quantity stepper and remove control. */
export function CartItem({ line }: { line: CartLine }) {
  const { setQuantity, removeItem, paymentSelections, setPaymentSelection } = useStore();
  const { product, quantity } = line;
  const unit = product.price;
  const lineTotal = unit * quantity;
  const installment = product.installment;
  const eligible = installment.eligible && lineTotal >= installment.minAmountUsd;
  const periods = installment.availableMonths.filter(
    (months) => Number.isInteger(months) && months > 0,
  );
  const selection: PaymentSelection = paymentSelections[product.id] ?? {
    choice: "full",
    months: 0,
  };
  const options = [
    { choice: "full" as const, months: 0, label: "Pay in full" },
    ...(eligible
      ? periods.map((months) => ({
          choice: "installments" as const,
          months,
          label: `${months} months`,
        }))
      : []),
  ];
  const isSelected = (option: (typeof options)[number]) =>
    selection.choice === option.choice && selection.months === option.months;
  const monthly =
    selection.choice === "installments" && selection.months > 0
      ? lineTotal / selection.months
      : null;

  return (
    <li className="flex gap-3 py-4">
      <Link href={`/product/${product.slug}`} className="shrink-0">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-24 w-28 rounded-xl"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
              {product.brand}
            </p>
            <Link
              href={`/product/${product.slug}`}
              className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-700"
            >
              {product.name}
            </Link>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-ink-950">
            {formatMoney(lineTotal)}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {options.map((option) => {
            const active = isSelected(option);
            return (
              <button
                key={`${option.choice}-${option.months}`}
                type="button"
                onClick={() =>
                  setPaymentSelection(product.id, {
                    choice: option.choice,
                    months: option.months,
                  })
                }
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[0.6875rem] transition",
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-line bg-white text-ink-600 hover:border-brand-300",
                )}
              >
                {option.label}
                {active ? <CheckIcon className="h-3 w-3" /> : null}
              </button>
            );
          })}
        </div>

        {monthly !== null ? (
          <p className="mt-1 text-xs font-medium text-mint-700">
            {selection.months} monthly payments of {formatMoney(monthly)}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="inline-flex items-center rounded-full border border-ink-200">
            <button
              type="button"
              onClick={() => setQuantity(product.id, quantity - 1)}
              className="rounded-l-full p-1.5 text-ink-600 transition hover:bg-ink-50"
              aria-label={`Decrease quantity of ${product.name}`}
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(product.id, quantity + 1)}
              className="rounded-r-full p-1.5 text-ink-600 transition hover:bg-ink-50"
              aria-label={`Increase quantity of ${product.name}`}
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-ink-500",
              "transition hover:bg-ember-100 hover:text-ember-600",
            )}
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
