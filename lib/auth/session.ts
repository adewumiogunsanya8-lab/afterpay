import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

/**
 * Server-side admin sessions.
 *
 * The browser holds one opaque token in a `httpOnly` cookie. Only the SHA-256
 * of that token is stored in Postgres, so a leaked database dump cannot be
 * replayed as a login. Every request re-reads the session row, which means
 * signing out or deactivating an operator takes effect immediately rather than
 * when the cookie happens to expire.
 */

/** Cookie holding the session token. */
export const SESSION_COOKIE = "easyvend_admin_session";

/** How long a session stays valid without being used. */
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

/** Hashes a raw session token for storage and lookup. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** The operator behind a session, as far as the UI cares. */
export type AdminIdentity = {
  id: string;
  email: string;
  name: string;
};

/**
 * Reads the current session, or `null` when the visitor is not signed in.
 *
 * Expired sessions are deleted on the way past so the table does not grow
 * without bound.
 */
export async function getCurrentAdmin(): Promise<AdminIdentity | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { admin: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession
      .delete({ where: { id: session.id } })
      .catch(() => undefined);
    return null;
  }

  if (!session.admin.active) return null;

  // Sliding expiry: keep the operator signed in while they are working.
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { expiresAt, lastSeenAt: new Date() },
  });

  return {
    id: session.admin.id,
    email: session.admin.email,
    name: session.admin.name,
  };
}

/**
 * Creates a session for an operator and writes the cookie.
 *
 * The raw token is returned so the caller can log it; it is never stored.
 */
export async function createSession(
  adminId: string,
  userAgent?: string | null,
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(token),
      adminId,
      expiresAt,
      userAgent: userAgent ?? null,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

/** Deletes the current session and clears the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => undefined);
  }

  store.delete(SESSION_COOKIE);
}

/** Removes every session that has already expired. */
export async function pruneExpiredSessions(): Promise<number> {
  const { count } = await prisma.adminSession.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  return count;
}
