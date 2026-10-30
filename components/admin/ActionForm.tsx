"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";

/** A form bound to a server action that shows the action's error or success message under it. */
export function ActionForm({
  action,
  children,
  submit,
  className,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submit: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className ?? "adm-form"}>
      {children}
      <div className="adm-form-foot">
        <button type="submit" className="adm-btn" disabled={pending}>
          {pending ? "Saving…" : submit}
        </button>
        <p role="status" aria-live="polite" className={state?.error ? "adm-msg adm-msg-err" : "adm-msg adm-msg-ok"}>
          {state?.error ?? state?.ok ?? ""}
        </p>
      </div>
    </form>
  );
}
