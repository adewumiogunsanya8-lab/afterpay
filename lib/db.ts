// Server-only guard: Prisma + @prisma/adapter-pg are Node.js-only
// and must never be imported from client components.
if (typeof window !== "undefined") {
  throw new Error("lib/db.ts: Prisma client is server-only. Do not import in client components.");
}
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma client singleton (Supabase Postgres).
 *
 * Prisma 7 requires an explicit driver adapter, so the pooled `pg` connection
 * string is handed to `PrismaPg` here. Connection strings live in the
 * environment, never in this file - see `.env.example`:
 *
 *   DATABASE_URL - Supabase pooler (:6543, ?pgbouncer=true). Supabase requires
 *                  pooling in serverless environments, and a direct connection
 *                  will exhaust the connection limit. A direct connection
 *                  (:5432) also works fine for local development.
 *   DIRECT_URL   - direct connection (:5432), used by the Prisma CLI only.
 *
 * The client is cached on `globalThis` in development so `next dev`'s module
 * reloading does not open a new connection pool on every hot reload.
 *
 * Note: this module deliberately does not import `server-only`. That package
 * throws unless it is loaded under React's `react-server` condition, which
 * would break the CLI scripts that read the database outside a Next.js runtime
 * (`scripts/validate-data.ts`, `prisma/seed.ts`). Client code still cannot
 * import this file, because `@prisma/adapter-pg` and the generated client are
 * Node-only.
 */
declare global {
  var __afterpayPrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Supabase " +
        "connection strings before starting the app.",
    );
  }

  // Vercel may keep several function instances warm at once. The pg driver's
  // default pool of 10 connections per instance can multiply into avoidable
  // pressure on Supabase's transaction pooler, so keep each serverless
  // instance small while leaving local development at the pg default.
  const adapter = new PrismaPg({
    connectionString,
    ...(process.env.VERCEL === "1" ? { max: 3 } : {}),
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient =
  globalThis.__afterpayPrisma ?? (globalThis.__afterpayPrisma = createPrismaClient());
