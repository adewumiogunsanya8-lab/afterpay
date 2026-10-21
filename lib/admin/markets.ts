import { prisma } from "@/lib/db";
import type { AdminResult } from "@/lib/admin/catalogue-admin";
import type { CountryCode, CurrencyCode } from "@/data/types";

/**
 * Market mutations for the admin dashboard.
 *
 * A market holds the tax rate, shipping thresholds and the delivery copy the
 * storefront shows. The current storefront supports the US and USD only; the
 * dashboard can create its initial row and manage it without seed data.
 */

/** Everything the dashboard needs to create or update a market. */
export type MarketInput = {
  /** This storefront currently supports the US market only. */
  code: CountryCode;
  name: string;
  shortName: string;
  flag: string;
  currency: CurrencyCode;
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

/** Validates the market fields before anything is written. */
export function validateMarket(input: MarketInput): string[] {
  const errors: string[] = [];

  if (input.code !== "US") errors.push("This storefront currently supports the US market only.");
  if (!input.name.trim()) errors.push("Name is required.");
  if (!input.shortName.trim()) errors.push("Short name is required.");
  if (!input.flag.trim()) errors.push("Flag is required.");
  if (input.currency !== "USD") errors.push("This storefront currently supports USD only.");
  if (!input.currencySymbol.trim()) errors.push("Currency symbol is required.");
  if (!input.locale.trim()) errors.push("Locale is required.");
  if (!Number.isFinite(input.standardShipping) || input.standardShipping < 0) {
    errors.push("Standard shipping must be zero or more.");
  }
  if (!Number.isFinite(input.expressShipping) || input.expressShipping < 0) {
    errors.push("Express shipping must be zero or more.");
  }
  if (!Number.isFinite(input.freeShippingThreshold) || input.freeShippingThreshold < 0) {
    errors.push("Free shipping threshold must be zero or more.");
  }
  if (!Number.isFinite(input.estimatedTaxRate) || input.estimatedTaxRate < 0) {
    errors.push("Tax rate must be zero or more.");
  }
  if (input.estimatedTaxRate > 1) {
    errors.push("Tax rate is a fraction, e.g. 0.0825 for 8.25%.");
  }
  if (!input.estimatedTaxLabel.trim()) errors.push("Tax label is required.");
  if (!input.standardDeliveryDays.trim()) {
    errors.push("Standard delivery estimate is required.");
  }
  if (!input.expressDeliveryDays.trim()) {
    errors.push("Express delivery estimate is required.");
  }
  if (!input.returnsSummary.trim()) errors.push("Returns summary is required.");
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
    errors.push("Sort order cannot be negative.");
  }

  return errors;
}

/** The market's marketing copy, stored as JSON. */
function messagingOf(input: MarketInput) {
  return {
    shippingNote: input.shippingNote.trim(),
    freeReturnsNote: input.freeReturnsNote.trim(),
    installmentNote: input.installmentNote.trim(),
  };
}


/**
 * Creates a market.
 *
 * When a market is marked as the default, every other market loses the flag,
 * so there is never more than one default.
 */
export async function createMarket(
  input: MarketInput,
): Promise<AdminResult<{ code: string }>> {
  const errors = validateMarket(input);
  if (errors.length) {
    return { ok: false, errors: errors.map((message) => ({ message })) };
  }

  const code = input.code.trim().toUpperCase() as CountryCode;

  const existing = await prisma.market.findUnique({
    where: { code },
    select: { code: true },
  });
  if (existing) {
    return {
      ok: false,
      errors: [{ field: "code", message: "A market with that code already exists." }],
    };
  }

  await prisma.$transaction(async (tx) => {
    const hasDefault = await tx.market.findFirst({
      where: { isDefault: true },
      select: { code: true },
    });
    const isDefault = input.isDefault || !hasDefault;
    if (isDefault) {
      await tx.market.updateMany({ data: { isDefault: false } });
    }

    await tx.market.create({
      data: {
        code,
        name: input.name.trim(),
        shortName: input.shortName.trim(),
        flag: input.flag.trim(),
        currency: input.currency,
        currencySymbol: input.currencySymbol.trim(),
        locale: input.locale.trim(),
        standardShipping: input.standardShipping,
        expressShipping: input.expressShipping,
        freeShippingThreshold: input.freeShippingThreshold,
        estimatedTaxRate: input.estimatedTaxRate,
        estimatedTaxLabel: input.estimatedTaxLabel.trim(),
        standardDeliveryDays: input.standardDeliveryDays.trim(),
        expressDeliveryDays: input.expressDeliveryDays.trim(),
        returnsSummary: input.returnsSummary.trim(),
        messaging: messagingOf(input),
        isDefault,
        sortOrder: input.sortOrder,
      },
    });
  });

  return { ok: true, value: { code } };
}


/** Updates a market. */
export async function updateMarket(
  code: CountryCode,
  input: MarketInput,
): Promise<AdminResult<{ code: string }>> {
  const errors = validateMarket(input);
  if (errors.length) {
    return { ok: false, errors: errors.map((message) => ({ message })) };
  }

  const existing = await prisma.market.findUnique({
    where: { code },
    select: { code: true },
  });
  if (!existing) {
    return { ok: false, errors: [{ message: "That market no longer exists." }] };
  }

  await prisma.$transaction(async (tx) => {
    const anotherDefault = await tx.market.findFirst({
      where: { isDefault: true, code: { not: code } },
      select: { code: true },
    });
    const isDefault = input.isDefault || !anotherDefault;
    if (isDefault) {
      await tx.market.updateMany({ data: { isDefault: false } });
    }

    await tx.market.update({
      where: { code },
      data: {
        name: input.name.trim(),
        shortName: input.shortName.trim(),
        flag: input.flag.trim(),
        currency: input.currency,
        currencySymbol: input.currencySymbol.trim(),
        locale: input.locale.trim(),
        standardShipping: input.standardShipping,
        expressShipping: input.expressShipping,
        freeShippingThreshold: input.freeShippingThreshold,
        estimatedTaxRate: input.estimatedTaxRate,
        estimatedTaxLabel: input.estimatedTaxLabel.trim(),
        standardDeliveryDays: input.standardDeliveryDays.trim(),
        expressDeliveryDays: input.expressDeliveryDays.trim(),
        returnsSummary: input.returnsSummary.trim(),
        messaging: messagingOf(input),
        isDefault,
        sortOrder: input.sortOrder,
      },
    });
  });

  return { ok: true, value: { code } };
}


/**
 * Deletes a market.
 *
 * A market cannot be deleted while products are priced in it or orders were
 * placed in it - the foreign keys are `Restrict` for exactly that reason.
 */
export async function deleteMarket(code: CountryCode): Promise<AdminResult<null>> {
  const existing = await prisma.market.findUnique({
    where: { code: code as "US" },
    select: { code: true, name: true },
  });
  if (!existing) {
    return { ok: false, errors: [{ message: "That market no longer exists." }] };
  }

  const [priceCount, orderCount] = await Promise.all([
    prisma.productPrice.count({ where: { marketCode: code } }),
    prisma.order.count({ where: { marketCode: code } }),
  ]);

  if (priceCount > 0 || orderCount > 0) {
    return {
      ok: false,
      errors: [
        {
          message: `${existing.name} is still used by ${priceCount} price row(s) and ${orderCount} order(s), so it cannot be removed.`,
        },
      ],
    };
  }

  await prisma.market.delete({ where: { code: code as "US" } });
  return { ok: true, value: null };
}
