/**
 * Shared admin constants.
 *
 * Kept in their own module because the CLI provisioning script needs the
 * default operator's address but must not import `lib/auth/index.ts` - that
 * module pulls in `next/navigation`, which only works inside a Next.js
 * runtime.
 */

/** The operator this seed script provisions when none exists. */
export const DEFAULT_ADMIN_EMAIL = "ogunsanyaadewumi01@gmail.com";

/** Display name used for the default operator. */
export const DEFAULT_ADMIN_NAME = "AfterPay Admin";
