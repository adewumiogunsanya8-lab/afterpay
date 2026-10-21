/**
 * Database seed for AfterPay.
 *
 * Run with:  npm run db:seed      (or `npx prisma db seed`)
 *
 * Populates Postgres with the US market and starter categories only. Products
 * are created and managed through the admin dashboard; this script never
 * creates, updates or deletes product records.
 *
 * Design notes:
 *  - Re-running updates the starter market and category copy.
 *  - Existing products and order history are never touched.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { CATEGORIES } from "@/prisma/seed/source/categories";
import { MARKETS } from "@/prisma/seed/source/markets";
import { categoryBannerUrl } from "@/prisma/seed/source/images";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Neither DIRECT_URL nor DATABASE_URL is set. Copy .env.example to .env and add your " +
      "Supabase connection strings.",
  );
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * The subset of the client the seed helpers use.
 *
 * Helpers accept a client so they can run either standalone or inside a
 * `prisma.$transaction(...)` callback. Passing the transactional client is what
 * actually makes the seed atomic - a closure that captures the global `prisma`
 * would silently escape the transaction.
 */
type SeedClient = Pick<
  PrismaClient,
  "market" | "category" | "categorySpec"
>;

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

async function seedMarkets(db: SeedClient) {
  const codes = Object.keys(MARKETS) as (keyof typeof MARKETS)[];
  const rows = codes.map((code, index) => {
    const market = MARKETS[code];
    return {
      code,
      name: market.name,
      shortName: market.shortName,
      flag: market.flag,
      currency: market.currency,
      currencySymbol: market.currencySymbol,
      locale: market.locale,
      standardShipping: market.standardShipping,
      expressShipping: market.expressShipping,
      freeShippingThreshold: market.freeShippingThreshold,
      estimatedTaxRate: market.estimatedTaxRate,
      estimatedTaxLabel: market.estimatedTaxLabel,
      standardDeliveryDays: market.standardDeliveryDays,
      expressDeliveryDays: market.expressDeliveryDays,
      returnsSummary: market.returnsSummary,
      messaging: market.messaging,
      isDefault: index === 0,
      sortOrder: index,
    };
  });

  for (const row of rows) {
    await db.market.upsert({ where: { code: row.code }, create: row, update: row });
  }
  return rows.length;
}

async function seedCategories(db: SeedClient) {
  for (const [index, category] of CATEGORIES.entries()) {
    const row = {
      name: category.name,
      slug: category.slug,
      tagline: category.tagline,
      description: category.description,
      artKey: category.artKey,
      priceMin: 0,
      priceMax: 0,
      bannerImage: categoryBannerUrl(category.artKey, 210, category.name, category.tagline),
      sortOrder: index,
    };
    await db.category.upsert({
      where: { id: category.id },
      create: { id: category.id, ...row },
      update: {
        name: row.name,
        slug: row.slug,
        tagline: row.tagline,
        description: row.description,
        artKey: row.artKey,
        sortOrder: row.sortOrder,
      },
    });

    // Category spec rows are fully owned by the category, so replace them.
    await db.categorySpec.deleteMany({ where: { categoryId: category.id } });
    await db.categorySpec.createMany({
      data: category.specs.map((spec, position) => ({
        categoryId: category.id,
        label: spec.label,
        value: spec.value,
        position,
      })),
    });
  }
  return CATEGORIES.length;
}

// ---------------------------------------------------------------------- main

/**
 * Transaction tuning.
 *
 * The defaults are far too tight for a remote pooler. `maxWait` is how long
 * Prisma will wait to *acquire* a connection to open a transaction, and it
 * defaults to 2s - Supaviser frequently takes longer than that to hand one out,
 * which fails with `P2028: Unable to start a transaction in the given time`
 * before any work has started. `timeout` bounds the whole callback.
 */
const TX = { maxWait: 30_000, timeout: 600_000 } as const;

async function main() {
  const started = Date.now();
  console.log("\nAfterPay - seeding Postgres\n" + "=".repeat(60));

  // One transaction: either the market and starter categories land, or nothing does.
  const [markets, categories] = await prisma.$transaction(
    async (tx) => [
      await seedMarkets(tx),
      await seedCategories(tx),
    ],
    TX,
  );

  console.log(`Markets                  ${markets}`);
  console.log(`Categories               ${categories}`);
  console.log(`Elapsed                  ${formatDuration(Date.now() - started)}`);
  console.log("=".repeat(60) + "\n");
  console.log("Seed complete.\n");
}

main()
  .catch((error) => {
    console.error("\nSEED FAILED\n", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
