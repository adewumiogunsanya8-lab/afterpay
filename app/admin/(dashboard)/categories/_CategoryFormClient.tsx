"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminCreateCategory, adminUpdateCategory } from "../../actions/categories";
import { CATEGORY_ART_KEYS } from "@/data/types";
import { cn } from "@/lib/cn";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export type CategoryFormValues = {
  name: string;
  tagline: string;
  description: string;
  artKey: string;
  bannerImage: string;
  specs: string;
  sortOrder: number;
};

const EMPTY_CATEGORY: CategoryFormValues = {
  name: "",
  tagline: "",
  description: "",
  artKey: "electronics",
  bannerImage: "",
  specs: "",
  sortOrder: 0,
};

function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

function Field({
  label,
  name,
  defaultValue,
  as,
  type = "text",
  required,
  min,
  rows,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  as?: "select" | "textarea";
  type?: string;
  required?: boolean;
  min?: number;
  rows?: number;
  children?: ReactNode;
}) {
  const className = cn(
    "block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm ring-1 ring-inset ring-ink-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 transition",
    as === "textarea" && "min-h-[80px] resize-y",
  );

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-ink-700">{label}</label>
      {as === "select" ? (
        <select id={name} name={name} defaultValue={defaultValue} required={required} className={className}>
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea id={name} name={name} defaultValue={defaultValue} required={required} rows={rows} className={className} />
      ) : (
        <input id={name} name={name} type={type} defaultValue={defaultValue} required={required} min={min} className={className} />
      )}
    </div>
  );
}

export default function CategoryFormClient({
  categoryId,
  initial,
}: {
  categoryId?: string;
  initial?: CategoryFormValues;
}) {
  const action = categoryId
    ? adminUpdateCategory.bind(null, categoryId)
    : adminCreateCategory;
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();
  const values = initial ?? EMPTY_CATEGORY;
  const editing = Boolean(categoryId);

  useEffect(() => {
    if (state?.ok) router.push("/admin/categories");
  }, [router, state]);

  return (
    <div className="rounded-xl border border-line bg-white shadow-sm">
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-lg font-semibold text-ink-950">{editing ? `Edit ${values.name}` : "Add category"}</h2>
      </div>
      <form action={formAction} className="space-y-5 p-6">
        {state && !state.ok ? (
          <ul className="list-disc space-y-1 rounded-lg bg-ember-50 p-4 text-sm text-ember-700">
            {state.errors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        ) : null}
        <Field label="Name" name="name" defaultValue={values.name} required />
        <Field label="Tagline" name="tagline" defaultValue={values.tagline} required />
        <Field label="Description" name="description" as="textarea" rows={4} defaultValue={values.description} required />
        <Field label="Illustration style" name="artKey" as="select" defaultValue={values.artKey} required>
          {CATEGORY_ART_KEYS.map((key) => <option key={key} value={key}>{humanize(key)}</option>)}
        </Field>
        <ImageUploadField
          label="Category image"
          name="bannerImage"
          scope="categories"
          value={values.bannerImage}
        />
        <Field label="Category specifications (label: value per line)" name="specs" as="textarea" rows={5} defaultValue={values.specs} />
        <Field label="Sort order" name="sortOrder" type="number" min={0} defaultValue={values.sortOrder} />
        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <Link href="/admin/categories" className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50">Cancel</Link>
          <button type="submit" disabled={isPending} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-70">
            {isPending ? "Saving…" : editing ? "Save category" : "Create category"}
          </button>
        </div>
      </form>
    </div>
  );
}
