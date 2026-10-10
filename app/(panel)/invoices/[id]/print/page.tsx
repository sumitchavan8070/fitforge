import { guard } from "@/lib/auth";
import { load } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DownloadInvoiceButton } from "@/components/download-invoice";

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await guard("invoices.view");
  const { id } = await params;
  const invoice = await load(`/api/desk/invoices/${id}`);
  const shop = invoice.shopSnapshot as Record<string, string>;
  const bill = invoice.billingSnapshot as Record<string, string>;
  return (
    <article className="mx-auto max-w-3xl bg-white p-8 text-sm">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">Use the browser print dialog to print this A4 invoice.</p>
        <DownloadInvoiceButton id={invoice.id} number={invoice.number} />
      </div>
      <header className="flex justify-between border-b pb-4">
        <div><h1 className="text-xl font-semibold">{shop.legalName}</h1><p>{shop.address}</p><p>GSTIN {shop.gstin || "—"}</p></div>
        <div className="text-right"><p className="font-semibold">Tax invoice {invoice.number}</p><p>{formatDate(invoice.issuedAt)}</p><p>{invoice.status}</p></div>
      </header>
      <p className="mt-4"><strong>Bill to</strong> {bill.name}<br />{bill.address}<br />{bill.phone}</p>
      <table className="mt-4 w-full">
        <thead><tr className="border-b text-left"><th>Item</th><th>HSN</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
        <tbody>{invoice.items.map((item) => <tr key={item.id} className="border-b"><td>{item.name}</td><td>{item.hsnCode}</td><td>{item.quantity.toString()}</td><td>{formatInr(item.unitPrice.toString())}</td><td>{formatInr(item.lineTotal.toString())}</td></tr>)}</tbody>
      </table>
      <p className="mt-4 text-right">CGST {formatInr(invoice.cgst.toString())} · SGST {formatInr(invoice.sgst.toString())} · IGST {formatInr(invoice.igst.toString())}</p>
      <p className="text-right text-lg font-semibold">Total {formatInr(invoice.grandTotal.toString())}</p>
      <p className="mt-6 text-xs">{shop.terms}</p>
      <p className="mt-2">{shop.footer}</p>
    </article>
  );
}
