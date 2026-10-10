"use client";

import { useState } from "react";
import { createManualOrderAction } from "@/server/shop-actions";
import { ErrorText, inputClass } from "@/components/ui";

export function OrderForm({
  customers,
  variants,
}: {
  customers: { id: string; name: string; phone: string | null }[];
  variants: { id: string; weightLabel: string; product: { name: string } }[];
}) {
  const [mode, setMode] = useState<"lead" | "existing">("lead");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4 rounded-2xl border border-border bg-card p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setPending(true);
        const form = new FormData(event.currentTarget);
        form.set("buyerMode", mode);
        if (mode === "lead") form.delete("customerId");
        const result = await createManualOrderAction(form);
        if (result && "error" in result && result.error) {
          setError(String(result.error));
          setPending(false);
        }
      }}
    >
      <div>
        <h2 className="font-semibold">Create order</h2>
        <p className="mt-1 text-sm text-muted">The buyer is saved as a customer. A matching phone or email is reused so the same person is not added twice.</p>
      </div>
      <ErrorText>{error}</ErrorText>
      <fieldset className="flex flex-wrap gap-4 text-sm">
        <legend className="sr-only">Buyer</legend>
        <label className="flex items-center gap-2"><input type="radio" name="buyerChoice" checked={mode === "lead"} onChange={() => setMode("lead")} /> New lead</label>
        <label className="flex items-center gap-2"><input type="radio" name="buyerChoice" checked={mode === "existing"} onChange={() => setMode("existing")} /> Existing customer</label>
      </fieldset>
      {mode === "existing" ? (
        <label className="grid gap-1 text-sm">Customer
          <select name="customerId" required className={inputClass} aria-label="Existing customer">
            <option value="">Choose a customer</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.phone ? ` · ${customer.phone}` : ""}</option>)}
          </select>
        </label>
      ) : (
        <div className="grid gap-2 md:grid-cols-3">
          <label className="grid gap-1 text-sm">Buyer name<input name="leadName" required minLength={2} className={inputClass} aria-label="Buyer name" /></label>
          <label className="grid gap-1 text-sm">Phone<input name="phone" className={inputClass} aria-label="Buyer phone" /></label>
          <label className="grid gap-1 text-sm">Email<input name="email" type="email" className={inputClass} aria-label="Buyer email" /></label>
          <label className="grid gap-1 text-sm">City<input name="city" className={inputClass} aria-label="Buyer city" /></label>
          <label className="grid gap-1 text-sm">State<input name="state" className={inputClass} aria-label="Buyer state" /></label>
          <label className="grid gap-1 text-sm">Pincode<input name="pincode" className={inputClass} aria-label="Buyer pincode" /></label>
          <label className="grid gap-1 text-sm md:col-span-2">Address<input name="addressLine1" className={inputClass} aria-label="Buyer address" /></label>
          <label className="grid gap-1 text-sm">GSTIN<input name="gstin" className={inputClass} aria-label="Buyer GSTIN" /></label>
          <label className="grid gap-1 text-sm md:col-span-3">Notes<input name="leadNotes" className={inputClass} aria-label="Buyer notes" /></label>
          <label className="flex items-center gap-2 text-sm md:col-span-3"><input type="checkbox" name="whatsappOptIn" /> WhatsApp opt-in</label>
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-3">
        <label className="grid gap-1 text-sm md:col-span-2">Product
          <select name="variantId" required className={inputClass} aria-label="Product variant">
            <option value="">Choose a product</option>
            {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.product.name} {variant.weightLabel}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm">Quantity<input name="quantity" type="number" min={1} step="1" defaultValue={1} required className={inputClass} aria-label="Quantity" /></label>
        <label className="grid gap-1 text-sm md:col-span-3">Order note<input name="orderNotes" className={inputClass} aria-label="Order note" placeholder="Optional note on the order" /></label>
      </div>
      <button disabled={pending} className="h-10 w-fit rounded-xl bg-accent px-4 text-sm font-semibold disabled:opacity-50">{pending ? "Saving…" : "Save customer and create order"}</button>
    </form>
  );
}
