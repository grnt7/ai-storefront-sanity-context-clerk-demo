"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-context";

function BlazeMark() {
  // A trail "reassurance marker": two stacked blazes
  return (
    <span aria-hidden="true" className="flex flex-col gap-0.5">
      <span className="h-2.5 w-4 rounded-[2px] bg-blaze" />
      <span className="h-2.5 w-4 rounded-[2px] bg-pine" />
    </span>
  );
}

export function Header() {
  const { count, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-sage/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BlazeMark />
          <span className="display text-2xl font-bold tracking-wide text-pine-ink">
            Frame & Roll
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-pine-ink/80 sm:flex">
          <Link href="/products" className="transition-colors hover:text-pine-ink">
            Shop all
          </Link>
          <Link
            href="/products?category=frame-bags"
            className="transition-colors hover:text-pine-ink"
          >
            Frame bags
          </Link>
          <Link
            href="/products?category=seat-packs"
            className="transition-colors hover:text-pine-ink"
          >
            Seat packs
          </Link>
          <Link
            href="/products?category=urban-backpacks"
            className="transition-colors hover:text-pine-ink"
          >
            Urban
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <Link
              href="/orders"
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-pine-ink/80 transition-colors hover:text-pine-ink"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </Link>
          </Show>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative rounded-md p-2 text-pine-ink transition-colors hover:bg-pine/10"
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blaze px-1 font-mono text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm font-semibold text-pine-ink transition-colors hover:bg-pine/10"
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pine-ink"
              >
                Sign up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
