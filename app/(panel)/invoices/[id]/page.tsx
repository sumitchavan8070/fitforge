import { guard } from "@/lib/auth";
import { load } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DataTable, LinkButton, PageHeader, StatusBadge } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { payInvoiceAction } from "@/server/shop-actions";
import { WhatsAppShare } from "@/components/whatsapp-share";
import { DownloadInvoiceButton } from "@/components/download-invoice";

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("invoices.view");
  const { id } = await params;
  const query = await searchParams;
  const invoice = await load(`/api/desk/invoices/${id}`);
  const shop = (invoice.shopSnapshot || {}) as Record<string, string>;
  const bill = (invoice.billingSnapshot || {}) as Record<string, string>;
  const due = Math.max(0, Number(invoice.grandTotal) - Number(invoice.paidTotal) - invoice.creditNotes.reduce((sum, note) => sum + Number(note.grandTotal), 0));
  return (
    <div>
      {query.created ? <p className="mb-3 rounded-xl bg-lime-100 px-3 py-2 text-sm">Sale saved. Invoice {invoice.number} is stored.</p> : null}
      <PageHeader title={invoice.number} description={`${shop.legalName || shop.name || ""} · ${formatDate(invoice.issuedAt)}`} actions={<>
        <StatusBadge value={invoice.status} />
        <LinkButton href={`/invoices/${invoice.id}/print`} variant="secondary">Print A4</LinkButton>
        <LinkButton href={`/invoices/${invoice.id}/receipt`} variant="secondary">Thermal receipt</LinkButton>
        <DownloadInvoiceButton id={invoice.id} number={invoice.number} />
      </>} />
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
        <div><p className="text-xs uppercase text-muted">From</p><p className="font-semibold">{shop.legalName}</p><p className="text-sm">{shop.address}</p><p className="text-sm">GSTIN {shop.gstin || "—"}</p></div>
        <div><p className="text-xs uppercase text-muted">Bill to</p><p className="font-semibold">{bill.name}</p><p className="text-sm">{bill.address}</p><p className="text-sm">{bill.phone} {bill.gstin ? `· GSTIN ${bill.gstin}` : ""}</p></div>
      </div>
      <div className="mt-4"><DataTable columns={["Item", "SKU", "HSN", "Qty", "Rate", "Discount", "Tax", "Amount"]} rows={invoice.items.map((item) => [item.name, item.sku, item.hsnCode || "—", item.quantity.toString(), formatInr(item.unitPrice.toString()), formatInr(item.discount.toString()), formatInr(item.taxAmount.toString()), formatInr(item.lineTotal.toString())])} /></div>
      <dl className="ml-auto mt-4 max-w-sm space-y-1 text-sm">
        <div className="flex justify-between"><dt>Discount</dt><dd>{formatInr(invoice.discountTotal.toString())}</dd></div>
        <div className="flex justify-between"><dt>CGST</dt><dd>{formatInr(invoice.cgst.toString())}</dd></div>
        <div className="flex justify-between"><dt>SGST</dt><dd>{formatInr(invoice.sgst.toString())}</dd></div>
        <div className="flex justify-between"><dt>IGST</dt><dd>{formatInr(invoice.igst.toString())}</dd></div>
        <div className="flex justify-between"><dt>Round off</dt><dd>{formatInr(invoice.roundOff.toString())}</dd></div>
        <div className="flex justify-between font-semibold"><dt>Grand total</dt><dd>{formatInr(invoice.grandTotal.toString())}</dd></div>
        <div className="flex justify-between"><dt>Balance</dt><dd>{formatInr(due)}</dd></div>
      </dl>
      <h2 className="mt-6 font-semibold">Payments</h2>
      <DataTable columns={["When", "Method", "Amount", "Reference"]} rows={invoice.payments.map((payment) => [formatDate(payment.paidAt), payment.method, formatInr(payment.amount.toString()), payment.reference || "—"])} />
      {due > 0 ? (
        <ActionForm action={payInvoiceAction} className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="invoiceId" value={invoice.id} />
          <input name="amount" type="number" step="0.01" max={due} defaultValue={due} className="h-10 rounded-xl border border-border px-3" aria-label="Payment amount" />
          <select name="method" className="h-10 rounded-xl border border-border px-3" aria-label="Method"><option>CASH</option><option>UPI</option><option>CARD</option><option>BANK_TRANSFER</option></select>
          <input name="reference" placeholder="Reference" className="h-10 rounded-xl border border-border px-3" aria-label="Reference" />
          <button className="h-10 rounded-xl bg-accent px-3 text-sm font-semibold">Record payment</button>
        </ActionForm>
      ) : null}
      <h2 className="mt-6 font-semibold">Credit notes</h2>
      <ul className="text-sm">{invoice.creditNotes.map((note) => <li key={note.id}>{note.number} · {formatInr(note.grandTotal.toString())} · {note.reason}</li>)}</ul>
      <div className="relative z-20 mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Invoice preview</h2>
        <DownloadInvoiceButton id={invoice.id} number={invoice.number} />
      </div>
      <iframe title={`Invoice ${invoice.number}`} src={`/api/invoices/${invoice.id}/pdf`} className="relative z-0 mt-3 h-[80vh] w-full rounded-2xl border border-border bg-white" />
      <WhatsAppShare invoiceId={invoice.id} />
      {invoice.customer?.email ? <p className="mt-3 text-xs text-muted">Email sending uses SMTP settings. It is not sent automatically.</p> : null}
    </div>
  );
}
