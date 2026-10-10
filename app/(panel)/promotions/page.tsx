import { guard } from "@/lib/auth";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { PageHeader, StatusBadge, inputClass } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { savePromotionAction, togglePromotionAction } from "@/server/shop-actions";

export default async function PromotionsPage() {
  await guard("promotions.manage");
  const { promotions, categories, products } = await api("/api/desk/promotions");
  return (
    <div>
      <PageHeader title="Promotions" description="Coupon value is recalculated on the server. A client cannot submit its own payable total." />
      <ActionForm action={savePromotionAction} className="grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-3">
        <input name="name" required placeholder="Name" className={inputClass} aria-label="Promotion name" />
        <select name="type" className={inputClass} aria-label="Type"><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount</option></select>
        <input name="value" type="number" step="0.01" required className={inputClass} aria-label="Value" />
        <input name="couponCode" placeholder="Coupon code" className={inputClass} aria-label="Coupon" />
        <input name="startsAt" type="date" required className={inputClass} aria-label="Starts" />
        <input name="endsAt" type="date" required className={inputClass} aria-label="Ends" />
        <input name="minPurchase" type="number" step="0.01" placeholder="Minimum purchase" className={inputClass} aria-label="Minimum" />
        <input name="usageLimit" type="number" placeholder="Usage limit" className={inputClass} aria-label="Usage limit" />
        <select name="categoryId" className={inputClass} aria-label="Category"><option value="">Any category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select name="productId" className={inputClass} aria-label="Product"><option value="">Any product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
        <button className="h-10 rounded-xl bg-accent text-sm font-semibold">Create promotion</button>
      </ActionForm>
      <ul className="mt-4 space-y-2">{promotions.map((promotion) => (
        <li key={promotion.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm">
          <span>{promotion.name} · {promotion.couponCode || "automatic"} · {promotion.value.toString()} {promotion.type} · {formatDate(promotion.startsAt)} to {formatDate(promotion.endsAt)} · used {promotion.usedCount}</span>
          <ActionForm action={togglePromotionAction.bind(null, promotion.id, !promotion.isActive)}><button className="text-sm underline"><StatusBadge value={promotion.isActive ? "ACTIVE" : "ARCHIVED"} /></button></ActionForm>
        </li>
      ))}</ul>
    </div>
  );
}
