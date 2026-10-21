import type { ShippingMethodId } from "@/lib/fulfilment";
import type { CartLine } from "@/lib/store";
import type { OrderTotals } from "@/lib/fulfilment";

/** Shared types for the six-step checkout. */

export const CHECKOUT_STEPS = [
  { id: "contact", label: "Contact" },
  { id: "address", label: "Shipping address" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
  { id: "confirmation", label: "Confirmation" },
] as const;

export type StepId = (typeof CHECKOUT_STEPS)[number]["id"];

export type PaymentChoice = "full" | "installments";

export type ProductPaymentSelection = {
  choice: PaymentChoice;
  months: number;
};

export type CheckoutData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  method: ShippingMethodId;
  paymentSelections: Record<string, ProductPaymentSelection>;
  marketing: boolean;
};

export const EMPTY_CHECKOUT: CheckoutData = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  method: "standard",
  paymentSelections: {},
  marketing: false,
};

export type PlacedOrder = {
  reference: string;
  placedAt: string;
  email: string;
  name: string;
  address: string;
  data: CheckoutData;
  lines: CartLine[];
  totals: OrderTotals;
};

/** Per-step validation messages. Empty array means the step is complete. */
export function validateStep(step: StepId, data: CheckoutData): string[] {
  const errors: string[] = [];
  const required: [string, boolean][] = [
    ["Email address", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)],
    ["First name", data.firstName.trim().length > 1],
    ["Last name", data.lastName.trim().length > 1],
    ["Street address", data.address1.trim().length > 3],
    ["City", data.city.trim().length > 1],
    ["State / county", data.state.trim().length > 1],
    ["ZIP / postcode", data.postcode.trim().length > 2],
  ];

  if (step === "contact" || step === "address" || step === "review" || step === "confirmation") {
    for (const [label, valid] of required) {
      if (!valid) errors.push(`${label} is required.`);
    }
  }

  return errors;
}
