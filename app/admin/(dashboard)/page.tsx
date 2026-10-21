import type { Metadata } from "next";
import { getAllProducts, getCategories, getProductCount } from "@/lib/catalogue";
import { ChevronRightIcon, GridIcon, PackageIcon, TagIcon, TruckIcon } from "@/components/Icons";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "EasyVend admin dashboard overview.",
};

/** Quick stat card. */
function StatCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  href?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-ink-950">{value}</p>
        </div>
      </div>
      {href ? (
        <a
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View all
          <ChevronRightIcon className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  );
}

export default async function DashboardPage() {
  const [products, categories, marketCount, productCount] = await Promise.all([
    getAllProducts(),
    getCategories(),
    prisma.market.count(),
    getProductCount(),
  ]);

  const lowStock = products.filter((p) => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter((p) => p.stock === 0);
  const totalOrders = 0; // placeholder until orders are queried

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Overview of your catalogue, orders and markets.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={PackageIcon}
          title="Products"
          value={productCount}
          href="/admin/products"
        />
        <StatCard
          icon={TagIcon}
          title="Categories"
          value={categories.length}
          href="/admin/categories"
        />
        <StatCard
          icon={TruckIcon}
          title="Orders"
          value={totalOrders}
          href="/admin/orders"
        />
        <StatCard
          icon={GridIcon}
          title="Markets"
          value={marketCount}
          href="/admin/markets"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink-950 mb-4">Low stock</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-ink-500">All products are above the low-stock threshold.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {lowStock.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-ink-700">{p.name}</span>
                  <span className="font-semibold text-ember-600">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink-950 mb-4">Out of stock</h2>
          {outOfStock.length === 0 ? (
            <p className="text-sm text-ink-500">No products are out of stock.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {outOfStock.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="text-ink-700">{p.name}</span>
                  <span className="font-semibold text-ink-500">0 left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
