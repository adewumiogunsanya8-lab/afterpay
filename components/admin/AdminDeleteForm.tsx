"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AdminActionState } from "@/lib/admin/catalogue-admin";

type DeleteAction = (
  previousState: AdminActionState | null,
  formData: FormData,
) => Promise<AdminActionState>;

export function AdminDeleteForm({
  action,
  confirmationMessage,
  successHref,
  children = "Delete",
  className,
}: {
  action: DeleteAction;
  confirmationMessage: string;
  successHref: string;
  children?: ReactNode;
  className: string;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) router.push(successHref);
  }, [router, state, successHref]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmationMessage)) event.preventDefault();
      }}
      className="inline-flex flex-col items-end gap-2"
    >
      <button type="submit" disabled={isPending} className={className}>
        {isPending ? "Deleting…" : children}
      </button>
      {state && !state.ok ? (
        <ul className="max-w-xs list-disc space-y-1 rounded-lg bg-ember-50 p-3 text-left text-xs text-ember-700">
          {state.errors.map((error, index) => <li key={index}>{error}</li>)}
        </ul>
      ) : null}
    </form>
  );
}
