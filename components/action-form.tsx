"use client";

import type { ReactNode } from "react";

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<unknown> | unknown;
  children: ReactNode;
  className?: string;
}) {
  async function submit(formData: FormData) {
    const result = await action(formData);
    if (result && typeof result === "object" && "error" in result && result.error) {
      throw new Error(String(result.error));
    }
  }
  return (
    <form action={submit} className={className}>
      {children}
    </form>
  );
}
