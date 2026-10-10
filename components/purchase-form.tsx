"use client";

import { useState } from "react";
import { createPurchaseAction, receiveGoodsAction } from "@/server/shop-actions";
import { Button, ErrorText, inputClass } from "@/components/ui";

export function PurchaseForm({ suppliers, variants }: { suppliers: { id: string; name: string }[]; variants: { id: string; label: string }[] }) {
  const [error, setError] = useState("");
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const [quantity, setQuantity] = useState(10);
  const [unitCost, setUnitCost] = useState(1000);
  return (
    <form className="grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-5" onSubmit={async (event) => {
      event.preventDefault();
      const result = await createPurchaseAction({ supplierId, items: [{ variantId, quantity, unitCost }] });
      if ("error" in result && result.error) setError(result.error);
      else setError("");
    }}>
      <h2 className="md:col-span-5 font-semibold">New purchase order</h2>
      <p className="md:col-span-5 text-xs text-muted">Creating an order does not increase stock. Receive the goods to add a batch.</p>
      <ErrorText>{error}</ErrorText>
      <select className={inputClass} value={supplierId} onChange={(event) => setSupplierId(event.target.value)} aria-label="Supplier">{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>
      <select className={inputClass} value={variantId} onChange={(event) => setVariantId(event.target.value)} aria-label="Variant">{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select>
      <input className={inputClass} type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Order quantity" />
      <input className={inputClass} type="number" value={unitCost} onChange={(event) => setUnitCost(Number(event.target.value))} aria-label="Unit cost" />
      <Button type="submit">Create order</Button>
    </form>
  );
}

export function ReceiveForm({ purchaseOrderId, lines }: { purchaseOrderId: string; lines: { id: string; label: string; remaining: number }[] }) {
  const [error, setError] = useState("");
  const [batchNumber, setBatchNumber] = useState(`BATCH-${Date.now().toString().slice(-6)}`);
  const [expiryDate, setExpiryDate] = useState("");
  return (
    <form className="mt-3 grid gap-2" onSubmit={async (event) => {
      event.preventDefault();
      const result = await receiveGoodsAction({
        purchaseOrderId,
        lines: lines.map((line) => ({ purchaseOrderItemId: line.id, quantity: line.remaining, batchNumber, expiryDate })),
      });
      if ("error" in result && result.error) setError(result.error);
      else window.location.reload();
    }}>
      <ErrorText>{error}</ErrorText>
      <input className={inputClass} value={batchNumber} onChange={(event) => setBatchNumber(event.target.value)} aria-label="Batch number" />
      <input className={inputClass} type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} aria-label="Expiry date" />
      <Button type="submit">Receive remaining quantity</Button>
    </form>
  );
}
