/**
 * One-off: repair the leftovers from a half-applied enum migration.
 *
 * The first attempt at `20260927120000_usd_only` dropped the two market foreign
 * keys and created `CountryCode_new`, then failed on the first `ALTER TABLE`.
 * Prisma does not wrap every migration in a transaction, so those changes
 * stayed behind. The migration has since been made atomic and idempotent, but
 * it cannot run until the database is put back into a consistent state.
 *
 * This is deliberately a targeted repair rather than `prisma migrate reset`,
 * so the seeded catalogue is left untouched. It is idempotent.
 *
 * Run: npx tsx scripts/repair-market-fks.ts
 */
import "dotenv/config";

import { Client } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");

  const client = new Client({ connectionString });
  await client.connect();

  // `CountryCode_new` is orphaned: created by the failed run, never adopted.
  // A type with no dependent column is safe to drop.
  await client.query('DROP TYPE IF EXISTS "CountryCode_new"');

  // Restore the foreign keys the failed run removed, with the same actions as
  // the init migration. `NOT VALID` is not used: these tables are small and the
  // rows were just deleted, so a full check is immediate and worth having.
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'product_prices_market_code_fkey'
      ) THEN
        ALTER TABLE "product_prices"
          ADD CONSTRAINT "product_prices_market_code_fkey"
          FOREIGN KEY ("market_code") REFERENCES "markets"("code")
          ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_market_code_fkey'
      ) THEN
        ALTER TABLE "orders"
          ADD CONSTRAINT "orders_market_code_fkey"
          FOREIGN KEY ("market_code") REFERENCES "markets"("code")
          ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  const fks = await client.query<{ conname: string; def: string }>(
    `SELECT con.conname, pg_get_constraintdef(con.oid) AS def
     FROM pg_constraint con
     JOIN pg_class rel ON rel.oid = con.conrelid
     WHERE rel.relname IN ('product_prices','orders') AND con.contype = 'f'
     ORDER BY con.conname`,
  );
  console.log("foreign keys now:");
  for (const fk of fks.rows) console.log(`  ${fk.conname}: ${fk.def}`);

  const types = await client.query<{ name: string }>(
    `SELECT t.typname AS name FROM pg_type t
     JOIN pg_namespace n ON n.oid = t.typnamespace
     WHERE t.typtype = 'e' AND n.nspname = 'public' ORDER BY t.typname`,
  );
  console.log("enum types:", types.rows.map((r) => r.name).join(", "));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
