import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  getCurrentAdmin,
  type AdminIdentity,
} from "@/lib/auth/session";

export type { AdminIdentity };
import { DEFAULT_ADMIN_EMAIL } from "@/lib/auth/constants";

export { DEFAULT_ADMIN_EMAIL };

/**
 * Authentication helpers for the admin dashboard.
 *
 * Every dashboard read and every write goes through one of these guards, so
 * authorisation is enforced on the server rather than in the browser.
 */

/**
 * Signs an operator in.
 *
 * Returns `null` on any failure - unknown email, wrong password or a
 * deactivated account - so the caller cannot tell an attacker which of the
 * three happened.
 */
export async function authenticate(
  email: unknown,
  password: unknown,
  userAgent?: string | null,
): Promise<AdminIdentity | null> {
  if (typeof email !== "string" || typeof password !== "string") return null;

  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalized },
  });

  if (!admin || !admin.active) {
    // Spend roughly the same time as a real verification would, so response
    // timing does not reveal whether the email exists.
    await verifyPassword(password, "scrypt$16384$8$1$AAAA$AAAA");
    return null;
  }

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return null;

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(admin.id, userAgent);

  return { id: admin.id, email: admin.email, name: admin.name };
}

/**
 * Returns the signed-in operator, or `null`.
 *
 * Use this on pages that render differently for signed-in visitors.
 */
export async function getAdmin(): Promise<AdminIdentity | null> {
  return getCurrentAdmin();
}

/**
 * Returns the signed-in operator or redirects to the login page.
 *
 * Use this in every dashboard page and server action: an unauthenticated
 * request never reaches the data layer.
 */
export async function requireAdmin(): Promise<AdminIdentity> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}

/**
 * Same as {@link requireAdmin}, but for server actions, where `redirect`
 * throws and the caller wants a boolean instead.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getCurrentAdmin()) !== null;
}
