"use client";

import Link from "next/link";
import { flexRender } from "@tanstack/react-table";
import { legacyCreateColumnHelper, useLegacyTable } from "@tanstack/react-table/legacy";
import { StatusBadge } from "@/components/ui";

export type ProductTableRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
  expiry: string;
  status: string;
};

const helper = legacyCreateColumnHelper<ProductTableRow>();

const columns = [
  helper.display({ id: "name", header: "Product", cell: (info) => <Link href={`/products/${info.row.original.id}`} className="font-medium">{info.row.original.name}</Link> }),
  helper.display({ id: "sku", header: "SKU", cell: (info) => info.row.original.sku }),
  helper.display({ id: "category", header: "Category", cell: (info) => info.row.original.category }),
  helper.display({ id: "price", header: "Price", cell: (info) => info.row.original.price }),
  helper.display({ id: "stock", header: "Stock", cell: (info) => info.row.original.stock }),
  helper.display({ id: "expiry", header: "Expiry", cell: (info) => info.row.original.expiry }),
  helper.display({ id: "status", header: "Status", cell: (info) => <StatusBadge value={info.row.original.status} /> }),
];

export function ProductTable({ rows }: { rows: ProductTableRow[] }) {
  const table = useLegacyTable({ data: rows, columns });
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className="px-3 py-3 font-medium">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
