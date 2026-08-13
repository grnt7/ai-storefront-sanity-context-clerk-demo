import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AskGuideButton } from "@/components/ask-guide-button";
import { ProductGrid } from "@/components/product-grid";
import { TopoLines } from "@/components/topo-lines";
import { getCategories, getFeaturedProducts } from "@/sanity/lib/queries";

// Rebuild the static home page at most once a minute so new content shows up
export const revalidate = 60;

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-pine-deep text-white">
        <TopoLines className="absolute inset-0 h-full w-full text-white/[0.07]" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
          <p className="eyebrow !text-white/50">
            Outdoor supply · Powered by Sanity + Clerk
          </p>
          <h1 className="display mt-4 max-w-3xl text-6xl font-bold sm:text-7xl md:text-8xl">
            Gear for the long way round
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/70">
            Boots that break in easy, packs that carry heavy, shelters that
            shrug off weather. And a Trail Guide that knows every product in
            the store — ask it anything.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-md bg-blaze px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blaze-deep"
            >
              Shop the trail
              <ArrowRight className="h-4 w-4" />
            </Link>
            <AskGuideButton prompt="Comfy hiking boots under $200, size 10?" />
          </div>
        </div>
      </section>

      {/* Featured gear */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow">Trail-tested</p>
              <h2 className="display mt-1 text-4xl font-semibold text-pine-ink">
                Featured gear
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-medium text-pine-ink/70 transition-colors hover:text-pine-ink sm:flex"
            >
              Shop all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-y border-line bg-parchment/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="eyebrow">Find your route</p>
            <h2 className="display mt-1 text-4xl font-semibold text-pine-ink">
              Shop by category
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category.slug}`}
                  className="group rounded-lg border border-line bg-parchment p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="display text-2xl font-semibold text-pine-ink">
                      {category.title}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-moss transition-transform group-hover:translate-x-1" />
                  </div>
                  {typeof category.productCount === "number" && (
                    <p className="mt-1 font-mono text-xs text-moss">
                      {category.productCount} item
                      {category.productCount === 1 ? "" : "s"}
                    </p>
                  )}
                  {category.description && (
                    <p className="mt-2 text-sm text-pine-ink/60">
                      {category.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trail Guide explainer */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Meet the Trail Guide</p>
        <h2 className="display mt-1 max-w-2xl text-4xl font-semibold text-pine-ink">
          One question. One query. Real products.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-parchment p-5">
            <p className="font-mono text-xs text-blaze">01 · You ask</p>
            <p className="mt-2 text-sm text-pine-ink/80">
              &ldquo;Comfy hiking boots under $200, size 10?&rdquo; Plain
              English, no filters to click.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-parchment p-5">
            <p className="font-mono text-xs text-blaze">02 · It queries</p>
            <p className="mt-2 text-sm text-pine-ink/80">
              Sanity Context gives the agent our schema, so it writes one GROQ
              query: hard filters for price, size, and stock — semantic ranking
              for &ldquo;comfy&rdquo;.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-parchment p-5">
            <p className="font-mono text-xs text-blaze">03 · You shop</p>
            <p className="mt-2 text-sm text-pine-ink/80">
              Real products from the live dataset, filtered by our rules and
              ranked by relevance. Signed in? It knows your orders too.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
