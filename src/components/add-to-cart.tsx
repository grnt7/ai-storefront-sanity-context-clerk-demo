"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function AddToCart({
  product,
  imageUrl,
}: {
  product: Product;
  imageUrl?: string;
}) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string | undefined>(
    product.sizes?.length === 1 ? product.sizes[0] : undefined,
  );
  const [color, setColor] = useState<string | undefined>(
    product.colors?.length === 1 ? product.colors[0] : undefined,
  );
  const [added, setAdded] = useState(false);

  const needsSize = (product.sizes?.length ?? 0) > 1 && !size;

  const handleAdd = () => {
    if (needsSize) return;
    addItem({
      productId: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      size,
      color,
      imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      {(product.sizes?.length ?? 0) > 0 && (
        <div>
          <p className="eyebrow mb-2">Size</p>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes!.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-11 rounded-md border px-3 py-2 font-mono text-xs font-medium transition-colors",
                  size === s
                    ? "border-pine bg-pine text-white"
                    : "border-line bg-parchment text-pine-ink/70 hover:border-pine/40",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {(product.colors?.length ?? 0) > 0 && (
        <div>
          <p className="eyebrow mb-2">Color</p>
          <div className="flex flex-wrap gap-1.5">
            {product.colors!.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                  color === c
                    ? "border-pine bg-pine text-white"
                    : "border-line bg-parchment text-pine-ink/70 hover:border-pine/40",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={!product.inStock || needsSize}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-md px-5 py-3.5 text-sm font-semibold text-white transition-colors",
          added ? "bg-pine" : "bg-blaze hover:bg-blaze-deep",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            Added to your pack
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" />
            {!product.inStock
              ? "Out of stock"
              : needsSize
                ? "Pick a size"
                : "Add to pack"}
          </>
        )}
      </button>
    </div>
  );
}
