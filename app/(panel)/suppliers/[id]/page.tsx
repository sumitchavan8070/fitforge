import { guard } from "@/lib/auth";
import { load } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DataTable, PageHeader } from "@/components/ui";

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await guard("suppliers.view");
  const { id } = await params;
  const supplier = await load(`/api/desk/suppliers/${id}`);
  return (
    <div>
      <PageHeader title={supplier.name} description={[supplier.phone, supplier.email, supplier.gstin].filter(Boolean).join(" · ")} />
      <p className="mb-4 text-sm">{supplier.address} {supplier.city} {supplier.state}</p>
      <h2 className="mb-2 font-semibold">Receipts</h2>
      <DataTable columns={["Number", "Date", "Total"]} rows={supplier.goodsReceipts.map((receipt) => [receipt.number, formatDate(receipt.receivedAt), formatInr(receipt.grandTotal.toString())])} />
      <h2 className="mb-2 mt-4 font-semibold">Payments</h2>
      <DataTable columns={["Date", "Method", "Amount"]} rows={supplier.payments.map((payment) => [formatDate(payment.paidAt), payment.method, formatInr(payment.amount.toString())])} />
      <h2 className="mb-2 mt-4 font-semibold">Orders</h2>
      <ul className="text-sm">{supplier.purchaseOrders.map((order) => <li key={order.id}>{order.number} · {order.status}</li>)}</ul>
      <h2 className="mb-2 mt-4 font-semibold">Returns</h2>
      <ul className="text-sm">{supplier.returns.map((row) => <li key={row.id}>{row.number} · {formatInr(row.grandTotal.toString())} · {row.reason}</li>)}</ul>
    </div>
  );
}
