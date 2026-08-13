"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

import { formatPrice } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";

interface ProductData {
  slug: string;
  title: string;
  image: { asset: { _ref: string } } | null;
  price?: number;
  inStock?: boolean;
}

interface ProductProps {
  id: string;
  isInline?: boolean;
}

async function fetchProductCard(id: string): Promise<ProductData | null> {
  const res = await fetch(`/api/product-card?id=${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { product: ProductData | null };
  return data.product;
}

export function Product(props: ProductProps) {
  const { id, isInline } = props;

  const { data: product, isLoading } = useSWR(`product-${id}`, () =>
    fetchProductCard(id),
  );

  if (isLoading) {
    if (isInline) return null;

    return (
      <div className="flex animate-pulse items-center gap-3 rounded-md border border-line bg-parchment p-2">
        <div className="h-11 w-11 shrink-0 rounded bg-sage" />
        <div className="h-5 w-28 rounded bg-sage" />
      </div>
    );
  }

  if (!product) return null;

  if (isInline) {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="font-medium text-blaze-deep underline hover:text-blaze"
      >
        {product.title}
      </Link>
    );
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center gap-3 rounded-md border border-line bg-parchment p-2 transition-colors hover:border-pine/30 hover:bg-white"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-sage">
        {product.image && (
          <Image
            src={urlFor(product.image).width(88).height(88).url()}
            alt={product.title}
            fill
            sizes="44px"
            className="object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-pine-ink">
          {product.title}
        </p>
        <p className="font-mono text-xs text-moss">
          {typeof product.price === "number" ? formatPrice(product.price) : ""}
          {product.inStock === false ? " · Out of stock" : ""}
        </p>
      </div>
    </Link>
  );
}
