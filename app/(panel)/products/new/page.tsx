import { guard } from "@/lib/auth";
import { api } from "@/lib/api";
import { ProductForm } from "@/components/product-form";
import { PageHeader } from "@/components/ui";

export default async function NewProductPage() {
  await guard("products.write");
  const { brands, categories, units } = await api("/api/desk/products/options");
  return (
    <div>
      <PageHeader title="Add product" description="Prices are tax-exclusive. Stock changes only through receiving, sales, or adjustments." />
      <ProductForm brands={brands} categories={categories} units={units} />
    </div>
  );
}
