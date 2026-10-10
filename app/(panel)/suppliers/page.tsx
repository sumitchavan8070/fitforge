import Link from "next/link";
import { guard } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatInr } from "@/lib/money";
import { DataTable, PageHeader, StatusBadge, inputClass } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { saveSupplierAction, paySupplierAction } from "@/server/shop-actions";
import { PurchaseForm, ReceiveForm } from "@/components/purchase-form";

export default async function SuppliersPage() {
  const user = await guard("suppliers.view");
  const { suppliers, orders, variants } = await api("/api/desk/suppliers");
  return (
    <div>
      <PageHeader title="Suppliers and purchases" description="Payables are goods received minus supplier payments and returns." />
      <DataTable columns={["Supplier", "Phone", "Received", "Paid", "Payable"]} rows={suppliers.map((supplier) => {
        const received = supplier.goodsReceipts.reduce((sum, row) => sum + Number(row.grandTotal), 0);
        const paid = supplier.payments.reduce((sum, row) => sum + Number(row.amount), 0);
        const returned = supplier.returns.reduce((sum, row) => sum + Number(row.grandTotal), 0);
        return [<Link key={supplier.id} href={`/suppliers/${supplier.id}`}>{supplier.name}</Link>, supplier.phone || "—", formatInr(received), formatInr(paid), formatInr(received - paid - returned)];
      })} />
      {user.permissions.includes("suppliers.manage") || user.roleName === "Owner" ? (
        <ActionForm action={saveSupplierAction} className="mt-4 grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-3">
          <h2 className="md:col-span-3 font-semibold">Add supplier</h2>
          <input name="name" required placeholder="Name" className={inputClass} aria-label="Supplier name" />
          <input name="phone" placeholder="Phone" className={inputClass} aria-label="Phone" />
          <input name="email" placeholder="Email" className={inputClass} aria-label="Email" />
          <input name="gstin" placeholder="GSTIN" className={inputClass} aria-label="GSTIN" />
          <input name="city" placeholder="City" className={inputClass} aria-label="City" />
          <input name="state" placeholder="State" className={inputClass} aria-label="State" />
          <button className="h-10 rounded-xl bg-accent text-sm font-semibold">Save supplier</button>
        </ActionForm>
      ) : null}
      <div className="mt-4"><PurchaseForm suppliers={suppliers.map((supplier) => ({ id: supplier.id, name: supplier.name }))} variants={variants.map((variant) => ({ id: variant.id, label: `${variant.product.name} ${variant.weightLabel}` }))} /></div>
      <h2 className="mb-2 mt-6 font-semibold">Purchase orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between"><p className="font-semibold">{order.number} · {order.supplier.name}</p><StatusBadge value={order.status} /></div>
          <p className="text-sm">{formatInr(order.grandTotal.toString())}</p>
          <ul className="mt-2 text-sm">{order.items.map((item) => <li key={item.id}>{item.variant.product.name} · ordered {item.quantity.toString()} · received {item.receivedQty.toString()}</li>)}</ul>
          {order.status !== "RECEIVED" && order.status !== "CANCELLED" ? <ReceiveForm purchaseOrderId={order.id} lines={order.items.filter((item) => Number(item.quantity) > Number(item.receivedQty)).map((item) => ({ id: item.id, label: item.variant.sku, remaining: Number(item.quantity) - Number(item.receivedQty) }))} /> : null}
        </div>
      ))}
      <ActionForm action={paySupplierAction} className="mt-4 grid gap-2 md:grid-cols-4">
        <select name="supplierId" className={inputClass} aria-label="Pay supplier">{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>
        <input name="amount" type="number" step="0.01" className={inputClass} aria-label="Payment amount" />
        <select name="method" className={inputClass} aria-label="Method"><option>BANK_TRANSFER</option><option>UPI</option><option>CASH</option></select>
        <button className="h-10 rounded-xl bg-sidebar text-sm text-white">Record supplier payment</button>
      </ActionForm>
    </div>
  );
}
