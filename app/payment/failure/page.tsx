import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <h1 className="text-3xl font-semibold text-rose-900">Payment failed</h1>
        <p className="mt-3 text-rose-800">
          We could not complete your payment. Your order has been saved and you
          can try again.
        </p>
        {reference ? (
          <p className="mt-6 text-sm text-rose-900">
            Order reference: {reference}
          </p>
        ) : null}
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/cart"
            className="rounded-full bg-rose-700 px-5 py-2 text-sm font-medium text-white hover:bg-rose-800"
          >
            Return to cart
          </Link>
          <Link
            href="/checkout"
            className="rounded-full border border-rose-700 px-5 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
          >
            Try checkout again
          </Link>
        </div>
      </div>
    </div>
  );
}