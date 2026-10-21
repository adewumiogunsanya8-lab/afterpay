/**
 * Checks that catalogue records stored in the live database are usable.
 * An empty product table is valid: operators create products in the admin UI.
 *
 * Run with: npm run validate:data
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before validating data.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const failures: string[] = [];
const warnings: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

async function main() {
  const [markets, categories, products] = await Promise.all([
    prisma.market.findMany(),
    prisma.category.findMany({ include: { specs: true } }),
    prisma.product.findMany({
      include: { prices: true, images: true, installment: true },
    }),
  ]);

  if (!markets.length) warnings.push("No markets are configured yet.");
  if (!categories.length) warnings.push("No categories are configured yet.");
  if (!products.length) warnings.push("No products yet. Add the first one from /admin/products.");

  for (const market of markets) {
    check(market.currencySymbol.trim().length > 0, `Market ${market.code} has no currency symbol.`);
    check(market.estimatedTaxRate.toNumber() >= 0, `Market ${market.code} has a negative tax rate.`);
  }

  for (const category of categories) {
    check(category.name.trim().length > 0, `Category ${category.id} has no name.`);
    check(category.slug.trim().length > 0, `Category ${category.id} has no slug.`);
    check(category.bannerImage.trim().length > 0, `Category ${category.slug} has no banner image.`);
    check(category.priceMin.toNumber() <= category.priceMax.toNumber(), `Category ${category.slug} has an inverted price range.`);
  }

  for (const product of products) {
    check(product.name.trim().length > 0, `Product ${product.id} has no name.`);
    check(product.categoryId.length > 0, `Product ${product.id} has no category.`);
    check(product.prices.length > 0, `Product ${product.name} has no price row.`);
    check(product.images.length > 0 && product.image.trim().length > 0, `Product ${product.name} has no image.`);
    check(product.stock >= 0, `Product ${product.name} has negative stock.`);
    check(product.rating.toNumber() >= 0 && product.rating.toNumber() <= 5, `Product ${product.name} has an invalid rating.`);
    if (product.installment) {
      const months = product.installment.availableMonths;
      check(months.length > 0, `Product ${product.name} has no installment periods.`);
      check(months.includes(product.installment.suggestedMonths), `Product ${product.name} suggests a period that is not available.`);
    }
  }

  console.log("\nDatabase data validation\n" + "=".repeat(48));
  console.log(`Markets       ${markets.length}`);
  console.log(`Categories    ${categories.length}`);
  console.log(`Products      ${products.length}`);
  console.log("=".repeat(48));
  for (const warning of warnings) console.warn(`! ${warning}`);

  if (failures.length) {
    console.error(`\nFAIL: ${failures.length} issue(s):`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log("OK: stored records pass the current data checks.\n");
}

main()
  .catch((error) => {
    console.error("\nVALIDATION FAILED TO RUN\n", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });