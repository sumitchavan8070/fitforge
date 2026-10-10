import Link from "next/link";
import { guard } from "@/lib/auth";
import { api, qs } from "@/lib/api";
import { formatInr } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { LinkButton, PageHeader, Pagination, inputClass } from "@/components/ui"
import { ProductTable } from "@/components/product-table";
import { ActionForm } from "@/components/action-form";
import { bulkProductsAction } from "@/server/shop-actions";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await guard("products.view");
  const query = await searchParams;
  const { categories, brands, suppliers, result } = await api(`/api/desk/products${qs(query)}`);
  const view = query.view === "grid" ? "grid" : "table";
  const chips = Object.entries(query).filter(([key, value]) => value && !["page", "view"].includes(key));
  return (
    <div>
      <PageHeader title="Products" description="Catalog, variants, and stock status from the database." actions={<>
        <LinkButton href={view === "grid" ? "/products" : "/products?view=grid"} variant="secondary">{view === "grid" ? "Table view" : "Grid view"}</LinkButton>
        <LinkButton href="/products/new">Add product</LinkButton>
        <a className="inline-flex h-10 items-center rounded-xl border border-border px-3 text-sm font-semibold" href="/api/products/export">Export CSV</a>
      </>} />
      <form className="mb-3 grid gap-2 rounded-2xl border border-border bg-card p-3 md:grid-cols-4" action="/products">
        <input className={inputClass} name="q" defaultValue={query.q} placeholder="Name, SKU, barcode, brand" aria-label="Search products" />
        <select className={inputClass} name="categoryId" defaultValue={query.categoryId} aria-label="Category"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select className={inputClass} name="brandId" defaultValue={query.brandId} aria-label="Brand"><option value="">All brands</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select>
        <select className={inputClass} name="supplierId" defaultValue={query.supplierId} aria-label="Supplier"><option value="">All suppliers</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>
        <select className={inputClass} name="status" defaultValue={query.status} aria-label="Status"><option value="">Any status</option><option>ACTIVE</option><option>DRAFT</option><option>ARCHIVED</option></select>
        <select className={inputClass} name="stock" defaultValue={query.stock} aria-label="Stock"><option value="">Any stock</option><option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
        <select className={inputClass} name="expiry" defaultValue={query.expiry} aria-label="Expiry"><option value="">Any expiry</option><option value="soon">Nearing expiry</option><option value="expired">Expired</option></select>
        <input className={inputClass} name="flavor" defaultValue={query.flavor} placeholder="Flavor" aria-label="Flavor" />
        <input className={inputClass} name="weight" defaultValue={query.weight} placeholder="Weight" aria-label="Weight" />
        <input className={inputClass} name="priceMin" defaultValue={query.priceMin} placeholder="Min price" aria-label="Minimum selling price" />
        <input className={inputClass} name="priceMax" defaultValue={query.priceMax} placeholder="Max price" aria-label="Maximum selling price" />
        <input className={inputClass} name="costMin" defaultValue={query.costMin} placeholder="Min cost" aria-label="Minimum cost" />
        <input className={inputClass} name="costMax" defaultValue={query.costMax} placeholder="Max cost" aria-label="Maximum cost" />
        <input className={inputClass} name="marginMin" defaultValue={query.marginMin} placeholder="Min margin %" aria-label="Minimum margin" />
        <input className={inputClass} name="marginMax" defaultValue={query.marginMax} placeholder="Max margin %" aria-label="Maximum margin" />
        <input className={inputClass} type="date" name="createdFrom" defaultValue={query.createdFrom} aria-label="Created from" />
        <input className={inputClass} type="date" name="createdTo" defaultValue={query.createdTo} aria-label="Created to" />
        <input className={inputClass} type="date" name="expiryFrom" defaultValue={query.expiryFrom} aria-label="Expiry from" />
        <input className={inputClass} type="date" name="expiryTo" defaultValue={query.expiryTo} aria-label="Expiry to" />
        <select className={inputClass} name="sort" defaultValue={query.sort || "name"} aria-label="Sort"><option value="name">Name</option><option value="sku">SKU</option><option value="price">Price</option><option value="stock">Stock</option><option value="created">Created</option></select>
        <select className={inputClass} name="dir" defaultValue={query.dir || "asc"} aria-label="Direction"><option value="asc">Ascending</option><option value="desc">Descending</option></select>
        <button className="h-10 rounded-xl bg-sidebar px-3 text-sm font-semibold text-white">Apply filters</button>
        <Link href="/products" className="inline-flex h-10 items-center justify-center text-sm">Clear all</Link>
      </form>
      {chips.length ? <div className="mb-3 flex flex-wrap gap-2">{chips.map(([key, value]) => <span key={key} className="rounded-full bg-card px-2 py-1 text-xs">{key}: {value}</span>)}</div> : null}
      <form action="/api/products/import" method="post" encType="multipart/form-data" className="mb-3 flex items-center gap-2 text-sm">
        <input aria-label="Import CSV" type="file" name="file" accept=".csv,text/csv" />
        <button className="h-10 rounded-xl border border-border px-3">Import CSV</button>
      </form>
      {view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {result.rows.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="rounded-2xl border border-border bg-card p-3">
              <img src={product.images[0]?.url || "/placeholders/product.svg"} alt="" className="h-36 w-full rounded-xl object-cover" />
              <p className="mt-2 font-semibold">{product.name}</p>
              <p className="text-sm text-muted">{formatInr(product.sellingPrice.toString())} · {product.onHand} in stock</p>
            </Link>
          ))}
        </div>
      ) : (
        <ProductTable rows={result.rows.map((product) => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category?.name || "—",
          price: formatInr(product.sellingPrice.toString()),
          stock: String(product.onHand),
          expiry: formatDate(product.nextExpiry),
          status: product.status,
        }))} />
      )}
      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} path="/products" query={query} />
      <ActionForm action={bulkProductsAction} className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="ids" value={result.rows.map((row) => row.id).join(",")} />
        <select name="status" className={inputClass + " w-auto"} aria-label="Bulk status"><option value="">Status</option><option>ACTIVE</option><option>DRAFT</option><option>ARCHIVED</option></select>
        <select name="categoryId" className={inputClass + " w-auto"} aria-label="Bulk category"><option value="">Category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <input name="pricePercent" placeholder="Price % change" className={inputClass + " w-40"} aria-label="Bulk price percent" />
        <button className="h-10 rounded-xl bg-sidebar px-3 text-sm text-white">Apply to this page</button>
      </ActionForm>
    </div>
  );
}
