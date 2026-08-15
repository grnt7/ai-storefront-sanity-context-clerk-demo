import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { urlFor } from "@/sanity/lib/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const onSale =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-parchment transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-sage">
        {product.image ? (
          <Image
            src={urlFor(product.image).width(640).height(640).url()}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-moss">
            <span className="display text-xl">Frame & Roll</span>
          </div>
        )}

        {onSale && (
          <span className="absolute left-3 top-3 rounded-[3px] bg-blaze px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
            Sale
          </span>
        )}
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-[3px] bg-pine-deep px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category && (
          <p className="eyebrow">{product.category.title}</p>
        )}
        <h3 className="text-sm font-semibold leading-snug text-pine-ink">
          {product.title}
        </h3>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex items-baseline gap-2 font-mono text-sm">
            <span className="font-semibold text-pine-ink">
              {formatPrice(product.price)}
            </span>
            {onSale && (
              <span className="text-xs text-pine-ink/40 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {typeof product.rating === "number" && (
            <span className="flex items-center gap-1 font-mono text-xs text-moss">
              <Star className="h-3 w-3 fill-current" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
