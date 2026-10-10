import Link from "next/link";
import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { DataTable, PageHeader, inputClass } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { adjustStockAction, supplierReturnAction, transferStockAction } from "@/server/shop-actions";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("inventory.view");
  const query = await searchParams;
  const { batches, movements, variants, locations, suppliers, settings } = await api(`/api/desk/inventory${qs(query)}`);
  return (
    <div>
      <PageHeader title="Inventory" description="Costing method: specific identification. Each sale consumes the earliest non-expired, non-recalled batch (FEFO) and records that batch's unit cost as COGS." />
      <form className="mb-3" action="/inventory"><input className={inputClass} name="q" defaultValue={query.q} placeholder="Search batch, SKU, or product" aria-label="Search stock" /></form>
      <DataTable columns={["Product", "Batch", "Expiry", "On hand", "Reserved", "Available", "Cost", "Location"]} rows={batches.map((batch) => {
        const available = Number(batch.quantity) - Number(batch.reserved);
        return [
          <Link key={batch.id} href={`/products/${batch.variant.productId}`}>{batch.variant.product.name} · {batch.variant.sku}</Link>,
          `${batch.batchNumber}${batch.recalled ? " (recalled)" : ""}`,
          formatDate(batch.expiryDate),
          batch.quantity.toString(),
          batch.reserved.toString(),
          available.toFixed(3),
          batch.unitCost.toString(),
          batch.location.name,
        ];
      })} />
      <ActionForm action={adjustStockAction} className="mt-6 grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
        <h2 className="md:col-span-4 font-semibold">Stock adjustment</h2>
        <select name="variantId" className={inputClass} required aria-label="Variant">{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.product.name} {variant.weightLabel}</option>)}</select>
        <select name="batchId" className={inputClass} aria-label="Batch"><option value="">FEFO / new batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batchNumber}</option>)}</select>
        <select name="direction" className={inputClass} aria-label="Direction"><option value="IN">Stock in</option><option value="OUT">Stock out</option></select>
        <select name="reason" className={inputClass} aria-label="Reason"><option>CORRECTION</option><option>DAMAGE</option><option>EXPIRED</option><option>COUNT</option></select>
        <input name="quantity" type="number" step="0.001" min="0.001" required className={inputClass} aria-label="Quantity" />
        <input name="unitCost" type="number" step="0.01" placeholder="Cost for new batch" className={inputClass} aria-label="Unit cost" />
        <input name="expiryDate" type="date" className={inputClass} aria-label="Expiry" />
        <input name="note" placeholder="Note" className={inputClass} aria-label="Note" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="allowNegative" /> Allow negative stock</label>
        <button className="h-10 rounded-xl bg-sidebar text-sm text-white">Post adjustment</button>
      </ActionForm>
      {settings.multiLocation ? (
        <ActionForm action={transferStockAction} className="mt-4 grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
          <h2 className="md:col-span-4 font-semibold">Transfer</h2>
          <select name="batchId" className={inputClass} aria-label="Transfer batch">{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batchNumber}</option>)}</select>
          <input type="hidden" name="variantId" value={batches[0]?.variantId || ""} />
          <select name="toLocationId" className={inputClass} aria-label="Destination">{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select>
          <input name="quantity" type="number" step="0.001" className={inputClass} aria-label="Transfer quantity" />
          <button className="h-10 rounded-xl bg-sidebar text-sm text-white">Transfer</button>
        </ActionForm>
      ) : <p className="mt-4 text-sm text-muted">Transfers stay off until multi-location mode is enabled in settings.</p>}
      <ActionForm action={supplierReturnAction} className="mt-4 grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
        <h2 className="md:col-span-4 font-semibold">Supplier return</h2>
        <select name="supplierId" className={inputClass} aria-label="Supplier">{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>
        <select name="batchId" className={inputClass} aria-label="Return batch">{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.batchNumber}</option>)}</select>
        <input name="quantity" type="number" step="0.001" className={inputClass} aria-label="Return quantity" />
        <input name="reason" required placeholder="Reason" className={inputClass} aria-label="Return reason" />
        <button className="h-10 rounded-xl bg-sidebar text-sm text-white">Return stock</button>
      </ActionForm>
      <h2 className="mb-2 mt-6 font-semibold">Movement history</h2>
      <DataTable columns={["When", "Product", "Type", "In", "Out", "On hand", "Staff", "Reason"]} rows={movements.map((movement) => [formatDate(movement.createdAt), movement.variant.product.name, movement.type, movement.quantityIn.toString(), movement.quantityOut.toString(), movement.onHandAfter.toString(), movement.createdBy?.name || "—", movement.reason || movement.referenceType])} />
    </div>
  );
}
