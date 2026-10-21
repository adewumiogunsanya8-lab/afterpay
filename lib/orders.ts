import { prisma } from "@/lib/db";
import { round2 } from "@/lib/format";
import type {
  CountryCode,
  CurrencyCode,
  PaymentChoice,
  ShippingMethodId,
} from "@/lib/generated/prisma/client";

/**
 * Order placement.
 *
 * This writes the order and each product's selected payment option to Postgres.
 *
 * Every figure is recomputed on the server from the database. The client's
 * totals are never trusted: prices, tax rate and shipping all come from the
 * `products` / `markets` tables at write time.
 */

export type PlaceOrderInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  marketCode: CountryCode;
  shippingMethod: ShippingMethodId;
  paymentSelections: Record<string, { choice: PaymentChoice; months: number }>;
  marketingOptIn: boolean;
  /** Product id + quantity, exactly as shown in the cart. */
  lines: { productId: string; quantity: number }[];
};

export type PlaceOrderResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

/** Human-facing reference, e.g. `FBX-9K2M4QX`. */
function buildReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 7; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `FBX-${suffix}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!input || typeof input !== "object" || !Array.isArray(input.lines) || !input.lines.length) {
    return { ok: false, error: "Your cart is empty." };
  }

  const quantities = new Map<string, number>();
  for (const line of input.lines) {
    if (
      !line ||
      typeof line.productId !== "string" ||
      !line.productId ||
      quantities.has(line.productId) ||
      !Number.isInteger(line.quantity) ||
      line.quantity < 1 ||
      line.quantity > 99
    ) {
      return { ok: false, error: "Your cart contains an invalid quantity." };
    }
    quantities.set(line.productId, line.quantity);
  }

  const selections = input.paymentSelections;
  if (!selections || typeof selections !== "object" || Array.isArray(selections)) {
    return { ok: false, error: "Choose a payment option for each product." };
  }
  const selectionIds = Object.keys(selections);
  if (
    selectionIds.length !== quantities.size ||
    selectionIds.some((productId) => !quantities.has(productId))
  ) {
    return { ok: false, error: "Choose a payment option for each product." };
  }
  for (const productId of quantities.keys()) {
    const selection = selections[productId];
    if (
      !selection ||
      (selection.choice !== "full" && selection.choice !== "installments") ||
      !Number.isInteger(selection.months) ||
      (selection.choice === "full" && selection.months !== 0) ||
      (selection.choice === "installments" && selection.months < 1)
    ) {
      return { ok: false, error: "One or more payment options are invalid." };
    }
  }

  const market = await prisma.market.findUnique({ where: { code: input.marketCode } });
  if (!market) {
    return { ok: false, error: "Unknown market." };
  }

  // Recompute every line from the database - the cart snapshot in localStorage
  // is never trusted for money.
  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
    include: {
      prices: { where: { marketCode: input.marketCode } },
      installment: true,
    },
  });
  if (products.length !== quantities.size) {
    return { ok: false, error: "One or more items are no longer available." };
  }

  for (const product of products) {
    const selection = selections[product.id];
    if (selection.choice !== "installments") continue;

    const price = product.prices[0];
    const quantity = quantities.get(product.id) ?? 1;
    const installment = product.installment;
    if (
      !price ||
      !installment?.eligible ||
      price.price.toNumber() * quantity < installment.minAmountUsd.toNumber() ||
      !installment.availableMonths.includes(selection.months)
    ) {
      return { ok: false, error: "One or more selected installment plans are unavailable." };
    }
  }

  const items = products.map((product) => {
    const price = product.prices[0];
    if (!price) {
      throw new Error(`Product ${product.id} has no ${input.marketCode} price.`);
    }
    const quantity = quantities.get(product.id) ?? 1;
    const unitPrice = price.price.toNumber();
    const compareAtUnitPrice = price.compareAtPrice.toNumber();
    const lineTotal = round2(unitPrice * quantity);
    const selection = selections[product.id];
    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      image: product.image,
      unitPrice,
      compareAtUnitPrice,
      quantity,
      lineTotal,
      paymentChoice: selection.choice,
      installmentMonths: selection.choice === "installments" ? selection.months : 0,
    };
  });

  const subtotal = round2(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const savings = round2(
    items.reduce(
      (sum, item) =>
        sum + Math.max(0, item.compareAtUnitPrice - item.unitPrice) * item.quantity,
      0,
    ),
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Shipping and tax follow the market's own rules.
  const freeShipping = subtotal >= market.freeShippingThreshold.toNumber();
  const shipping =
    input.shippingMethod === "express"
      ? market.expressShipping.toNumber()
      : freeShipping
        ? 0
        : market.standardShipping.toNumber();
  const tax = round2((subtotal + shipping) * market.estimatedTaxRate.toNumber());
  const total = round2(subtotal + shipping + tax);
  const shippingLabel = `${market.name} ${
    input.shippingMethod === "express" ? "express" : "standard"
  }`;

  const hasInstallments = items.some((item) => item.paymentChoice === "installments");
  const installmentTerms = new Set(
    items
      .filter((item) => item.paymentChoice === "installments")
      .map((item) => item.installmentMonths),
  );
  const orderInstallmentMonths =
    items.every((item) => item.paymentChoice === "installments") && installmentTerms.size === 1
      ? items[0].installmentMonths
      : 0;
  const reference = buildReference();

  try {
    // One transaction: the order, its line-level payment choices and the stock
    // decrement either all land or none of them do.
    await prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          reference,
          marketCode: input.marketCode,
          currency: "USD" satisfies CurrencyCode,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone || null,
          address1: input.address1,
          address2: input.address2 || null,
          city: input.city,
          state: input.state,
          postcode: input.postcode,
          shippingMethod: input.shippingMethod,
          shippingLabel,
          subtotal,
          savings,
          shipping,
          tax,
          total,
          taxLabel: market.estimatedTaxLabel,
          itemCount,
          paymentChoice: hasInstallments ? "installments" : "full",
          installmentMonths: orderInstallmentMonths,
          marketingOptIn: input.marketingOptIn,
          status: "pending",
          items: { create: items },
        },
      });

      // Decrement stock so the storefront reflects what was just ordered.
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });

    return { ok: true, reference };
  } catch (error) {
    console.error("placeOrder failed", error);
    return { ok: false, error: "We could not save your order. Please try again." };
  }
}
