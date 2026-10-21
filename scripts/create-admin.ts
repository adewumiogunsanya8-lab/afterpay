/**
 * Provisions the first dashboard operator.
 *
 * Run with: `npm run db:admin -- --password "your-password"`
 *            `npm run db:admin -- --email someone@example.com --password "pw"`
 *
 * The catalogue seed deliberately does not create an admin, so the credentials
 * are never baked into the repository. This script creates (or re-activates)
 * one account and prints the email it used.
 *
 * The password is hashed with the same `scrypt` helper the login flow uses, so
 * the row it writes is indistinguishable from one created by any other path.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_NAME } from "@/lib/auth/constants";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Neither DIRECT_URL nor DATABASE_URL is set. Copy .env.example to .env and add your " +
      "Supabase connection strings.",
  );
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/** Reads `--flag value` and `--flag=value` pairs from argv. */
function readArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i += 1;
    } else {
      out[key] = "true";
    }
  }
  return out;
}

/** Reads the password from argv, or from the environment as a fallback. */
function resolvePassword(args: Record<string, string>): string {
  const password = args.password ?? process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    throw new Error(
      "No password supplied. Pass --password \"...\" or set ADMIN_PASSWORD in the environment.",
    );
  }
  if (password.length < 8) {
    throw new Error("The password must be at least 8 characters long.");
  }
  return password;
}

async function main() {
  const args = readArgs(process.argv.slice(2));
  const email = (args.email ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const name = (args.name ?? DEFAULT_ADMIN_NAME).trim();
  const password = resolvePassword(args);

  const passwordHash = await hashPassword(password);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    create: { email, name, passwordHash, active: true },
    update: { name, passwordHash, active: true },
    select: { id: true, email: true, name: true },
  });

  console.log("\nAdmin operator ready\n" + "=".repeat(60));
  console.log(`Email    ${admin.email}`);
  console.log(`Name     ${admin.name}`);
  console.log("Password (set, not shown)");
  console.log("=" .repeat(60) + "\n");
}

main()
  .catch((error) => {
    console.error("\nADMIN PROVISIONING FAILED\n", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
