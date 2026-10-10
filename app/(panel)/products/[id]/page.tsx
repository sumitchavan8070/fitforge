import Link from "next/link";
import Image from "next/image";
import { guard } from "@/lib/auth";
import { load } from "@/lib/api";
import { formatInr } from "@/lib/money";
import { formatDateTime } from "@/lib/format";
import { DataTable, LinkButton, PageHeader, StatusBadge } from "@/components/ui"
import { ActionForm } from "@/components/action-form";
import { archiveProductAction, deleteProductAction } from "@/server/shop-actions";
import { marginPercent } from "@/lib/pricing";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await guard("products.view");
  const { id } = await params;
  const { product, movements, purchases, sales } = await load(`/api/desk/products/${id}`);
  const margin = marginPercent(product.costPrice, product.sellingPrice);
  return (
    <div>
      <PageHeader title={product.name} description={`${product.brand?.name || "No brand"} · ${product.category?.name || "No category"} · margin ${margin ? `${margin.toFixed(1)}%` : "—"}`} actions={<>
        <LinkButton href={`/products/${product.id}/edit`} variant="secondary">Edit</LinkButton>
        <ActionForm action={archiveProductAction.bind(null, product.id)}><button className="h-10 rounded-xl border border-border px-3 text-sm">Archive</button></ActionForm>
        <ActionForm action={deleteProductAction.bind(null, product.id)}><button className="h-10 rounded-xl bg-danger px-3 text-sm text-white">Delete if unused</button></ActionForm>
      </>} />
      <div className="mb-4 flex gap-3 overflow-x-auto">
        {(product.images.length ? product.images : [{ url: "/placeholders/product.svg", id: "fallback" }]).map((image) => (
          <Image key={image.id} src={image.url} alt={product.name} width={160} height={160} className="h-40 w-40 rounded-2xl object-cover" unoptimized />
        ))}
      </div>
      <p className="mb-4 text-sm text-muted">{product.description}</p>
      <div className="mb-4 flex gap-2"><StatusBadge value={product.status} /><span className="text-sm">HSN {product.hsnCode || "—"} · GST {product.taxRate.toString()}% · {product.unit?.name || "unit"}</span></div>
      <h2 className="mb-2 font-semibold">Variants and batches</h2>
      <DataTable columns={["SKU", "Flavor", "Weight", "Price", "Cost", "Batch", "Expiry", "On hand", "Reserved", "Supplier"]} rows={product.variants.flatMap((variant) => {
        const batches = variant.batches.length ? variant.batches : [null];
        return batches.map((batch) => [
          variant.sku,
          variant.flavor || "—",
          variant.weightLabel || "—",
          formatInr(variant.sellingPrice.toString()),
          formatInr(variant.costPrice.toString()),
          batch?.batchNumber || "—",
          batch?.expiryDate ? formatDateTime(batch.expiryDate) : "—",
          batch ? batch.quantity.toString() : "0",
          batch ? batch.reserved.toString() : "0",
          batch?.supplier?.name || "—",
        ]);
      })} />
      <h2 className="mb-2 mt-6 font-semibold">Sales</h2>
      <DataTable columns={["Order", "Qty", "Amount", "When"]} rows={sales.map((item) => [<Link key={item.id} href={`/orders/${item.orderId}`}>{item.order.number}</Link>, item.quantity.toString(), formatInr(item.lineTotal.toString()), formatDateTime(item.order.completedAt)])} />
      <h2 className="mb-2 mt-6 font-semibold">Purchases</h2>
      <DataTable columns={["Receipt", "Supplier", "Qty", "Cost", "When"]} rows={purchases.map((item) => [item.goodsReceipt.number, item.goodsReceipt.supplier.name, item.quantity.toString(), formatInr(item.unitCost.toString()), formatDateTime(item.goodsReceipt.receivedAt)])} />
      <h2 className="mb-2 mt-6 font-semibold">Stock movements</h2>
      <DataTable columns={["When", "Type", "In", "Out", "Balance", "By", "Reason"]} rows={movements.map((movement) => [formatDateTime(movement.createdAt), movement.type, movement.quantityIn.toString(), movement.quantityOut.toString(), movement.onHandAfter.toString(), movement.createdBy?.name || "—", movement.reason || movement.referenceType])} />
    </div>
  );
}
