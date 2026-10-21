import type { Metadata } from "next";
import { adminListProducts } from "../../actions/products";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Products",
  description: "Manage products in the EasyVend catalogue.",
};

export default async function ProductsPage() {
  const products = await adminListProducts();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Products" },
        ]}
      />

      <SectionHeader
        eyebrow="Catalogue"
        title="Products"
        description="Create, edit and delete products. Prices are quoted in US dollars."
        action={{ label: "Add product", href: "/admin/products/create" }}
      />

      <div className="rounded-xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">SKU</th>
              <th className="p-4 text-right">Price</th>
              <th className="p-4 text-right">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-ink-700 divide-y divide-line">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-ink-400">
                  No products yet. Add your first product to get started.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-surface transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-ink-500 uppercase">
                          {product.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-ink-900">{product.name}</div>
                        <div className="text-xs text-ink-500">{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs font-medium text-ink-600">
                      {product.categoryName}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-ink-700">{product.sku}</td>
                  <td className="p-4 text-right font-medium text-ink-900">
                    {formatMoney(product.price)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={cn("font-medium", product.stock === 0 ? "text-ember-600" : "text-mint-600")}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/products/${product.id}`}
                        className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-surface transition"
                        title="Edit"
                      >
                        <span className="sr-only">Edit {product.name}</span>
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
