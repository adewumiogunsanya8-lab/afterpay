"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  deleteCategory,
  type CategoryInput,
  updateCategory,
} from "@/lib/admin/categories";
import { toAdminActionState, type AdminActionState } from "@/lib/admin/catalogue-admin";
import { formNumber, formText } from "@/lib/admin/form-data";
import { requireAdmin } from "@/lib/auth/index";

function categoryInput(formData: FormData): CategoryInput {
  return {
    name: formText(formData, "name"),
    tagline: formText(formData, "tagline"),
    description: formText(formData, "description"),
    artKey: formText(formData, "artKey"),
    bannerImage: formText(formData, "bannerImage"),
    specs: formText(formData, "specs"),
    sortOrder: formNumber(formData, "sortOrder"),
  };
}

/** Server Action: list categories for the admin dashboard. */
export async function adminListCategories() {
  await requireAdmin();
  const { getCategories } = await import("@/lib/catalogue");
  return getCategories();
}

/** Server Action: create a category from the dashboard form. */
export async function adminCreateCategory(
  _previousState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const result = await createCategory(categoryInput(formData));
  if (!result.ok) return toAdminActionState(result);

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Server Action: update a category from the dashboard form. */
export async function adminUpdateCategory(
  id: string,
  _previousState: AdminActionState | null,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const result = await updateCategory(id, categoryInput(formData));
  if (!result.ok) return toAdminActionState(result);

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Server Action: delete a category. Categories with products are protected. */
export async function adminDeleteCategory(
  id: string,
  _previousState: AdminActionState | null,
  _formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  void _previousState;
  void _formData;
  const result = await deleteCategory(id);
  if (!result.ok) return toAdminActionState(result);

  revalidatePath("/", "layout");
  return { ok: true };
}
