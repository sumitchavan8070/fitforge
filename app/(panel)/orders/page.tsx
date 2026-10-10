import Link from "next/link";
import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DataTable, PageHeader, Pagination, StatusBadge, inputClass } from "@/components/ui"
import { OrderForm } from "@/components/order-form";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await guard("orders.view");
  const query = await searchParams;
  const { orders, total, page, pageSize, customers, variants } = await api(`/api/desk/orders${qs(query)}`);
  const canCreate = user.roleName === "Owner" || user.permissions.includes("orders.manage");
  return (
    <div>
      <PageHeader title="Orders" description="Create an order for a new lead or an existing customer. Confirmed orders stay open until the sale is completed." />
      {canCreate ? <OrderForm customers={customers} variants={variants} /> : null}
      <h2 className="mb-3 mt-6 font-semibold">My orders</h2>
      <form className="mb-3 grid gap-2 md:grid-cols-5" action="/orders">
        <input className={inputClass} name="q" defaultValue={query.q} placeholder="Order or customer" aria-label="Search orders" />
        <select className={inputClass} name="status" defaultValue={query.status} aria-label="Order status"><option value="">Any status</option>{["DRAFT","PENDING","CONFIRMED","PROCESSING","COMPLETED","CANCELLED","PARTIALLY_REFUNDED","REFUNDED"].map((status) => <option key={status}>{status}</option>)}</select>
        <select className={inputClass} name="customerId" defaultValue={query.customerId} aria-label="Customer"><option value="">Any customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select>
        <input className={inputClass} type="date" name="from" defaultValue={query.from} aria-label="From" />
        <input className={inputClass} type="date" name="to" defaultValue={query.to} aria-label="To" />
        <button className="h-10 rounded-xl bg-sidebar px-3 text-sm text-white">Filter</button>
      </form>
      <DataTable columns={["Order", "Customer", "Date", "Total", "Payment", "Status"]} rows={orders.map((order) => [
        <Link key={order.id} href={`/orders/${order.id}`}>{order.number}</Link>,
        order.customer?.name || "Walk-in",
        formatDateTime(order.createdAt),
        formatInr(order.grandTotal.toString()),
        <StatusBadge key={`${order.id}-p`} value={order.paymentStatus} />,
        <StatusBadge key={`${order.id}-s`} value={order.status} />,
      ])} />
      <Pagination page={page} pageSize={pageSize} total={total} path="/orders" query={query} />
    </div>
  );
}
