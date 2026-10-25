import Link from "next/link";

import { prisma } from "@/lib/db";
import { ClearCartOnSuccess } from "./ClearCartOnSuccess";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  const order = reference
    ? await prisma.order.findUnique({ where: { reference } })
    : null;

  return (
    <div className="container-page py-16">
      <ClearCartOnSuccess />
      <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h1 className="text-3xl font-semibold text-emerald-900">
          Payment successful
        </h1>
        <p className="mt-3 text-emerald-800">
          Thank you! Your order has been received and paid.
        </p>
        {order ? (
          <div className="mt-6 space-y-1 text-sm text-emerald-900">
            <p>
              <span className="font-medium">Order reference:</span>{" "}
              {order.reference}
            </p>
            <p>
              <span className="font-medium">Total:</span>{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: order.currency ?? "USD",
              }).format(Number(order.total))}
            </p>
            <p>
              <span className="font-medium">Status:</span> {order.status}
            </p>
          </div>
        ) : reference ? (
          <p className="mt-6 text-sm text-emerald-900">
            Order reference: {reference}
          </p>
        ) : null}
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}