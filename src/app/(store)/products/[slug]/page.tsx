import { Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/add-to-cart";
import { ProductGrid } from "@/components/product-grid";
import { formatPrice } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { getProductBySlug, getRelatedProducts } from "@/sanity/lib/queries";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.title,
    description: product.shortDescription,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = product.category
    ? await getRelatedProducts(product.category.slug, product._id)
    : [];

  const imageUrl = product.image
    ? urlFor(product.image).width(1200).height(1200).url()
    : undefined;
  const cartImageUrl = product.image
    ? urlFor(product.image).width(160).height(160).url()
    : undefined;

  const onSale =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav className="mb-6 font-mono text-xs text-moss">
        <Link href="/products" className="hover:underline">
          All gear
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:underline"
            >
              {product.category.title}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg border border-line bg-sage">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-moss">
              <span className="display text-3xl">Trailhead</span>
            </div>
          )}
          {onSale && (
            <span className="absolute left-4 top-4 rounded-[3px] bg-blaze px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Sale
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">
              {[product.brand?.title, product.category?.title]
                .filter(Boolean)
                .join(" · ") || "Trailhead"}
            </p>
            {product.sku && (
              <p className="font-mono text-xs text-pine-ink/40">
                {product.sku}
              </p>
            )}
          </div>

          <h1 className="display mt-2 text-5xl font-semibold text-pine-ink">
            {product.title}
          </h1>

          {typeof product.rating === "number" && (
            <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-moss">
              <Star className="h-3.5 w-3.5 fill-current" />
              {product.rating.toFixed(1)}
              {typeof product.reviewCount === "number" &&
                ` · ${product.reviewCount} reviews`}
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-3 font-mono">
            <span className="text-2xl font-semibold text-pine-ink">
              {formatPrice(product.price)}
            </span>
            {onSale && (
              <span className="text-base text-pine-ink/40 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-base text-pine-ink/80">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-6">
            <AddToCart product={product} imageUrl={cartImageUrl} />
          </div>

          {product.description && (
            <div className="mt-8 border-t border-line pt-6">
              <p className="eyebrow mb-2">Field notes</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-pine-ink/80">
                {product.description}
              </p>
            </div>
          )}

          {(product.features?.length ?? 0) > 0 && (
            <div className="mt-6">
              <p className="eyebrow mb-2">Spec sheet</p>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {product.features!.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-pine-ink/80"
                  >
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-3 rounded-[1px] bg-blaze"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <p className="eyebrow">Same trail</p>
          <h2 className="display mt-1 text-3xl font-semibold text-pine-ink">
            Related gear
          </h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
