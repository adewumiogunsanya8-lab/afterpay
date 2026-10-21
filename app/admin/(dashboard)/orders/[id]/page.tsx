import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminGetOrder, adminUpdateOrderStatus } from "../../../actions/orders";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

type OrderRecord = NonNullable<Awaited<ReturnType<typeof adminGetOrder>>>;

export const metadata: Metadata = {
  title: "Order details",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await adminGetOrder(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Orders", href: "/admin/orders" },
          { label: id.slice(0, 8) },
        ]}
      />

      <SectionHeader
        eyebrow="Orders"
        title={`Order ${id.slice(0, 8)}`}
        description="View order details and update status."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <OrderInfoCard order={order} />
          <OrderItemsTable items={order.items} />
          <OrderStatusForm order={order} />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink-950 mb-4">Order summary</h2>
            <dl className="divide-y divide-line">
              <div className="pt-4 flex justify-between">
                <dt className="text-sm text-ink-500">Subtotal</dt>
                <dd className="text-sm text-ink-900">{formatMoney(order.subtotal.toNumber())}</dd>
              </div>
              <div className="pt-4 pb-6 flex justify-between">
                <dt className="text-sm text-ink-500">Shipping</dt>
                <dd className="text-sm text-ink-900">{formatMoney(order.shipping.toNumber())}</dd>
              </div>
              <div className="pt-4 flex justify-between">
                <dt className="text-sm font-semibold text-ink-900">Total</dt>
                <dd className="text-sm font-bold text-ink-950">{formatMoney(order.total.toNumber())}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderInfoCard({ order }: { order: OrderRecord }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-ink-950 mb-4">Order information</h2>
      <dl className="divide-y divide-line text-sm">
        <div className="pt-4 flex justify-between">
          <dt className="text-ink-500">Order date</dt>
          <dd className="text-ink-900">
            {new Date(order.placedAt).toLocaleString()}
          </dd>
        </div>
        <div className="pt-4 pb-6 flex justify-between">
          <dt className="text-ink-500">Market</dt>
          <dd className="text-ink-900">{order.marketCode}</dd>
        </div>
        <div className="pt-4 flex justify-between">
          <dt className="text-ink-500">Customer</dt>
          <dd className="text-ink-900">{order.firstName} {order.lastName}</dd>
        </div>
        <div className="pt-4 pb-6 flex justify-between">
          <dt className="text-ink-500">Email</dt>
          <dd className="text-ink-900">{order.email}</dd>
        </div>
      </dl>
    </div>
  );
}

function OrderItemsTable({ items }: { items: OrderRecord["items"] }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-ink-950 mb-4">Items</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase">
            <th className="p-4">Product</th>
            <th className="p-4 text-right">Price</th>
            <th className="p-4 text-center">Qty</th>
            <th className="p-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.id} className="text-ink-700">
              <td className="p-4">{item.name}</td>
              <td className="p-4 text-right">{formatMoney(item.unitPrice.toNumber())}</td>
              <td className="p-4 text-center">{item.quantity}</td>
              <td className="p-4 text-right font-medium">{formatMoney(item.lineTotal.toNumber())}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderStatusForm({ order }: { order: OrderRecord }) {
  const statuses: string[] = ["pending", "paid", "failed", "cancelled", "refunded"];

  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const status = formData.get("status") as string;
        await adminUpdateOrderStatus(order.id, status);
      }}
      className="rounded-xl border border-line bg-white p-5 shadow-sm space-y-4"
    >
      <h2 className="text-sm font-semibold text-ink-950 mb-4">Update status</h2>
      <div className="space-y-2">
        {statuses.map((s) => (
          <label key={s} className={cn("block cursor-pointer", order.status === s && "bg-brand-50")}>
            <input
              type="radio"
              name="status"
              value={s}
              defaultChecked={order.status === s}
              className="rounded border-ink-300 text-brand-600 focus:ring-brand-600"
            />
            <span className="ml-2 text-sm text-ink-700 capitalize">{s}</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition"
      >
        Save status
      </button>
    </form>
  );
}
