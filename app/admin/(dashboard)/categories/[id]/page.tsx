import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminDeleteCategory } from "../../../actions/categories";
import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminDeleteForm } from "@/components/admin/AdminDeleteForm";
import { TrashIcon } from "@/components/Icons";
import CategoryFormClient, { type CategoryFormValues } from "../_CategoryFormClient";

export const metadata: Metadata = { title: "Edit category" };

export default async function CategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { specs: { orderBy: { position: "asc" } } },
  });
  if (!category) notFound();

  const initial: CategoryFormValues = {
    name: category.name,
    tagline: category.tagline,
    description: category.description,
    artKey: category.artKey,
    bannerImage: category.bannerImage,
    specs: category.specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n"),
    sortOrder: category.sortOrder,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/admin" }, { label: "Categories", href: "/admin/categories" }, { label: category.name }]} />
      <SectionHeader eyebrow="Catalogue" title={`Edit ${category.name}`} description="Update category details and product page specifications." action={{ label: "Back to categories", href: "/admin/categories" }} />
      <CategoryFormClient categoryId={id} initial={initial} />
      <div className="flex justify-end rounded-xl border border-line bg-white p-4">
        <AdminDeleteForm
          action={adminDeleteCategory.bind(null, id)}
          successHref="/admin/categories"
          confirmationMessage={`Delete "${category.name}"? This cannot be undone.`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 transition disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" /> Delete category
        </AdminDeleteForm>
      </div>
    </div>
  );
}
