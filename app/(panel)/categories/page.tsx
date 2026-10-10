import { guard } from "@/lib/auth";
import { api } from "@/lib/api";
import { PageHeader, inputClass } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { saveCategoryAction } from "@/server/shop-actions";

export default async function CategoriesPage() {
  await guard("categories.manage");
  const categories = await api("/api/desk/categories");
  return (
    <div>
      <PageHeader title="Categories" description="Categories and optional subcategories used by products and promotions." />
      <ActionForm action={saveCategoryAction} className="mb-4 grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-4">
        <input name="name" required placeholder="Name" className={inputClass} aria-label="Category name" />
        <select name="parentId" className={inputClass} aria-label="Parent category"><option value="">No parent</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <input name="description" placeholder="Description" className={inputClass} aria-label="Description" />
        <button className="h-10 rounded-xl bg-accent text-sm font-semibold">Save category</button>
      </ActionForm>
      <ul className="space-y-2">{categories.map((category) => <li key={category.id} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">{category.name} {category.parent ? `· under ${category.parent.name}` : ""} · {category._count.products} products</li>)}</ul>
    </div>
  );
}
