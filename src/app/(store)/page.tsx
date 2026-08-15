import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AskGuideButton } from "@/components/ask-guide-button";
import { ProductGrid } from "@/components/product-grid";
import { TopoLines } from "@/components/topo-lines";
import { getCategories, getFeaturedProducts } from "@/sanity/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-pine-deep text-white">
        <TopoLines className="absolute inset-0 h-full w-full text-white/[0.07]" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
          <p className="eyebrow !text-white/50">
            Bikepacking supply · Powered by Sanity + Clerk
          </p>
          <h1 className="display mt-4 max-w-3xl text-6xl font-bold sm:text-7xl md:text-8xl">
            Bags for the long way round
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/70">
            Frame bags, handlebar rolls, and waterproof seat packs for gravel
            overnights and loaded dirt tours. The Pack Guide knows every bag in
            the catalog — ask it anything.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-md bg-blaze px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blaze-deep"
            >
              Shop bikepacking bags
              <ArrowRight className="h-4 w-4" />
            </Link>
            <AskGuideButton prompt="Waterproof seat pack under $120 for an overnight gravel ride?" />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow">Route-tested</p>
              <h2 className="display mt-1 text-4xl font-semibold text-pine-ink">
                Featured bags
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

      {categories.length > 0 && (
        <section className="border-y border-line bg-parchment/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="eyebrow">Pack your rig</p>
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

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">Meet the Pack Guide</p>
        <h2 className="display mt-1 max-w-2xl text-4xl font-semibold text-pine-ink">
          One question. One query. Real bags.
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-parchment p-5">
            <p className="font-mono text-xs text-blaze">01 · You ask</p>
            <p className="mt-2 text-sm text-pine-ink/80">
              &ldquo;Waterproof seat pack under $120 for an overnight gravel
              ride?&rdquo; Plain English, no filters to click.
            </p>
          </div>
          <div className="rounded-lg border border-line bg-parchment p-5">
            <p className="font-mono text-xs text-blaze">02 · It queries</p>
            <p className="mt-2 text-sm text-pine-ink/80">
              Sanity Context gives the agent our schema, so it writes one GROQ
              query: hard filters for price, capacity, and stock — semantic
              ranking for &ldquo;waterproof overnight.&rdquo;
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
