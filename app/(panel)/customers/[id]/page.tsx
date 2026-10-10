import Link from "next/link";
import { guard } from "@/lib/auth";
import { load } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DataTable, PageHeader } from "@/components/ui";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await guard("customers.view");
  const { id } = await params;
  const customer = await load(`/api/desk/customers/${id}`);
  const spend = customer.orders.filter((order) => order.completedAt).reduce((sum, order) => sum + Number(order.grandTotal), 0);
  const count = customer.orders.filter((order) => order.completedAt).length;
  return (
    <div>
      <PageHeader title={customer.name} description={`${customer.phone || "No phone"} · ${customer.email || "No email"} · ${customer.group?.name || "No group"} · ${customer.loyaltyPoints} points`} />
      <p className="mb-4 text-sm">Spend {formatInr(spend)} · Average {formatInr(count ? spend / count : 0)} · Last purchase {formatDateTime(customer.orders.find((order) => order.completedAt)?.completedAt)} · WhatsApp {customer.whatsappOptIn ? "opted in" : "no consent"}</p>
      <h2 className="mb-2 font-semibold">Orders</h2>
      <DataTable columns={["Order", "Date", "Total", "Status"]} rows={customer.orders.map((order) => [<Link key={order.id} href={`/orders/${order.id}`}>{order.number}</Link>, formatDateTime(order.createdAt), formatInr(order.grandTotal.toString()), order.status])} />
      <h2 className="mb-2 mt-4 font-semibold">Ledger</h2>
      <DataTable columns={["When", "Type", "Amount", "Balance", "Note"]} rows={customer.ledger.map((entry) => [formatDateTime(entry.createdAt), entry.type, entry.amount.toString(), entry.balanceAfter.toString(), entry.note])} />
      <h2 className="mb-2 mt-4 font-semibold">Messages</h2>
      <ul className="text-sm">{customer.messages.map((message) => <li key={message.id}>{formatDateTime(message.createdAt)} · {message.status} · {message.templateKey}</li>)}</ul>
    </div>
  );
}
