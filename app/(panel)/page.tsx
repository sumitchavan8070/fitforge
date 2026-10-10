import Link from "next/link";
import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { resolveRange } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DateFilter } from "@/components/date-filter";
import { RevenueChart, MixChart } from "@/components/charts";
import { Card, LinkButton, PageHeader, Stat, StatusBadge } from "@/components/ui";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("dashboard.view");
  const query = await searchParams;
  const range = resolveRange(query.range, query.from, query.to);
  const data = await api(`/api/desk/dashboard${qs(query)}`);
  const symbol = data.currency;
  return (
    <div>
      <PageHeader title="Dashboard" description="Figures are calculated from stored orders, returns, payments, stock, and expenses for the selected range." actions={<>
        <LinkButton href="/pos">New sale</LinkButton>
        <LinkButton href="/products/new" variant="secondary">Add product</LinkButton>
        <LinkButton href="/customers" variant="secondary">Add customer</LinkButton>
        <LinkButton href="/suppliers" variant="secondary">Record purchase</LinkButton>
        <LinkButton href="/expenses" variant="secondary">Create expense</LinkButton>
      </>} />
      <DateFilter path="/" current={range.key} from={range.fromYmd} to={range.toYmd} />
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Orders" value={String(data.kpis.orders)} hint={range.label} />
        <Stat label="Net sales" value={formatInr(data.kpis.netSales, symbol)} hint={data.kpis.changePercent == null ? "No previous period" : `${data.kpis.changePercent}% vs previous period`} />
        <Stat label="Gross profit" value={formatInr(data.kpis.grossProfit, symbol)} hint="Net sales minus recorded COGS" />
        <Stat label="Average order" value={formatInr(data.kpis.averageOrderValue, symbol)} hint="Net sales / orders" />
        <Stat label="Invoice total" value={formatInr(data.kpis.invoiceTotal, symbol)} hint="Includes GST and round-off, after returns" />
        <Stat label="Outstanding" value={formatInr(data.kpis.outstanding, symbol)} hint="Current customer balances, not limited to this range" />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Discounts" value={formatInr(data.kpis.discounts, symbol)} />
        <Stat label="Tax collected" value={formatInr(data.kpis.tax, symbol)} />
        <Stat label="Cash collected" value={formatInr(data.kpis.cashCollected, symbol)} hint="Cash payments minus cash refunds. Other methods are in the payment chart." />
        <Stat label="Operating profit" value={formatInr(data.kpis.operatingProfit, symbol)} hint={`Expenses ${formatInr(data.kpis.expenses, symbol)}`} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2"><h2 className="mb-3 font-semibold">Net sales by {data.chart.bucket}</h2><RevenueChart points={data.chart.points} /></Card>
        <Card><h2 className="mb-3 font-semibold">Sales by category</h2><MixChart rows={data.categoryMix} /></Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Payment methods</h2>
          <ul className="mt-2 space-y-1 text-sm">{data.paymentMix.map((row) => <li key={row.method} className="flex justify-between"><span>{row.method}</span><span>{formatInr(row.amount, symbol)}</span></li>)}</ul>
          <p className="mt-3 text-xs text-muted">Purchases received in range: {formatInr(data.kpis.purchases, symbol)}. Stock at cost {formatInr(data.valuation.cost, symbol)}, retail {formatInr(data.valuation.retail, symbol)}.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Customers</h2>
          <p className="mt-1 text-sm text-muted">Repeat purchase rate {data.customers.repeatRate}% of {data.customers.buyers} buyers in range.</p>
          <ul className="mt-2 space-y-1 text-sm">{data.customers.best.map((customer) => <li key={customer.id}><Link href={`/customers/${customer.id}`}>{customer.name}</Link> · {customer.orders} orders · {formatInr(customer.spent, symbol)}</li>)}</ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-2 font-semibold">Top products</h2><ul className="space-y-1 text-sm">{data.topProducts.map((row) => <li key={row.sku}>{row.name} · {row.sku} · {row.quantity}</li>)}</ul></Card>
        <Card><h2 className="mb-2 font-semibold">Low performers</h2><ul className="space-y-1 text-sm">{data.slowProducts.map((row) => <li key={row.sku}>{row.name} · {row.sku} · {row.quantity} sold</li>)}</ul></Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold">Stock alerts</h2>
          <ul className="space-y-2 text-sm">{data.lowStock.map((row) => <li key={row.id}><Link href={`/products/${row.id}`}>{row.name}</Link> · {Number(row.on_hand)} / min {Number(row.min_stock)}</li>)}</ul>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">Expiry</h2>
          <ul className="space-y-2 text-sm">{data.expiring.map((row) => <li key={row.id}><Link href={`/inventory?batch=${row.id}`}>{row.name}</Link> · {row.batch_number} · {row.state}</li>)}</ul>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold">Recent orders</h2>
          <ul className="space-y-2 text-sm">{data.recentOrders.map((order) => <li key={order.id} className="flex items-center justify-between gap-2"><Link href={`/orders/${order.id}`}>{order.number}</Link><StatusBadge value={order.status} /><span>{formatInr(order.total, symbol)}</span></li>)}</ul>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">Recent invoices</h2>
          <ul className="space-y-2 text-sm">{data.recentInvoices.map((invoice) => <li key={invoice.id} className="flex items-center justify-between gap-2"><Link href={`/invoices/${invoice.id}`}>{invoice.number}</Link><StatusBadge value={invoice.status} /><span>{formatInr(invoice.total, symbol)}</span></li>)}</ul>
        </Card>
      </div>
    </div>
  );
}
