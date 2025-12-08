"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductsGrid } from "@/components/ui/products/products-grid";
import { ProductsTable } from "@/components/ui/products/products-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, Table } from "lucide-react";

export default function ProductsPage() {
  const { data, isLoading, isError } = useProducts();
  const [view, setView] = useState<"grid" | "table">("grid");

  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Products</h2>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            <Button
              type="button"
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none px-3"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              type="button"
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-none px-3"
              onClick={() => setView("table")}
            >
              <Table className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>

          {/* Add product button */}
          <Button onClick={() => router.push("/dashboard/products/new")}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Loading / error states */}
      {isLoading && (
        <p className="text-sm text-slate-400">Loading products...</p>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          Failed to load products. Check backend or auth.
        </p>
      )}

      {/* Data views */}
      {data && data.length > 0 && (
        <>
          {view === "grid" && (
            <section className="space-y-3">
              <ProductsGrid data={data} />
            </section>
          )}

          {view === "table" && (
            <section className="space-y-3">
              {/* <h3 className="text-lg font-medium">Table View</h3> */}
              <ProductsTable data={data} />
            </section>
          )}
        </>
      )}

      {/* Empty state */}
      {data && data.length === 0 && !isLoading && !isError && (
        <p className="text-sm text-slate-500">
          No products found. Click &quot;Add Product&quot; to create one.
        </p>
      )}
    </div>
  );
}
