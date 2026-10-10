import { guard } from "@/lib/auth";
import { load } from "@/lib/api";
import { ProductForm } from "@/components/product-form";
import { PageHeader } from "@/components/ui";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await guard("products.write");
  const { id } = await params;
  const { product, brands, categories, units } = await load(`/api/desk/products/${id}/edit`);
  return (
    <div>
      <PageHeader title={`Edit ${product.name}`} />
      <ProductForm
        productId={product.id}
        brands={brands}
        categories={categories}
        units={units}
        initial={{
          name: product.name,
          sku: product.sku,
          barcode: product.barcode || "",
          brandId: product.brandId || "",
          categoryId: product.categoryId || "",
          unitId: product.unitId || "",
          description: product.description,
          status: product.status,
          hsnCode: product.hsnCode,
          taxRate: Number(product.taxRate),
          minStock: Number(product.minStock),
          reorderQty: Number(product.reorderQty),
          costPrice: Number(product.costPrice),
          sellingPrice: Number(product.sellingPrice),
          mrp: product.mrp ? Number(product.mrp) : null,
          trackExpiry: product.trackExpiry,
          imageUrls: product.images.map((image) => image.url),
          variants: product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            barcode: variant.barcode || "",
            flavor: variant.flavor,
            weightLabel: variant.weightLabel,
            weightGrams: variant.weightGrams,
            packaging: variant.packaging,
            costPrice: Number(variant.costPrice),
            sellingPrice: Number(variant.sellingPrice),
            mrp: variant.mrp ? Number(variant.mrp) : null,
            status: variant.status,
            isDefault: variant.isDefault,
          })),
        }}
      />
    </div>
  );
}
