"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "../actions/login";
import { LockIcon } from "@/components/Icons";

/**
 * Admin login page.
 *
 * Uses `useActionState` to call the server action, so validation errors are
 * returned from the server and displayed inline. The form submits to the
 * `adminLogin` server action which authenticates against `admin_users`.
 * On success, redirects to the dashboard.
 */
export default function LoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(adminLogin, null);

  useEffect(() => {
    if (state?.ok) {
      router.push("/admin");
    }
  }, [state, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-ink-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white shadow-card rounded-2xl border border-line p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 mx-auto mb-4">
              <LockIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-950">Sign in</h2>
            <p className="mt-2 text-sm text-ink-500">
              EasyVend admin dashboard
            </p>
          </div>

          {state && !state.ok ? (
            <div className="mb-6 rounded-lg bg-ember-50 p-4 text-sm text-ember-700">
              {state.error}
            </div>
          ) : null}

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm ring-1 ring-inset ring-ink-300 placeholder:text-ink-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm ring-1 ring-inset ring-ink-300 placeholder:text-ink-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm transition"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex w-full justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 hover:shadow-lift disabled:opacity-70 disabled:pointer-events-none transition"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-ink-400">
            No account yet?{" "}
            <Link href="/" className="text-brand-600 hover:text-brand-700 font-medium">
              Return to storefront
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
