import type { Metadata } from "next";
import CategoryFormClient from "../_CategoryFormClient";

export const metadata: Metadata = {
  title: "Add category",
  description: "Create a product category.",
};

export default function CategoryCreatePage() {
  return <div className="space-y-6"><CategoryFormClient /></div>;
}
