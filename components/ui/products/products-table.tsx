"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Product, useDeleteProduct } from "@/hooks/use-products";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "../confirm-dialog";

type ProductsTableProps = {
  data: Product[];
};

export function ProductsTable({ data }: ProductsTableProps) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const router = useRouter();
  const deleteMutation = useDeleteProduct();

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "images",
        header: "Image",
        cell: (info) => {
          const images = info.getValue<string[]>();
          const firstImage = images?.[0];

          return (
            <div className="flex justify-center">
              {firstImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={firstImage}
                  alt="Product"
                  className="h-14 w-14 object-cover rounded-md border border-slate-200"
                />
              ) : (
                <div className="h-14 w-14 rounded-md bg-slate-100 border flex items-center justify-center text-xs text-slate-500">
                  No Image
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="uppercase tracking-wide text-xs font-semibold flex items-center gap-1 mx-auto"
          >
            Name
            {column.getIsSorted() === "asc" && "▲"}
            {column.getIsSorted() === "desc" && "▼"}
          </button>
        ),

        cell: (info) => (
          <span className="font-medium text-slate-900">
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting()}
            className="uppercase tracking-wide text-xs font-semibold flex items-center gap-1 mx-auto"
          >
            Price
            {column.getIsSorted() === "asc" && "▲"}
            {column.getIsSorted() === "desc" && "▼"}
          </button>
        ),

        cell: (info) => (
          <span className="font-medium text-slate-800">
            ₹{info.getValue<number>().toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => {
          const desc = (info.getValue<string>() || "").trim();
          return (
            <span className="text-sm text-slate-600 truncate max-w-xs block text-center">
              {desc || "—"}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",

        cell: ({ row }) => {
          const product = row.original;

          // const handleDelete = () => {
          //   const ok = toast.warning(
          //     `Are you sure you want to delete "${product.name}"?`
          //   );
          //   if (!ok) return;

          //   deleteMutation.mutate(product._id);
          // };

          return (
            <div className="flex justify-center gap-2 text-sm font-medium">
              <button
                onClick={() =>
                  router.push(`/dashboard/products/${product._id}`)
                }
                className="px-3 py-1 rounded-md bg-sky-100 text-sky-700 hover:bg-sky-200 transition"
              >
                View
              </button>

              <button
                onClick={() =>
                  router.push(`/dashboard/products/${product._id}/edit`)
                }
                className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition"
              >
                Edit
              </button>

              {/* <button
                onClick={handleDelete}
                className="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition"
              >
                Delete
              </button> */}
              <ConfirmDialog
                title="Are you sure?"
                description={`Delete "${product.name}" permanently?`}
                onConfirm={() => deleteMutation.mutate(product._id)}
              >
                <button className="px-3 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition">
                  Delete
                </button>
              </ConfirmDialog>
            </div>
          );
        },
      },
    ],
    [router, deleteMutation]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <input
          placeholder="Search products..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-3 py-2 border rounded-md w-64 text-sm"
        />
      </div>

      <Table className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto w-6xl mx-auto text-sm">
        <TableHeader className="bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-center"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-slate-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-4 py-3 align-middle text-sm text-slate-800 text-center"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="text-center py-6 text-sm text-slate-500"
              >
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-slate-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>

          <button
            className="px-3 py-1 border rounded disabled:opacity-40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
