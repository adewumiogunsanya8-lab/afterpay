-- Make the storefront US-only (USD) and drop the second currency.
--
-- Hand-written rather than generated, because `prisma migrate diff` emits
-- DROP COLUMN / ADD COLUMN for the `minAmountUsd` rename, which would discard
-- the existing values, and its enum alteration fails outright while any 'UK'
-- row is still present.
--
-- The whole file runs in one explicit transaction. Prisma does not wrap every
-- migration automatically, and a half-applied enum swap (new type created, old
-- one still there, foreign keys dropped) leaves the database in a state the
-- client cannot open - which is exactly what happened on the first attempt.

BEGIN;

-- 1. Remove the UK market and every UK price row. Postgres cannot drop an
--    enum value that is still in use, so this has to happen first.
DELETE FROM "product_prices" WHERE "market_code" = 'UK';
DELETE FROM "markets" WHERE "code" = 'UK';

-- Orders referencing the UK market would block the enum change. The store is
-- US-only now, and order rows are a snapshot of a purchase that never happened,
-- so a leftover UK order is removed rather than migrated.
DELETE FROM "orders" WHERE "market_code" = 'UK';

-- 2. Narrow CountryCode to US.
--
-- Recreating an enum means creating a new type and casting the columns, and
-- Postgres refuses to cast a column while a foreign key points at it (the key
-- would end up referencing two different types). So the dependent keys are
-- dropped first and re-added against the new type afterwards.
ALTER TABLE "product_prices" DROP CONSTRAINT IF EXISTS "product_prices_market_code_fkey";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_market_code_fkey";

DROP TYPE IF EXISTS "CountryCode_new";

CREATE TYPE "CountryCode_new" AS ENUM ('US');
ALTER TABLE "markets"
  ALTER COLUMN "code" TYPE "CountryCode_new" USING ("code"::text::"CountryCode_new");
ALTER TABLE "product_prices"
  ALTER COLUMN "market_code" TYPE "CountryCode_new" USING ("market_code"::text::"CountryCode_new");
ALTER TABLE "orders"
  ALTER COLUMN "market_code" TYPE "CountryCode_new" USING ("market_code"::text::"CountryCode_new");
ALTER TYPE "CountryCode" RENAME TO "CountryCode_old";
ALTER TYPE "CountryCode_new" RENAME TO "CountryCode";
DROP TYPE "public"."CountryCode_old";

-- Re-added with the same ON DELETE / ON UPDATE actions as the init migration.
ALTER TABLE "product_prices"
  ADD CONSTRAINT "product_prices_market_code_fkey"
  FOREIGN KEY ("market_code") REFERENCES "markets"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_market_code_fkey"
  FOREIGN KEY ("market_code") REFERENCES "markets"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Narrow CurrencyCode to USD. No foreign keys depend on it.
CREATE TYPE "CurrencyCode_new" AS ENUM ('USD');
ALTER TABLE "markets"
  ALTER COLUMN "currency" TYPE "CurrencyCode_new" USING ("currency"::text::"CurrencyCode_new");
ALTER TABLE "orders"
  ALTER COLUMN "currency" TYPE "CurrencyCode_new" USING ("currency"::text::"CurrencyCode_new");
ALTER TYPE "CurrencyCode" RENAME TO "CurrencyCode_old";
ALTER TYPE "CurrencyCode_new" RENAME TO "CurrencyCode";
DROP TYPE "public"."CurrencyCode_old";

-- 4. Rename in place, preserving the seeded minimum-split values.
ALTER TABLE "installment_configs" RENAME COLUMN "min_demo_amount_usd" TO "min_amount_usd";

COMMIT;
