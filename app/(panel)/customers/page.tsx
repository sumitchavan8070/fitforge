import Link from "next/link";
import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { DataTable, PageHeader, inputClass } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { saveCustomerAction } from "@/server/shop-actions";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("customers.view");
  const query = await searchParams;
  const { customers, groups } = await api(`/api/desk/customers${qs(query)}`);
  return (
    <div>
      <PageHeader title="Customers" description="Phone and email are checked for duplicates. Export omits internal notes." actions={<a className="inline-flex h-10 items-center rounded-xl border border-border px-3 text-sm font-semibold" href="/api/customers/export" download>Export</a>} />
      <form className="mb-3 flex gap-2" action="/customers">
        <input className={inputClass} name="q" defaultValue={query.q} placeholder="Name, phone, or email" aria-label="Search customers" />
        <input className={inputClass} name="tag" defaultValue={query.tag} placeholder="Tag" aria-label="Tag" />
        <button className="h-10 rounded-xl bg-sidebar px-3 text-sm text-white">Search</button>
      </form>
      <DataTable columns={["Customer", "Phone", "Group", "Orders", "Balance", "WhatsApp"]} rows={customers.map((customer) => [
        <Link key={customer.id} href={`/customers/${customer.id}`}>{customer.name}</Link>,
        customer.phone || "—",
        customer.group?.name || "—",
        String(customer.orders.length),
        customer.ledger[0]?.balanceAfter.toString() || "0.00",
        customer.whatsappOptIn ? "Opted in" : "No",
      ])} />
      <ActionForm action={saveCustomerAction} className="mt-6 grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-3">
        <h2 className="md:col-span-3 font-semibold">Add customer</h2>
        <input name="name" required placeholder="Name" className={inputClass} aria-label="Name" />
        <input name="phone" placeholder="Phone" className={inputClass} aria-label="Phone" />
        <input name="email" placeholder="Email" className={inputClass} aria-label="Email" />
        <input name="gstin" placeholder="GSTIN" className={inputClass} aria-label="GSTIN" />
        <input name="city" placeholder="City" className={inputClass} aria-label="City" />
        <input name="state" placeholder="State" className={inputClass} aria-label="State" />
        <input name="addressLine1" placeholder="Address" className={inputClass} aria-label="Address" />
        <input name="tags" placeholder="Tags, comma separated" className={inputClass} aria-label="Tags" />
        <select name="groupId" className={inputClass} aria-label="Group"><option value="">No group</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="whatsappOptIn" /> WhatsApp opt-in</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="emailOptIn" /> Email opt-in</label>
        <button className="h-10 rounded-xl bg-accent text-sm font-semibold">Save customer</button>
      </ActionForm>
    </div>
  );
}
