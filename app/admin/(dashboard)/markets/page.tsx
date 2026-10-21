import type { Metadata } from "next";
import { adminListMarkets } from "../../actions/markets";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Markets",
  description: "Manage storefront markets.",
};

export default async function MarketsPage() {
  const markets = await adminListMarkets();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/admin" },
          { label: "Markets" },
        ]}
      />

      <SectionHeader
        eyebrow="Markets"
        title="Markets"
        description="Create, edit and delete markets. Markets control tax rates, shipping and delivery copy."
        action={{ label: "Add market", href: "/admin/markets/create" }}
      />

      <div className="rounded-xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold text-ink-500 uppercase">
              <th className="p-4">Market</th>
              <th className="p-4">Code</th>
              <th className="p-4 text-center">Currency</th>
              <th className="p-4 text-right">Tax rate</th>
              <th className="p-4 text-center">Default</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-ink-700 divide-y divide-line">
            {markets.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-ink-400">
                  No market configured yet. Create the US market to start selling.
                </td>
              </tr>
            ) : (
              markets.map((market) => (
                <tr key={market.code} className="hover:bg-surface transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{market.flag}</span>
                      <div>
                        <div className="font-medium text-ink-900">{market.name}</div>
                        <div className="text-xs text-ink-500">{market.shortName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs text-ink-700">{market.code}</td>
                  <td className="p-4 text-center font-mono text-xs text-ink-700">
                    {market.currencySymbol}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-medium text-ink-900">
                      {(market.estimatedTaxRate * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {market.isDefault ? (
                      <span className="rounded-full border border-mint-200 bg-mint-50 px-2 py-0.5 text-xs font-semibold text-mint-700">
                        Default
                      </span>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <a
                        href={`/admin/markets/${market.code}`}
                        className="rounded-lg p-2 text-ink-400 hover:text-brand-600 hover:bg-surface transition"
                        title="Edit"
                      >
                        <span className="sr-only">Edit {market.name}</span>
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
