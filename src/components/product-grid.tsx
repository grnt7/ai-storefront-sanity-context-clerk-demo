import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-parchment/60 px-6 py-16 text-center">
        <p className="display text-2xl text-pine-ink">No gear found</p>
        <p className="mt-2 text-sm text-pine-ink/60">
          Try clearing a filter — or ask the Trail Guide to find it for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
