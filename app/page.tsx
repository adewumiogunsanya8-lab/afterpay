import Link from "next/link";
import { connection } from "next/server";
import { FAQ } from "@/components/FAQ";
import { CategoryCard } from "@/components/CategoryCard";
import { Hero } from "@/components/Hero";
import {
  AboutSection,
  PayLaterSteps,
  WhyAfterPay,
} from "@/components/MarketingSections";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeader } from "@/components/SectionHeader";
import {
  getBestSellers,
  getCategoriesWithStats,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/catalogue";

export default async function HomePage() {
  // The homepage is assembled from live catalogue data and should not query
  // Postgres as part of static prerendering during deployment.
  await connection();
  const [featured, bestSellers, newArrivals, categories] =
    await Promise.all([
      getFeaturedProducts(8),
      getBestSellers(8),
      getNewArrivals(8),
      getCategoriesWithStats(),
    ]);
  const popularCategories = categories.slice(0, 8);

  return (
    <>
      <Hero />

      <section className="container-page section">
        <SectionHeader
          eyebrow="Handpicked"
          title="Featured products"
          description="Favourites across every category, each with a monthly figure shown next to the price."
          action={{ label: "Browse all products", href: "/search" }}
        />
        <ProductGrid products={featured} />
      </section>

      <section className="bg-surface py-10 sm:py-14">
        <div className="container-page">
          <SectionHeader
            eyebrow="Popular categories"
            title="Shop by category"
            description="Browse the full catalogue by category."
            action={{ label: "All categories", href: "/categories" }}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {popularCategories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page section">
        <SectionHeader
          eyebrow="Most bought"
          title="Best sellers"
          description="The products shoppers add to cart most often."
          action={{ label: "See best sellers", href: "/search?sort=rating" }}
        />
        <ProductGrid products={bestSellers} />
      </section>

      <section className="bg-surface py-10 sm:py-14">
        <div className="container-page">
          <SectionHeader
            eyebrow="Just landed"
            title="New arrivals"
            description="Recently added to the catalogue."
            action={{ label: "See new arrivals", href: "/search?sort=newest" }}
          />
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="bg-surface py-10 sm:py-14">
        <div className="container-page">
          <PayLaterSteps />
        </div>
      </section>

      <section className="container-page section">
        <WhyAfterPay />
      </section>

      <section className="container-page section">
        <AboutSection />
      </section>

      <section className="container-page section pt-0">
        <SectionHeader
          eyebrow="Questions"
          title="Frequently asked questions"
          description="Everything you need to know, answered plainly."
        />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div id="faq" className="scroll-mt-24">
            <FAQ />
          </div>
          <div className="card h-fit p-5">
            <h3 className="text-base font-semibold text-ink-950">Still have questions?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Browse the catalogue, compare products, and review delivery details before
              confirming your order.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/categories" className="btn btn-primary">
                Start shopping
              </Link>
              <Link href="/search?q=laptop" className="btn btn-secondary">
                Try a search
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
