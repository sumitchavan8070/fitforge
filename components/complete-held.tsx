"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutAction } from "@/server/shop-actions";
import { Button, ErrorText, inputClass } from "@/components/ui";

export function CompleteHeld({ orderId, total }: { orderId: string; total: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [method, setMethod] = useState<"CASH" | "UPI" | "CARD" | "BANK_TRANSFER" | "OTHER">("CASH");
  return (
    <form className="mt-4 grid gap-2 rounded-2xl border border-border bg-card p-4" onSubmit={async (event) => {
      event.preventDefault();
      const result = await checkoutAction({ idempotencyKey: crypto.randomUUID(), lines: [], payments: [{ method, amount: total }], mode: "complete", existingOrderId: orderId });
      if ("error" in result && result.error) setError(result.error);
      else if ("invoiceId" in result && result.invoiceId) router.push(`/invoices/${result.invoiceId}?created=1`);
    }}>
      <h2 className="font-semibold">Complete this held or confirmed order</h2>
      <ErrorText>{error}</ErrorText>
      <select className={inputClass} value={method} onChange={(event) => setMethod(event.target.value as typeof method)} aria-label="Payment method">
        <option>CASH</option><option>UPI</option><option>CARD</option><option>BANK_TRANSFER</option><option>OTHER</option>
      </select>
      <Button type="submit">Take {total.toFixed(2)} and issue invoice</Button>
    </form>
  );
}
