import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 CLI configuration.
 *
 * Prisma 7 moved the datasource connection string out of `schema.prisma` and
 * into this file. For Supabase we use two URLs:
 *
 *   DIRECT_URL   - direct Postgres connection (port 5432). Used by the CLI for
 *                  DDL and migrations, because the pooler cannot run them.
 *   DATABASE_URL - Supabase pooler (port 6543, ?pgbouncer=true). Used by the
 *                  running app so it never exhausts the connection limit.
 *
 * The CLI reads DIRECT_URL; the app reads DATABASE_URL (see lib/db.ts).
 */

/**
 * Reads a required connection string with an actionable error.
 *
 * Prisma's own `env()` helper throws a bare
 * `PrismaConfigEnvError: Cannot resolve environment variable: DIRECT_URL`, which
 * gives no hint about what to do next. This points at the missing file instead.
 */
function requireUrl(name: string, purpose: string): string {
  const value = process.env[name];
  if (value && value.trim()) return value;

  throw new Error(
    [
      `${name} is not set, so the Prisma CLI cannot ${purpose}.`,
      "",
      "Set it up:",
      "  1. Copy the template:   Copy-Item .env.example .env",
      "  2. Paste your Supabase connection strings into .env",
      "     (Supabase dashboard -> Project -> Settings -> Data API)",
      "",
      "If .env already exists, make sure the variable is spelled exactly",
      `${name} and is not wrapped in single quotes.`,
    ].join("\n"),
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 no longer auto-runs the seed, so it is wired up explicitly.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: requireUrl("DIRECT_URL", "run migrations"),
  },
});
