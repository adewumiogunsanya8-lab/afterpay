"use server";

import { destroySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

/**
 * Server Action: admin logout.
 *
 * Destroys the current session and clears the cookie, then redirects to the
 * login page.
 */
export async function adminLogout(): Promise<never> {
  await destroySession();
  redirect("/admin/login");
}