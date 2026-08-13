"use client";

import { useUser } from "@clerk/nextjs";
import { CreditCard, Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/utils";

import { placeOrder } from "./actions";

const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING = 12;

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;

  const handlePlaceOrder = () => {
    setError(null);
    startTransition(async () => {
      const result = await placeOrder(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      );

      if (result.ok && result.orderNumber) {
        clear();
        router.push(`/orders?placed=${result.orderNumber}`);
      } else {
        setError(result.error ?? "Something went wrong. Try again.");
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="display text-5xl font-semibold text-pine-ink">
          Nothing to check out
        </h1>
        <p className="mt-3 text-sm text-pine-ink/60">
          Your pack is empty. Load it up first.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-md bg-pine px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-pine-ink"
        >
          Shop all gear
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Almost there</p>
      <h1 className="display mt-1 text-5xl font-semibold text-pine-ink">
        Checkout
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Left: shipping + payment */}
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-pine-ink">
              Shipping to
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                defaultValue={user?.fullName ?? ""}
                placeholder="Full name"
                className="rounded-md border border-line bg-parchment px-3 py-2.5 text-sm"
              />
              <input
                defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
                placeholder="Email"
                className="rounded-md border border-line bg-parchment px-3 py-2.5 text-sm"
              />
              <input
                placeholder="Street address"
                defaultValue="1 Switchback Road"
                className="rounded-md border border-line bg-parchment px-3 py-2.5 text-sm sm:col-span-2"
              />
              <input
                placeholder="City"
                defaultValue="Boulder"
                className="rounded-md border border-line bg-parchment px-3 py-2.5 text-sm"
              />
              <input
                placeholder="ZIP"
                defaultValue="80302"
                className="rounded-md border border-line bg-parchment px-3 py-2.5 text-sm"
              />
            </div>
          </section>

          <section>
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-pine-ink">
              <CreditCard className="h-4 w-4" />
              Payment
            </h2>
            <p className="mb-3 font-mono text-xs text-blaze">
              Demo mode — no real charge is made
            </p>
            <div className="grid gap-3 rounded-lg border border-line bg-parchment p-4 sm:grid-cols-[1fr_120px_100px]">
              <input
                readOnly
                value="4242 4242 4242 4242"
                aria-label="Card number (demo)"
                className="rounded-md border border-line bg-sage/60 px-3 py-2.5 font-mono text-sm text-pine-ink/70"
              />
              <input
                readOnly
                value="04 / 26"
                aria-label="Expiry (demo)"
                className="rounded-md border border-line bg-sage/60 px-3 py-2.5 font-mono text-sm text-pine-ink/70"
              />
              <input
                readOnly
                value="424"
                aria-label="CVC (demo)"
                className="rounded-md border border-line bg-sage/60 px-3 py-2.5 font-mono text-sm text-pine-ink/70"
              />
            </div>
          </section>

          {error && (
            <p className="rounded-md border border-blaze/30 bg-blaze/10 px-4 py-3 text-sm text-blaze-deep">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isPending}
            className="flex items-center justify-center gap-2 rounded-md bg-blaze px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blaze-deep disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing order…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Place order · {formatPrice(total)}
              </>
            )}
          </button>
        </div>

        {/* Right: summary */}
        <aside className="h-fit rounded-lg border border-line bg-parchment p-5">
          <h2 className="text-sm font-semibold text-pine-ink">Order summary</h2>
          <ul className="mt-4 divide-y divide-line">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex items-center gap-3 py-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-sage">
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-pine-ink">{item.title}</p>
                  <p className="font-mono text-xs text-moss">
                    {[
                      `Qty ${item.quantity}`,
                      item.size && `Size ${item.size}`,
                      item.color,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="font-mono text-sm text-pine-ink">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-pine-ink/60">Subtotal</dt>
              <dd className="font-mono">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-pine-ink/60">Shipping</dt>
              <dd className="font-mono">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="font-mono">{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
