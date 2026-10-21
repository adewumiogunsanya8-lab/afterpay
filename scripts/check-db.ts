/**
 * One-off: confirm the migrated schema landed in Supabase.
 *
 * Run: `npx tsx scripts/check-db.ts`
 */
import "dotenv/config";

import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();

  const tables = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
  );
  const enums = await client.query(
    `select t.typname as enum_name
       from pg_type t
       join pg_namespace n on n.oid = t.typnamespace
      where t.typtype = 'e' and n.nspname = 'public'
      order by t.typname`,
  );
  const applied = await client.query(
    "select migration_name, finished_at is not null as ok from _prisma_migrations order by started_at",
  );

  console.log(`\nSupabase schema check\n${"=".repeat(60)}`);
  console.log(`Tables (${tables.rowCount}):`);
  for (const row of tables.rows) console.log(`  - ${row.table_name}`);
  console.log(`Enums: ${enums.rows.map((row) => row.enum_name).join(", ")}`);
  console.log(`Migrations: ${applied.rows.map((r) => `${r.migration_name}${r.ok ? " (applied)" : " (PENDING)"}`).join(", ") || "none"}`);

  // Row counts, so an empty catalogue is obvious.
  const expected = [
    "markets",
    "categories",
    "products",
    "product_prices",
    "product_images",
    "product_specs",
    "product_tags",
    "installment_configs",
    "reviews",
    "orders",
  ];
  console.log(`${"-".repeat(60)}\nRow counts:`);
  for (const table of expected) {
    const { rows } = await client.query(`select count(*)::int as n from "${table}"`);
    console.log(`  ${table.padEnd(20)} ${rows[0].n}`);
  }
  console.log("=".repeat(60) + "\n");

  await client.end();
}

main().catch((error) => {
  console.error("CHECK FAILED:", error.message);
  process.exit(1);
});
