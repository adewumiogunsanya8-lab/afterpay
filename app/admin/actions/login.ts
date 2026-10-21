"use server";

import { authenticate, type AdminIdentity } from "@/lib/auth/index";

/**
 * Server Action: admin login.
 *
 * `useActionState` supplies the previous state and submitted FormData. Read
 * credentials from the named fields before handing them to the auth helper.
 */
type AdminLoginState =
  | { ok: true; admin: AdminIdentity }
  | { ok: false; error: string };

export async function adminLogin(
  _previousState: AdminLoginState | null,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { ok: false, error: "Invalid email or password." };
  }

  const admin = await authenticate(email, password);
  if (!admin) {
    return { ok: false, error: "Invalid email or password." };
  }
  return { ok: true, admin };
}
