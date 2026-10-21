import type { Metadata } from "next";
import Image from "next/image";
import { adminListProducts } from "../../actions/products";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Product images",
  description: "View product images uploaded from the product editor.",
};

export default async function ImagesPage() {
  const products = await adminListProducts();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Images" },
        ]}
      />

      <SectionHeader
        eyebrow="Catalogue"
        title="Product images"
        description="Upload product gallery images from the product editor. Files are stored in the Supabase images bucket."
      />

      <div className="rounded-xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase">
              <th className="p-4">Product</th>
              <th className="p-4 text-center">Cover</th>
              <th className="p-4 text-center">Gallery</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-ink-700 divide-y divide-line">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-ink-400">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-surface transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={32}
                          height={32}
                          unoptimized
                          className="h-8 w-8 rounded-lg object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-ink-900">{product.name}</div>
                        <div className="text-xs text-ink-500">{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Image
                      src={product.image}
                      alt="Cover"
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded object-cover"
                    />
                  </td>
                  <td className="p-4 text-center text-xs text-ink-500">
                    {product.images.length}
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-surface transition"
                      title="Edit product"
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
