import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";

/**
 * Write layer for the admin dashboard.
 *
 * The storefront only ever reads catalogue data through `lib/catalogue.ts`.
 * This module is the other half: the mutations the dashboard performs, plus
 * the slug/duplicate handling that keeps them consistent with what the
 * storefront expects.
 *
 * Every function here takes the id of the row to change. Ids are never
 * invented by the caller - Postgres generates them - so an update always names
 * an existing row.
 */

/** A single validation or lookup failure, safe to show to the operator. */
export type AdminError = {
  field?: string;
  message: string;
};

/** Result of a write: either a value or a list of errors. */
export type AdminResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: AdminError[] };

/** State returned by dashboard form actions and displayed beside the form. */
export type AdminActionState =
  | { ok: true }
  | { ok: false; errors: string[] };

/** Converts a mutation result into the small shape used by useActionState. */
export function toAdminActionState<T>(result: AdminResult<T>): AdminActionState {
  return result.ok
    ? { ok: true }
    : { ok: false, errors: result.errors.map((error) => error.message) };
}

/** Normalises an email for storage and comparison. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Builds a slug that is unique within a table.
 *
 * Appends `-2`, `-3`, ... until the slug is free. The suffix is skipped for
 * the row being updated, so renaming a product to its own current slug does
 * not produce `name-2`.
 */
export async function uniqueSlug(
  table: "product" | "category",
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || "item";

  let candidate = root;
  let counter = 2;

  for (;;) {
    const existing =
      table === "product"
        ? await prisma.product.findUnique({
            where: { slug: candidate },
            select: { id: true },
          })
        : await prisma.category.findUnique({
            where: { slug: candidate },
            select: { id: true },
          });

    if (!existing || existing.id === excludeId) return candidate;

    candidate = `${root}-${counter}`;
    counter += 1;
  }
}

/**
 * Builds a SKU that is unique.
 *
 * The operator's preferred SKU is used verbatim when it is free; otherwise a
 * numeric suffix is appended.
 */
export async function uniqueSku(preferred: string, excludeId?: string): Promise<string> {
  const root = slugify(preferred).toUpperCase().replace(/-/g, "-") || "SKU";

  let candidate = root;
  let counter = 2;

  for (;;) {
    const existing = await prisma.product.findUnique({
      where: { sku: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;

    candidate = `${root}-${counter}`;
    counter += 1;
  }
}
