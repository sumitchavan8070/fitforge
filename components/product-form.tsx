"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { productSchema, type ProductInput } from "@/lib/validators";
import { saveProductAction } from "@/server/shop-actions";
import { Button, ErrorText, Field, inputClass } from "@/components/ui";

export function ProductForm({
  initial,
  productId,
  brands,
  categories,
  units,
}: {
  initial?: Partial<ProductInput>;
  productId?: string;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  units: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const form = useForm<ProductInput>({
    defaultValues: {
      name: "",
      sku: "",
      barcode: "",
      description: "",
      status: "ACTIVE",
      hsnCode: "",
      taxRate: 18,
      minStock: 5,
      reorderQty: 10,
      costPrice: 0,
      sellingPrice: 0,
      trackExpiry: true,
      imageUrls: [],
      variants: [{ sku: "", flavor: "", weightLabel: "", packaging: "", costPrice: 0, sellingPrice: 0, status: "ACTIVE", isDefault: true }],
      ...initial,
    },
  });
  const variants = useFieldArray({ control: form.control, name: "variants" });
  const images = form.watch("imageUrls") || [];

  async function onSubmit(values: ProductInput) {
    setError("");
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check the product form.");
      return;
    }
    const result = await saveProductAction(parsed.data, productId);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if ("id" in result && result.id) router.push(`/products/${result.id}`);
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <ErrorText>{error || form.formState.errors.variants?.message}</ErrorText>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Product name"><input className={inputClass} {...form.register("name")} /></Field>
        <Field label="Master SKU"><input className={inputClass} {...form.register("sku")} /></Field>
        <Field label="Barcode"><input className={inputClass} {...form.register("barcode")} /></Field>
        <Field label="Brand"><select className={inputClass} {...form.register("brandId")}><option value="">None</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></Field>
        <Field label="Category"><select className={inputClass} {...form.register("categoryId")}><option value="">None</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
        <Field label="Unit"><select className={inputClass} {...form.register("unitId")}><option value="">None</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></Field>
        <Field label="HSN"><input className={inputClass} {...form.register("hsnCode")} /></Field>
        <Field label="GST %"><input type="number" step="0.01" className={inputClass} {...form.register("taxRate")} /></Field>
        <Field label="Minimum stock"><input type="number" step="0.001" className={inputClass} {...form.register("minStock")} /></Field>
        <Field label="Reorder quantity"><input type="number" step="0.001" className={inputClass} {...form.register("reorderQty")} /></Field>
        <Field label="Status"><select className={inputClass} {...form.register("status")}><option>ACTIVE</option><option>DRAFT</option><option>ARCHIVED</option></select></Field>
        <Field label="Description"><textarea className={`${inputClass} h-24 py-2`} {...form.register("description")} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register("trackExpiry")} /> Track expiry dates</label>
      <div>
        <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Variants</h2><Button type="button" variant="secondary" onClick={() => variants.append({ sku: "", flavor: "", weightLabel: "", packaging: "", costPrice: 0, sellingPrice: 0, status: "ACTIVE", isDefault: false })}>Add variant</Button></div>
        <div className="space-y-3">
          {variants.fields.map((field, index) => (
            <div key={field.id} className="grid gap-2 rounded-2xl border border-border p-3 md:grid-cols-4">
              <input placeholder="SKU" className={inputClass} {...form.register(`variants.${index}.sku`)} />
              <input placeholder="Flavor" className={inputClass} {...form.register(`variants.${index}.flavor`)} />
              <input placeholder="Weight" className={inputClass} {...form.register(`variants.${index}.weightLabel`)} />
              <input placeholder="Packaging" className={inputClass} {...form.register(`variants.${index}.packaging`)} />
              <input placeholder="Cost" type="number" step="0.01" className={inputClass} {...form.register(`variants.${index}.costPrice`)} />
              <input placeholder="Selling price" type="number" step="0.01" className={inputClass} {...form.register(`variants.${index}.sellingPrice`)} />
              <input placeholder="MRP" type="number" step="0.01" className={inputClass} {...form.register(`variants.${index}.mrp`)} />
              <input placeholder="Barcode" className={inputClass} {...form.register(`variants.${index}.barcode`)} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register(`variants.${index}.isDefault`)} /> Default</label>
              {variants.fields.length > 1 ? <Button type="button" variant="ghost" onClick={() => variants.remove(index)}>Remove</Button> : null}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 font-semibold">Images</h2>
        <input aria-label="Upload product image" type="file" accept="image/*" onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setUploading(true);
          const body = new FormData();
          body.set("file", file);
          const response = await fetch("/api/uploads", { method: "POST", body });
          const json = await response.json();
          setUploading(false);
          if (!response.ok) { setError(json.error || "Upload failed."); return; }
          form.setValue("imageUrls", [...images, json.url]);
        }} />
        {uploading ? <p className="text-sm text-muted">Uploading…</p> : null}
        <div className="mt-2 flex gap-2">
          {images.map((url) => (
            <div key={url} className="relative">
              <img src={url} alt="" className="h-20 w-20 rounded-xl object-cover" onError={(event) => { event.currentTarget.src = "/placeholders/product.svg"; }} />
              <button type="button" className="text-xs" onClick={() => form.setValue("imageUrls", images.filter((item) => item !== url))}>Remove</button>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save product"}</Button>
    </form>
  );
}
