import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminDeleteMarket } from "../../../actions/markets";
import { prisma } from "@/lib/db";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminDeleteForm } from "@/components/admin/AdminDeleteForm";
import { TrashIcon } from "@/components/Icons";
import MarketFormClient, { type MarketFormValues } from "../_MarketFormClient";

export const metadata: Metadata = { title: "Edit market" };

export default async function MarketEditPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  if (code !== "US") notFound();

  const market = await prisma.market.findUnique({ where: { code: "US" } });
  if (!market) notFound();
  const messaging = market.messaging as {
    shippingNote?: string;
    freeReturnsNote?: string;
    installmentNote?: string;
  };

  const initial: MarketFormValues = {
    name: market.name,
    shortName: market.shortName,
    flag: market.flag,
    currencySymbol: market.currencySymbol,
    locale: market.locale,
    standardShipping: market.standardShipping.toNumber(),
    expressShipping: market.expressShipping.toNumber(),
    freeShippingThreshold: market.freeShippingThreshold.toNumber(),
    estimatedTaxRate: market.estimatedTaxRate.toNumber(),
    estimatedTaxLabel: market.estimatedTaxLabel,
    standardDeliveryDays: market.standardDeliveryDays,
    expressDeliveryDays: market.expressDeliveryDays,
    returnsSummary: market.returnsSummary,
    shippingNote: messaging.shippingNote ?? "",
    freeReturnsNote: messaging.freeReturnsNote ?? "",
    installmentNote: messaging.installmentNote ?? "",
    isDefault: market.isDefault,
    sortOrder: market.sortOrder,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Home", href: "/admin" }, { label: "Markets", href: "/admin/markets" }, { label: market.name }]} />
      <SectionHeader eyebrow="Markets" title={`Edit ${market.name}`} description="Update shipping, tax and customer-facing market details." action={{ label: "Back to markets", href: "/admin/markets" }} />
      <MarketFormClient initial={initial} />
      <div className="flex justify-end rounded-xl border border-line bg-white p-4">
        <AdminDeleteForm
          action={adminDeleteMarket.bind(null, "US")}
          successHref="/admin/markets"
          confirmationMessage={`Delete "${market.name}"? This cannot be undone.`}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 transition disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" /> Delete market
        </AdminDeleteForm>
      </div>
    </div>
  );
}
