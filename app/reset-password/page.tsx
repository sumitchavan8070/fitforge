"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { resetAction } from "@/server/auth-actions";
import { Button, ErrorText, Field, inputClass } from "@/components/ui";

function Form() {
  const token = useSearchParams().get("token") || "";
  const [state, action, pending] = useActionState(resetAction, { error: "" });
  return (
    <form action={action} className="w-full max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      <ErrorText>{state.error}</ErrorText>
      <input type="hidden" name="token" value={token} />
      <Field label="New password"><input name="password" type="password" required className={inputClass} /></Field>
      <Field label="Confirm"><input name="confirm" type="password" required className={inputClass} /></Field>
      <Button disabled={pending}>Update password</Button>
    </form>
  );
}

export default function ResetPage() {
  return <main className="grid min-h-screen place-items-center px-6"><Suspense><Form /></Suspense></main>;
}
