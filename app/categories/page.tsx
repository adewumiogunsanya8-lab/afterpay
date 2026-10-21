import type { Metadata } from "next";
import { connection } from "next/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryCard } from "@/components/CategoryCard";
import { SectionHeader } from "@/components/SectionHeader";
import { getCategoriesWithStats } from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "All categories",
  description: "Browse every AfterPay category.",
};

export default async function CategoriesPage() {
  // The catalogue is live Postgres data, so resolve it for each request rather
  // than trying to snapshot it during the deployment build.
  await connection();
  const categories = await getCategoriesWithStats();

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />

      <SectionHeader
        className="mt-4"
        eyebrow="Catalogue"
        title="All categories"
        description="Every category lists its own products. All prices are in US dollars."
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((category, index) => (
          <li key={category.slug} className="flex">
            <CategoryCard category={category} priority={index < 4} className="w-full" />
            <p className="sr-only">
              {category.name}
              {category.cheapestPrice !== null ? ` from ${formatMoney(category.cheapestPrice)}` : ""}
              {category.lowestMonthly !== null
                ? `, or $${category.lowestMonthly.toFixed(2)} per month`
                : ""}
              .
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
