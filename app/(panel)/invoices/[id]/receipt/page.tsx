import { guard } from "@/lib/auth";
import { load } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatInr } from "@/lib/money";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  await guard("invoices.view");
  const { id } = await params;
  const invoice = await load(`/api/desk/invoices/${id}`);
  const shop = invoice.shopSnapshot as Record<string, string>;
  const bill = invoice.billingSnapshot as Record<string, string>;
  return (
    <article className="mx-auto w-[80mm] bg-white p-3 font-mono text-xs">
      <h1 className="text-center text-sm font-bold">{shop.name}</h1>
      <p className="text-center">{shop.address}</p>
      <p className="text-center">GSTIN {shop.gstin || "—"}</p>
      <p className="mt-2">{invoice.number}<br />{formatDateTime(invoice.issuedAt)}<br />{bill.name}</p>
      <ul className="mt-2 border-t border-dashed pt-2">{invoice.items.map((item) => <li key={item.id} className="flex justify-between gap-2"><span>{item.name} x {Number(item.quantity)}</span><span>{formatInr(item.lineTotal.toString())}</span></li>)}</ul>
      <p className="mt-2 flex justify-between border-t border-dashed pt-2 font-bold"><span>Total</span><span>{formatInr(invoice.grandTotal.toString())}</span></p>
      {invoice.payments.map((payment) => <p key={payment.id} className="flex justify-between"><span>{payment.method}</span><span>{formatInr(payment.amount.toString())}</span></p>)}
      <p className="mt-3 text-center">{shop.footer}</p>
    </article>
  );
}
