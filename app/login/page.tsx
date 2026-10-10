"use client";

import { useActionState } from "react";
import { loginAction } from "@/server/auth-actions";
import { Button, ErrorText, Field, inputClass } from "@/components/ui";

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <section className="hidden bg-sidebar p-12 text-sidebar-foreground md:block">
        <p className="text-sm text-accent">FitForge Nutrition</p>
        <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">Counter sales, stock, and GST invoices in one shop desk.</h1>
        <p className="mt-4 max-w-md text-sm text-sidebar-muted">Demo workspace. Seeded products, customers, and sales are sample records, not a live business.</p>
      </section>
      <section className="grid place-items-center px-6">
        <form action={action} className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <ErrorText>{state.error}</ErrorText>
          <Field label="Email"><input name="email" type="email" autoComplete="username" required className={inputClass} defaultValue="owner@fitforge.demo" /></Field>
          <Field label="Password"><input name="password" type="password" autoComplete="current-password" required className={inputClass} defaultValue="FitForge#2026" /></Field>
          <Button className="w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button>
          <a className="block text-sm text-muted" href="/forgot-password">Forgot password</a>
          <p className="text-xs text-muted">Demo owner: owner@fitforge.demo / FitForge#2026. Other roles use the same password: manager, cashier, inventory, accountant @fitforge.demo.</p>
        </form>
      </section>
    </main>
  );
}
