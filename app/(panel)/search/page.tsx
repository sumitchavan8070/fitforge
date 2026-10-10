import Link from "next/link";
import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { PageHeader } from "@/components/ui";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("dashboard.view");
  const query = await searchParams;
  const q = query.q?.trim() || "";
  const { products, customers, invoices, orders } = await api(`/api/desk/search${qs({ q })}`);
  return (
    <div>
      <PageHeader title="Search" description={q ? `Results for “${q}”` : "Type in the top bar and press enter."} />
      <Section title="Products" rows={products.map((product) => ({ href: `/products/${product.id}`, label: `${product.name} · ${product.sku}` }))} />
      <Section title="Customers" rows={customers.map((customer) => ({ href: `/customers/${customer.id}`, label: customer.name }))} />
      <Section title="Invoices" rows={invoices.map((invoice) => ({ href: `/invoices/${invoice.id}`, label: invoice.number }))} />
      <Section title="Orders" rows={orders.map((order) => ({ href: `/orders/${order.id}`, label: order.number }))} />
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: { href: string; label: string }[] }) {
  return (
    <section className="mb-4">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? <p className="text-sm text-muted">Nothing matched.</p> : <ul className="mt-1 text-sm">{rows.map((row) => <li key={row.href}><Link href={row.href}>{row.label}</Link></li>)}</ul>}
    </section>
  );
}
