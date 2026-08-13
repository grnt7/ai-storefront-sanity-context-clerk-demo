import type { Metadata } from "next";
import { Suspense } from "react";

import { FilterBar } from "@/components/filter-bar";
import { ProductGrid } from "@/components/product-grid";
import { getCategories, getProducts } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Shop all gear",
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  searchParams,
}: PageProps<"/products">) {
  const params = await searchParams;

  const category = firstValue(params.category);
  const size = firstValue(params.size);
  const sort = firstValue(params.sort);
  const q = firstValue(params.q);
  const minPriceRaw = firstValue(params.minPrice);
  const maxPriceRaw = firstValue(params.maxPrice);
  const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;

  const [products, categories] = await Promise.all([
    getProducts({
      category,
      size,
      sort,
      q,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    }),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Trailhead catalog</p>
      <h1 className="display mt-1 text-5xl font-semibold text-pine-ink">
        {activeCategory ? activeCategory.title : "All gear"}
      </h1>
      <p className="mt-2 font-mono text-xs text-moss">
        {products.length} item{products.length === 1 ? "" : "s"}
        {q ? ` matching "${q}"` : ""}
      </p>

      <div className="mt-6 border-y border-line py-3">
        <Suspense>
          <FilterBar categories={categories} />
        </Suspense>
      </div>

      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
