import { guard } from "@/lib/auth";
import { load } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DataTable, PageHeader, StatusBadge } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { cancelOrderAction, returnSaleAction } from "@/server/shop-actions";
import { CompleteHeld } from "@/components/complete-held";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await guard("orders.view");
  const { id } = await params;
  const order = await load(`/api/desk/orders/${id}`);
  return (
    <div>
      <PageHeader title={order.number} description={order.customer?.name || "Walk-in customer"} actions={<><StatusBadge value={order.status} /><StatusBadge value={order.paymentStatus} /></>} />
      <p className="mb-4 text-sm">Total {formatInr(order.grandTotal.toString())} · Paid {formatInr(order.paidTotal.toString())} · COGS {formatInr(order.cogsTotal.toString())}</p>
      {order.invoice ? <a className="text-sm font-semibold underline" href={`/invoices/${order.invoice.id}`}>Invoice {order.invoice.number}</a> : null}
      <div className="mt-4"><DataTable columns={["Item", "SKU", "Qty", "Returned", "Price", "Discount", "Tax", "Total"]} rows={order.items.map((item) => [item.name, item.sku, item.quantity.toString(), item.returnedQty.toString(), formatInr(item.unitPrice.toString()), formatInr(item.discount.toString()), formatInr(item.taxAmount.toString()), formatInr(item.lineTotal.toString())])} /></div>
      <h2 className="mb-2 mt-6 font-semibold">Timeline</h2>
      <ol className="space-y-2 text-sm">{order.events.map((event) => <li key={event.id}><span className="text-muted">{formatDateTime(event.createdAt)}</span> · {event.message}</li>)}</ol>
      {order.messages.length ? <div className="mt-4 text-sm">{order.messages.map((message) => <p key={message.id}>WhatsApp {message.status}: {message.body}</p>)}</div> : null}
      {order.status === "PENDING" || order.status === "DRAFT" || order.status === "CONFIRMED" ? <CompleteHeld orderId={order.id} total={Number(order.grandTotal)} /> : null}
      {["COMPLETED", "PARTIALLY_REFUNDED"].includes(order.status) ? (
        <ActionForm action={returnSaleAction} className="mt-6 grid gap-2 rounded-2xl border border-border bg-card p-4">
          <h2 className="font-semibold">Return items</h2>
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="items" value={JSON.stringify(order.items.filter((item) => Number(item.quantity) > Number(item.returnedQty)).map((item) => ({ orderItemId: item.id, quantity: Number(item.quantity) - Number(item.returnedQty) })))} />
          <input name="reason" required placeholder="Reason" className="h-10 rounded-xl border border-border px-3" aria-label="Return reason" />
          <input name="refundAmount" type="number" step="0.01" placeholder="Refund amount" className="h-10 rounded-xl border border-border px-3" aria-label="Refund amount" />
          <select name="method" className="h-10 rounded-xl border border-border px-3" aria-label="Refund method"><option>CASH</option><option>UPI</option><option>CARD</option><option>BANK_TRANSFER</option></select>
          <button className="h-10 rounded-xl bg-sidebar px-3 text-sm text-white">Create return and credit note</button>
        </ActionForm>
      ) : null}
      {!["CANCELLED", "REFUNDED"].includes(order.status) ? (
        <ActionForm action={cancelOrderAction} className="mt-4 flex gap-2">
          <input type="hidden" name="orderId" value={order.id} />
          <input name="reason" required placeholder="Cancellation reason" className="h-10 flex-1 rounded-xl border border-border px-3" aria-label="Cancellation reason" />
          <button className="h-10 rounded-xl bg-danger px-3 text-sm text-white">Cancel order</button>
        </ActionForm>
      ) : null}
    </div>
  );
}
