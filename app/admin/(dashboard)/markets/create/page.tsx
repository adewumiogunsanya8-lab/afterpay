import type { Metadata } from "next";
import MarketFormClient from "../_MarketFormClient";

export const metadata: Metadata = {
  title: "Add market",
  description: "Configure the storefront market.",
};

export default function MarketCreatePage() {
  return <div className="space-y-6"><MarketFormClient /></div>;
}
