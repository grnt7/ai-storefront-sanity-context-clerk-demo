import Link from "next/link";

import { TopoLines } from "@/components/topo-lines";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-pine-deep text-white/70">
      <TopoLines className="absolute inset-0 h-full w-full text-white/[0.06]" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-3xl font-bold text-white">Frame & Roll</p>
          <p className="mt-2 max-w-sm text-sm">
            Bags for the long way round. Every product in this store lives in
            Sanity — and the Pack Guide can find all of it.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm md:items-end">
          <Link href="/products" className="transition-colors hover:text-white">
            Shop all bags
          </Link>
          <Link href="/orders" className="transition-colors hover:text-white">
            Your orders
          </Link>
          <Link href="/studio" className="transition-colors hover:text-white">
            Sanity Studio
          </Link>
          <p className="eyebrow mt-4 !text-white/40">
            Demo store · Payments are simulated
          </p>
        </div>
      </div>
    </footer>
  );
}
