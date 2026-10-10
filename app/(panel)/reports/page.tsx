import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { resolveRange } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DateFilter } from "@/components/date-filter";
import { Card, PageHeader, Stat } from "@/components/ui";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("reports.view");
  const query = await searchParams;
  const range = resolveRange(query.range || "month", query.from, query.to);
  const report = await api(`/api/desk/reports${qs({ range: query.range || "month", from: query.from, to: query.to })}`);
  const data = report.data;
  const staff = report.staff;
  const returns = report.returns;
  const users = report.users;
  const names = new Map(users.map((user) => [user.id, user.name]));
  return (
    <div>
      <PageHeader title="Reports" description="Net sales exclude tax. Gross profit uses batch cost of goods sold. Cash collected is a separate cash figure. Cancelled drafts are excluded because they have no completion time." actions={<>
        <a className="rounded-xl border border-border px-3 py-2 text-sm" href={`/api/reports/export?type=sales&range=${range.key}&from=${range.fromYmd}&to=${range.toYmd}`}>Sales CSV</a>
        <a className="rounded-xl border border-border px-3 py-2 text-sm" href={`/api/reports/export?type=tax&range=${range.key}&from=${range.fromYmd}&to=${range.toYmd}`}>GST CSV</a>
        <a className="rounded-xl border border-border px-3 py-2 text-sm" href={`/api/reports/export?type=expenses&range=${range.key}&from=${range.fromYmd}&to=${range.toYmd}`}>Expenses CSV</a>
      </>} />
      <DateFilter path="/reports" current={range.key} from={range.fromYmd} to={range.toYmd} />
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Gross merchandise" value={formatInr(Number(data.kpis.netSales) + Number(data.kpis.discounts))} hint="Before discounts, after returns are not in this shortcut" />
        <Stat label="Net sales ex-tax" value={formatInr(data.kpis.netSales)} />
        <Stat label="GST collected" value={formatInr(data.kpis.tax)} />
        <Stat label="Gross profit" value={formatInr(data.kpis.grossProfit)} hint={`COGS ${formatInr(data.kpis.cogs)}`} />
        <Stat label="Operating expenses" value={formatInr(data.kpis.expenses)} />
        <Stat label="Operating profit" value={formatInr(data.kpis.operatingProfit)} />
        <Stat label="Cash collected" value={formatInr(data.kpis.cashCollected)} />
        <Stat label="Purchases received" value={formatInr(data.kpis.purchases)} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="font-semibold">Staff sales</h2><ul className="mt-2 text-sm">{staff.map((row) => <li key={row.createdById}>{names.get(row.createdById) || "Staff"} · {row._count} orders · {formatInr(Number(row._sum.grandTotal || 0))}</li>)}</ul></Card>
        <Card><h2 className="font-semibold">Returns</h2><ul className="mt-2 text-sm">{returns.map((row) => <li key={row.id}>{row.number} · {row.order.number} · {formatInr(row.grandTotal.toString())}</li>)}{returns.length === 0 ? <li>No returns in this range.</li> : null}</ul></Card>
      </div>
      <Card className="mt-4"><h2 className="font-semibold">Stock valuation now</h2><p className="mt-2 text-sm">Cost {formatInr(data.valuation.cost)} · Retail {formatInr(data.valuation.retail)}. This is a current stock figure, not a period movement.</p></Card>
    </div>
  );
}
