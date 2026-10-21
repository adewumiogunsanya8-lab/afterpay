import type { Metadata } from "next";
import { getCategories } from "@/lib/catalogue";
import ProductFormClient from "./_ProductFormClient";

export const metadata: Metadata = {
  title: "Add product",
  description: "Create a product in the EasyVend catalogue.",
};

export default async function ProductCreatePage() {
  const categories = await getCategories();
  return <ProductFormClient categories={categories} />;
}
