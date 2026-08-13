"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, subtotal, isOpen, setIsOpen, updateQuantity, removeItem } =
    useCart();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close cart"
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-pine-deep/40 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-parchment shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="display text-2xl font-semibold text-pine-ink">
            Your pack
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1.5 text-pine-ink/60 transition-colors hover:bg-pine/10 hover:text-pine-ink"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-8 w-8 text-moss" />
            <p className="text-sm text-pine-ink/70">
              Your pack is empty. Add some gear — or ask the Trail Guide what to
              bring.
            </p>
            <Link
              href="/products"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-pine-ink"
            >
              Shop all gear
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4 py-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-sage">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-semibold text-pine-ink hover:underline"
                      >
                        {item.title}
                      </Link>
                      <span className="font-mono text-sm text-pine-ink">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    {(item.size || item.color) && (
                      <p className="mt-0.5 font-mono text-xs text-moss">
                        {[
                          item.size && `Size ${item.size}`,
                          item.color,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-md border border-line">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="p-1.5 text-pine-ink/70 hover:text-pine-ink"
                          aria-label={`Decrease quantity of ${item.title}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="p-1.5 text-pine-ink/70 hover:text-pine-ink"
                          aria-label={`Increase quantity of ${item.title}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        className="p-1.5 text-pine-ink/40 transition-colors hover:text-blaze"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-pine-ink/70">Subtotal</span>
                <span className="font-mono text-base font-semibold text-pine-ink">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-pine-ink/50">
                Shipping calculated at checkout. Payments are simulated in this
                demo.
              </p>
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="mt-3 block w-full rounded-md bg-blaze px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blaze-deep"
              >
                Check out
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
