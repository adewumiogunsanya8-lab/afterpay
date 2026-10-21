import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

const EXPECTED_PROJECT = "rqpcdnmbjtqdhtecjawn";
const confirmation = process.argv.find((argument) => argument.startsWith("--confirm-project="))?.split("=", 2)[1];
if (confirmation !== EXPECTED_PROJECT) {
  throw new Error(`Run with --confirm-project=${EXPECTED_PROJECT} to confirm the database target.`);
}

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DIRECT_URL or DATABASE_URL before purging products.");

const databaseUrl = new URL(connectionString);
const projectIdentity = `${databaseUrl.hostname} ${decodeURIComponent(databaseUrl.username)}`;
if (!projectIdentity.includes(EXPECTED_PROJECT)) {
  throw new Error("The configured database connection does not identify the confirmed Supabase project.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const TX = { maxWait: 30_000, timeout: 120_000 } as const;

async function main() {
  const [productsBefore, categoriesBefore, marketsBefore, ordersBefore, orderItemsBefore] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.market.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
  ]);

  console.log(`Target project: ${EXPECTED_PROJECT}`);
  console.log(`Database host: ${databaseUrl.hostname}`);
  console.log(`Products to delete: ${productsBefore}`);
  console.log(`Categories, markets, orders, order items preserved: ${categoriesBefore}, ${marketsBefore}, ${ordersBefore}, ${orderItemsBefore}`);

  const deleted = await prisma.$transaction(async (tx) => {
    const result = await tx.product.deleteMany();
    await tx.category.updateMany({ data: { priceMin: 0, priceMax: 0 } });
    return result.count;
  }, TX);

  const [productsAfter, categoriesAfter, marketsAfter, ordersAfter, orderItemsAfter] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.market.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
  ]);
  if (productsAfter !== 0 || categoriesBefore !== categoriesAfter || marketsBefore !== marketsAfter || ordersBefore !== ordersAfter || orderItemsBefore !== orderItemsAfter) {
    throw new Error("Post-purge counts did not match the expected preserved data.");
  }

  console.log(`Deleted products: ${deleted}`);
  console.log(`Verified preserved categories, markets, orders, order items: ${categoriesAfter}, ${marketsAfter}, ${ordersAfter}, ${orderItemsAfter}`);
}

main()
  .catch((error) => {
    console.error("Product purge failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
