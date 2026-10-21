import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminDeleteProduct } from "../../../actions/products";
import { prisma } from "@/lib/db";
import { getCategories } from "@/lib/catalogue";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminDeleteForm } from "@/components/admin/AdminDeleteForm";
import { TrashIcon } from "@/components/Icons";
import ProductFormClient, { type ProductFormValues } from "../create/_ProductFormClient";

export const metadata: Metadata = { title: "Edit product" };

export default async function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        prices: { where: { marketCode: "US" } },
        images: { orderBy: { position: "asc" } },
        tags: { orderBy: { tag: "asc" } },
        specs: { orderBy: { position: "asc" } },
        installment: true,
      },
    }),
    getCategories(),
  ]);
  if (!product) notFound();

  const price = product.prices[0];
  const values: ProductFormValues = {
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    categoryId: product.categoryId,
    shortDescription: product.shortDescription,
    description: product.description,
    color: product.color,
    price: price?.price.toNumber() ?? 0,
    compareAtPrice: price?.compareAtPrice.toNumber() ?? 0,
    discountPercent: price?.discountPercent ?? 0,
    rating: product.rating.toNumber(),
    reviewCount: product.reviewCount,
    stock: product.stock,
    featured: product.featured,
    isNew: product.isNew,
    soldCount: product.soldCount,
    popularity: product.popularity,
    sortOrder: product.sortOrder,
    tags: product.tags.map((tag) => tag.tag).join(", "),
    specs: product.specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n"),
    images: product.images.map((image) => image.url).join("\n") || product.image,
    installmentEligible: product.installment?.eligible ?? false,
    suggestedMonths: product.installment?.suggestedMonths ?? 3,
    availableMonths: product.installment?.availableMonths.join(", ") ?? "3, 6, 9, 12",
    minAmountUsd: product.installment?.minAmountUsd.toNumber() ?? 50,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/admin" }, { label: "Products", href: "/admin/products" }, { label: product.name }]} />
      <SectionHeader eyebrow="Catalogue" title={`Edit ${product.name}`} description="Update product details, pricing, images and storefront settings." action={{ label: "Back to products", href: "/admin/products" }} />
      <ProductFormClient categories={categories} productId={id} initial={values} />
      <div className="flex justify-end rounded-xl border border-line bg-white p-4">
        <AdminDeleteForm
          action={adminDeleteProduct.bind(null, id)}
          successHref="/admin/products"
          confirmationMessage={`Delete "${product.name}"? This cannot be undone.`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 transition disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" /> Delete product
        </AdminDeleteForm>
      </div>
    </div>
  );
}
