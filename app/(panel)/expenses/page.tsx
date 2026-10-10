import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { formatInr } from "@/lib/money";
import { DataTable, PageHeader, inputClass } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { saveExpenseAction } from "@/server/shop-actions";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("expenses.view");
  const query = await searchParams;
  const { categories, expenses } = await api(`/api/desk/expenses${qs(query)}`);
  return (
    <div>
      <PageHeader title="Expenses" description="Operating expenses reduce operating profit. They are not included in product gross profit." />
      <form className="mb-3 flex gap-2" action="/expenses">
        <input className={inputClass} name="q" defaultValue={query.q} placeholder="Vendor or note" aria-label="Search expenses" />
        <select className={inputClass} name="categoryId" defaultValue={query.categoryId} aria-label="Category"><option value="">All</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <button className="h-10 rounded-xl bg-sidebar px-3 text-sm text-white">Filter</button>
      </form>
      <DataTable columns={["Date", "Category", "Vendor", "Method", "Amount", "By"]} rows={expenses.map((expense) => [formatDate(expense.spentAt), expense.category.name, expense.vendor || "—", expense.method, formatInr(expense.amount.toString()), expense.createdBy.name])} />
      <ActionForm action={saveExpenseAction} className="mt-4 grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-3">
        <select name="categoryId" className={inputClass} required aria-label="Expense category">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <input name="amount" type="number" step="0.01" required className={inputClass} aria-label="Amount" />
        <input name="spentAt" type="date" required className={inputClass} aria-label="Date" />
        <select name="method" className={inputClass} aria-label="Payment method"><option>CASH</option><option>UPI</option><option>BANK_TRANSFER</option><option>CARD</option></select>
        <input name="vendor" placeholder="Vendor" className={inputClass} aria-label="Vendor" />
        <input name="notes" placeholder="Notes" className={inputClass} aria-label="Notes" />
        <button className="h-10 rounded-xl bg-accent text-sm font-semibold">Record expense</button>
      </ActionForm>
    </div>
  );
}
