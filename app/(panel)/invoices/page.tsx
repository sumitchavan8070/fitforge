import Link from "next/link";
import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DataTable, PageHeader, Pagination, StatusBadge, inputClass } from "@/components/ui";
import { DownloadInvoiceButton } from "@/components/download-invoice";

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("invoices.view");
  const query = await searchParams;
  const { rows, total, page, pageSize } = await api(`/api/desk/invoices${qs(query)}`);
  return (
    <div>
      <PageHeader title="Invoices" description="Issued invoices stay unchanged. Corrections use credit notes." />
      <form className="mb-3 grid gap-2 md:grid-cols-4" action="/invoices">
        <input className={inputClass} name="q" defaultValue={query.q} placeholder="Invoice, order, or customer" aria-label="Search invoices" />
        <select className={inputClass} name="status" defaultValue={query.status} aria-label="Invoice status"><option value="">Any status</option>{["DRAFT","ISSUED","PARTIALLY_PAID","PAID","OVERDUE","CANCELLED","CREDITED"].map((status) => <option key={status}>{status}</option>)}</select>
        <input className={inputClass} name="amount" defaultValue={query.amount} placeholder="Exact amount" aria-label="Amount" />
        <button className="h-10 rounded-xl bg-sidebar text-sm text-white">Search</button>
      </form>
      <DataTable columns={["Invoice", "Order", "Customer", "Date", "Total", "Paid", "Status", "PDF"]} rows={rows.map((invoice) => [
        <Link key={invoice.id} href={`/invoices/${invoice.id}`}>{invoice.number}</Link>,
        invoice.order?.number || "—",
        invoice.customer?.name || "Walk-in",
        formatDate(invoice.issuedAt),
        formatInr(invoice.grandTotal.toString()),
        formatInr(invoice.paidTotal.toString()),
        <StatusBadge key={invoice.id} value={invoice.status} />,
        <DownloadInvoiceButton key={`${invoice.id}-pdf`} id={invoice.id} number={invoice.number} />,
      ])} />
      <Pagination page={page} pageSize={pageSize} total={total} path="/invoices" query={query} />
    </div>
  );
}
