import { auth } from "@clerk/nextjs/server";
import { CheckCircle2, Package } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import { getOrdersByUser } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Your orders",
};

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-moss/15 text-moss",
  shipped: "bg-blaze/15 text-blaze-deep",
  delivered: "bg-pine/15 text-pine",
  cancelled: "bg-pine-ink/10 text-pine-ink/50",
};

export default async function OrdersPage({
  searchParams,
}: PageProps<"/orders">) {
  const { userId } = await auth();
  if (!userId) return null; // middleware redirects before this

  const params = await searchParams;
  const placed = Array.isArray(params.placed)
    ? params.placed[0]
    : params.placed;

  const orders = await getOrdersByUser(userId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {placed && (
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-pine/20 bg-pine/5 px-5 py-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-pine" />
          <div>
            <p className="text-sm font-semibold text-pine-ink">
              Order {placed} placed — see you on the route.
            </p>
            <p className="text-xs text-pine-ink/60">
              This was a simulated payment. Try asking the Pack Guide:
              &ldquo;What did I just order?&rdquo;
            </p>
          </div>
        </div>
      )}

      <p className="eyebrow">Your history</p>
      <h1 className="display mt-1 text-5xl font-semibold text-pine-ink">
        Orders
      </h1>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-parchment/60 px-6 py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-moss" />
          <p className="mt-3 text-sm text-pine-ink/60">
            No orders yet. Your first summit awaits.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-md bg-pine px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pine-ink"
          >
            Shop all gear
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li
              key={order._id}
              className="rounded-lg border border-line bg-parchment p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-pine-ink">
                    {order.orderNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider ${
                      STATUS_STYLES[order.status] ?? STATUS_STYLES.processing
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {order.placedAt && (
                    <span className="font-mono text-xs text-pine-ink/50">
                      {new Date(order.placedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  <span className="font-mono text-sm font-semibold text-pine-ink">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              <ul className="mt-3 space-y-2">
                {order.items?.map((item) => (
                  <li key={item._key} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-sage">
                      {item.productImage && (
                        <Image
                          src={urlFor(item.productImage)
                            .width(80)
                            .height(80)
                            .url()}
                          alt={item.title ?? "Product"}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      {item.productSlug ? (
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-medium text-pine-ink hover:underline"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-pine-ink">
                          {item.title}
                        </span>
                      )}
                      <p className="font-mono text-xs text-moss">
                        {[
                          `Qty ${item.quantity ?? 1}`,
                          item.size && `Size ${item.size}`,
                          item.color,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {typeof item.price === "number" && (
                      <span className="font-mono text-xs text-pine-ink/70">
                        {formatPrice(item.price * (item.quantity ?? 1))}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
