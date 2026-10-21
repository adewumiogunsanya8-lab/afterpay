import type { Metadata } from "next";
import { adminListCategories } from "../../actions/categories";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage product categories.",
};

export default async function CategoriesPage() {
  const categories = await adminListCategories();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Categories" },
        ]}
      />

      <SectionHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Create, edit and delete product categories."
        action={{ label: "Add category", href: "/admin/categories/create" }}
      />

      <div className="rounded-xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase">
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Price range</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-ink-700 divide-y divide-line">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-ink-400">
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-surface transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-ink-500 uppercase">
                          {category.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-ink-900">{category.name}</div>
                        <div className="text-xs text-ink-500">{category.tagline}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {category.priceRange.min === 0 && category.priceRange.max === 0 ? (
                      <span className="text-ink-400">—</span>
                    ) : (
                      `${formatMoney(category.priceRange.min)} – ${formatMoney(category.priceRange.max)}`
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <a
                        href={`/admin/categories/${category.id}`}
                        className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-surface transition"
                        title="Edit"
                      >
                        <span className="sr-only">Edit {category.name}</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.75}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M12 20l-4-4-4-4" />
                          <path d="M18 8l1.4 1.4" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
