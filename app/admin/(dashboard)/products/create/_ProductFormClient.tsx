"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminCreateProduct, adminUpdateProduct } from "../../../actions/products";
import { ChevronLeftIcon } from "@/components/Icons";
import { cn } from "@/lib/cn";
import type { Category } from "@/data/types";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export type ProductFormValues = {
  sku: string;
  name: string;
  brand: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  color: string;
  price: number;
  compareAtPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  isNew: boolean;
  soldCount: number;
  popularity: number;
  sortOrder: number;
  tags: string;
  specs: string;
  images: string;
  installmentEligible: boolean;
  suggestedMonths: number;
  availableMonths: string;
  minAmountUsd: number;
};

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  as?: "select" | "textarea";
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  rows?: number;
  children?: ReactNode;
};

function Field({
  label,
  name,
  type = "text",
  as,
  placeholder,
  required,
  defaultValue,
  min,
  max,
  step,
  rows,
  children,
}: FieldProps) {
  const commonClassName = cn(
    "block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm ring-1 ring-inset ring-ink-300 placeholder:text-ink-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm transition",
    as === "textarea" && "min-h-[80px] resize-y",
  );
  const commonProps = {
    id: name,
    name,
    placeholder,
    required,
    className: commonClassName,
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-ink-700">
        {label}
      </label>
      {as === "select" ? (
        <select {...commonProps} defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}>
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea
          {...commonProps}
          defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
          rows={rows}
        />
      ) : (
        <input
          {...commonProps}
          type={type}
          defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
          min={min !== undefined ? String(min) : undefined}
          max={max !== undefined ? String(max) : undefined}
          step={step !== undefined ? String(step) : undefined}
        />
      )}
    </div>
  );
}

const EMPTY_PRODUCT: ProductFormValues = {
  sku: "",
  name: "",
  brand: "",
  categoryId: "",
  shortDescription: "",
  description: "",
  color: "",
  price: 0,
  compareAtPrice: 0,
  discountPercent: 0,
  rating: 0,
  reviewCount: 0,
  stock: 0,
  featured: false,
  isNew: false,
  soldCount: 0,
  popularity: 0,
  sortOrder: 0,
  tags: "",
  specs: "",
  images: "",
  installmentEligible: false,
  suggestedMonths: 3,
  availableMonths: "3, 6, 9, 12",
  minAmountUsd: 50,
};

export default function ProductFormClient({
  categories,
  productId,
  initial,
}: {
  categories: Category[];
  productId?: string;
  initial?: ProductFormValues;
}) {
  const action = productId
    ? adminUpdateProduct.bind(null, productId)
    : adminCreateProduct;
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();
  const values = initial ?? EMPTY_PRODUCT;
  const editing = Boolean(productId);

  useEffect(() => {
    if (state?.ok) router.push("/admin/products");
  }, [router, state]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <ChevronLeftIcon className="h-4 w-4" /> Back to products
      </Link>

      <div className="rounded-xl border border-line bg-white shadow-sm">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold text-ink-950">
            {editing ? `Edit ${values.name}` : "Add product"}
          </h2>
        </div>
        <form action={formAction} className="p-6 space-y-5">
          {state && !state.ok ? (
            <ul className="list-disc space-y-1 rounded-lg bg-ember-50 p-4 text-sm text-ember-700">
              {state.errors.map((error, index) => <li key={index}>{error}</li>)}
            </ul>
          ) : null}

          {categories.length === 0 ? (
            <div className="rounded-lg bg-surface p-4 text-sm text-ink-700">
              Add a category before creating a product. {" "}
              <Link className="font-semibold text-brand-700 underline" href="/admin/categories/create">
                Create category
              </Link>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" placeholder="e.g. 65 inch QLED TV" required defaultValue={values.name} />
            <Field label="Brand" name="brand" placeholder="e.g. Sony" required defaultValue={values.brand} />
            <Field label="Category" name="categoryId" as="select" required defaultValue={values.categoryId}>
              <option value="" disabled>Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Field>
            <Field label="SKU" name="sku" placeholder="Generated from the name if blank" defaultValue={values.sku} />
            <Field label="Colour" name="color" placeholder="e.g. Black" required defaultValue={values.color} />
            <Field label="Short description" name="shortDescription" as="textarea" rows={3} required defaultValue={values.shortDescription} />
            <Field label="Description" name="description" as="textarea" rows={6} required defaultValue={values.description} />
            <ImageUploadField
              label="Product images"
              name="images"
              scope="products"
              value={values.images}
              multiple
            />
            <div className="grid gap-4 sm:grid-cols-3 sm:col-span-2">
              <Field label="Price (USD)" name="price" type="number" step="0.01" min="0" required defaultValue={values.price} />
              <Field label="Compare-at price (USD)" name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={values.compareAtPrice} />
              <Field label="Discount % (0-60)" name="discountPercent" type="number" min="0" max="60" defaultValue={values.discountPercent} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 sm:col-span-2">
              <Field label="Stock" name="stock" type="number" min="0" required defaultValue={values.stock} />
              <Field label="Rating (0-5)" name="rating" type="number" step="0.1" min="0" max="5" defaultValue={values.rating} />
              <Field label="Review count" name="reviewCount" type="number" min="0" defaultValue={values.reviewCount} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 sm:col-span-2">
              <Field label="Sort order" name="sortOrder" type="number" min="0" defaultValue={values.sortOrder} />
              <Field label="Sold count" name="soldCount" type="number" min="0" defaultValue={values.soldCount} />
              <Field label="Popularity (0-100)" name="popularity" type="number" min="0" max="100" defaultValue={values.popularity} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-ink-600">
                <input defaultChecked={values.featured} name="featured" type="checkbox" className="rounded border-ink-300 text-brand-600 focus:ring-brand-600" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-600">
                <input defaultChecked={values.isNew} name="isNew" type="checkbox" className="rounded border-ink-300 text-brand-600 focus:ring-brand-600" /> New arrival
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-600">
                <input defaultChecked={values.installmentEligible} name="installmentEligible" type="checkbox" className="rounded border-ink-300 text-brand-600 focus:ring-brand-600" /> Installment eligible
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:col-span-2">
              <Field label="Tags (comma-separated)" name="tags" placeholder="sale, electronics" defaultValue={values.tags} />
              <Field label="Specs (label: value per line)" name="specs" as="textarea" rows={4} placeholder="Screen: 65 inch" defaultValue={values.specs} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3 sm:col-span-2">
              <Field label="Suggested installment months" name="suggestedMonths" type="number" min="1" defaultValue={values.suggestedMonths} />
              <Field label="Available months (comma-separated)" name="availableMonths" placeholder="3, 6, 9, 12" defaultValue={values.availableMonths} />
              <Field label="Minimum installment amount (USD)" name="minAmountUsd" type="number" step="0.01" min="0" defaultValue={values.minAmountUsd} />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <Link href="/admin/products" className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || categories.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-70 transition"
            >
              {isPending ? "Saving…" : editing ? "Save product" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
