import type { Metadata } from "next";
import { adminListOrders } from "../../actions/orders";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Orders",
  description: "Manage customer orders.",
};

export default async function OrdersPage() {
  const orders = await adminListOrders();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Orders" },
        ]}
      />

      <SectionHeader
        eyebrow="Orders"
        title="Orders"
        description="View and update customer orders."
        action={{ label: "Back to dashboard", href: "/admin" }}
      />

      <div className="rounded-xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Placed</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-ink-700 divide-y divide-line">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-ink-400">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface transition">
                  <td className="p-4 font-mono text-xs text-ink-700">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-ink-900">
                      {order.firstName} {order.lastName}
                    </div>
                    <div className="text-xs text-ink-500">
                      {order.email}
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-ink-900">
                    {formatMoney(order.total.toNumber())}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={cn(
                        "inline-block px-2.5 py-0.5 rounded text-xs font-medium",
                        statusColor(order.status),
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm text-ink-700">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={`/admin/orders/${order.id}`}
                      className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-surface transition"
                      title="View"
                    >
                      <span className="sr-only">View order {order.id}</span>
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

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function statusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "paid":
      return "bg-mint-50 text-mint-700 border border-mint-200";
    case "failed":
      return "bg-ember-50 text-ember-700 border border-ember-200";
    case "cancelled":
      return "bg-ink-50 text-ink-700 border border-ink-200";
    case "refunded":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    default:
      return "bg-ink-50 text-ink-700 border border-ink-200";
  }
}
