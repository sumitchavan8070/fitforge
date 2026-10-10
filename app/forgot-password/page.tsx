"use client";

import { useActionState } from "react";
import { forgotAction } from "@/server/auth-actions";
import { Button, ErrorText, Field, inputClass } from "@/components/ui";

export default function ForgotPage() {
  const [state, action, pending] = useActionState(forgotAction, { error: "", message: "", devLink: null });
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <form action={action} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <ErrorText>{state.error}</ErrorText>
        {state.message ? <p className="text-sm text-muted">{state.message}</p> : null}
        {state.devLink ? <a className="block break-all text-sm text-success" href={state.devLink}>{state.devLink}</a> : null}
        <Field label="Work email"><input name="email" type="email" required className={inputClass} /></Field>
        <Button disabled={pending}>Send reset link</Button>
      </form>
    </main>
  );
}
