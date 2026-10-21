"use server";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  deleteProduct,
  type ProductInput,
  updateProduct,
} from "@/lib/admin/products";
import { refreshCategoryPriceRanges } from "@/lib/admin/categories";
import { toAdminActionState, type AdminActionState } from "@/lib/admin/catalogue-admin";
import { formCheckbox, formNumber, formText } from "@/lib/admin/form-data";
import { requireAdmin } from "@/lib/auth/index";

function productInput(formData: FormData): ProductInput {
  return {
    sku: formText(formData, "sku"),
    name: formText(formData, "name"),
    brand: formText(formData, "brand"),
    categoryId: formText(formData, "categoryId"),
    shortDescription: formText(formData, "shortDescription"),
    description: formText(formData, "description"),
    color: formText(formData, "color"),
    price: formNumber(formData, "price"),
    compareAtPrice: formNumber(formData, "compareAtPrice"),
    discountPercent: formNumber(formData, "discountPercent"),
    rating: formNumber(formData, "rating"),
    reviewCount: formNumber(formData, "reviewCount"),
    stock: formNumber(formData, "stock"),
    featured: formCheckbox(formData, "featured"),
    isNew: formCheckbox(formData, "isNew"),
    soldCount: formNumber(formData, "soldCount"),
    popularity: formNumber(formData, "popularity"),
    sortOrder: formNumber(formData, "sortOrder"),
    tags: formText(formData, "tags"),
    specs: formText(formData, "specs"),
    images: formText(formData, "images"),
    installmentEligible: formCheckbox(formData, "installmentEligible"),
    suggestedMonths: formNumber(formData, "suggestedMonths", 3),
    availableMonths: formText(formData, "availableMonths") || "3, 6, 9, 12",
    minAmountUsd: formNumber(formData, "minAmountUsd", 50),
  };
}

/** Server Action: list products for the admin dashboard. */
export async function adminListProducts() {
  await requireAdmin();
  const { getAllProducts } = await import("@/lib/catalogue");
  return getAllProducts();
}

/** Server Action: create a product from the dashboard form. */
export async function adminCreateProduct(
  _previousState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const result = await createProduct(productInput(formData));
  if (!result.ok) return toAdminActionState(result);

  await refreshCategoryPriceRanges();
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Server Action: update a product from the dashboard form. */
export async function adminUpdateProduct(
  id: string,
  _previousState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const result = await updateProduct(id, productInput(formData));
  if (!result.ok) return toAdminActionState(result);

  await refreshCategoryPriceRanges();
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Server Action: delete a product and refresh derived category prices. */
export async function adminDeleteProduct(
  id: string,
  _previousState: AdminActionState | null,
  _formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  void _previousState;
  void _formData;
  const result = await deleteProduct(id);
  if (!result.ok) return toAdminActionState(result);

  await refreshCategoryPriceRanges();
  revalidatePath("/", "layout");
  return { ok: true };
}
