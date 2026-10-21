"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createMarket,
  deleteMarket,
  type MarketInput,
  updateMarket,
} from "@/lib/admin/markets";
import { toAdminActionState, type AdminActionState } from "@/lib/admin/catalogue-admin";
import { formCheckbox, formNumber, formText } from "@/lib/admin/form-data";
import { requireAdmin } from "@/lib/auth/index";

function marketInput(formData: FormData): MarketInput {
  return {
    // This storefront currently uses the US country and USD currency only.
    code: "US",
    currency: "USD",
    name: formText(formData, "name"),
    shortName: formText(formData, "shortName"),
    flag: formText(formData, "flag"),
    currencySymbol: formText(formData, "currencySymbol"),
    locale: formText(formData, "locale"),
    standardShipping: formNumber(formData, "standardShipping"),
    expressShipping: formNumber(formData, "expressShipping"),
    freeShippingThreshold: formNumber(formData, "freeShippingThreshold"),
    estimatedTaxRate: formNumber(formData, "estimatedTaxRate"),
    estimatedTaxLabel: formText(formData, "estimatedTaxLabel"),
    standardDeliveryDays: formText(formData, "standardDeliveryDays"),
    expressDeliveryDays: formText(formData, "expressDeliveryDays"),
    returnsSummary: formText(formData, "returnsSummary"),
    shippingNote: formText(formData, "shippingNote"),
    freeReturnsNote: formText(formData, "freeReturnsNote"),
    installmentNote: formText(formData, "installmentNote"),
    isDefault: formCheckbox(formData, "isDefault"),
    sortOrder: formNumber(formData, "sortOrder"),
  };
}

/** Server Action: list persisted markets for the admin dashboard. */
export async function adminListMarkets() {
  await requireAdmin();
  const markets = await prisma.market.findMany({ orderBy: { sortOrder: "asc" } });
  return markets.map((market) => ({
    ...market,
    standardShipping: market.standardShipping.toNumber(),
    expressShipping: market.expressShipping.toNumber(),
    freeShippingThreshold: market.freeShippingThreshold.toNumber(),
    estimatedTaxRate: market.estimatedTaxRate.toNumber(),
    messaging: market.messaging as {
      shippingNote: string;
      freeReturnsNote: string;
      installmentNote: string;
    },
  }));
}

/** Server Action: create the storefront market from the dashboard form. */
export async function adminCreateMarket(
  _previousState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const result = await createMarket(marketInput(formData));
  if (!result.ok) return toAdminActionState(result);

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Server Action: update the storefront market from the dashboard form. */
export async function adminUpdateMarket(
  code: "US",
  _previousState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const result = await updateMarket(code, marketInput(formData));
  if (!result.ok) return toAdminActionState(result);

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Server Action: delete the market if products and orders no longer use it. */
export async function adminDeleteMarket(
  code: "US",
  _previousState: AdminActionState | null,
  _formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  void _previousState;
  void _formData;
  const result = await deleteMarket(code);
  if (!result.ok) return toAdminActionState(result);

  revalidatePath("/", "layout");
  return { ok: true };
}
