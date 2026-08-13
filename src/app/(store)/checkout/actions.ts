"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import { serverClient } from "@/sanity/lib/server-client";
import { writeClient } from "@/sanity/lib/write-client";

export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderNumber?: string;
  error?: string;
}

const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING = 12;

function generateOrderNumber(): string {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TH-${code}`;
}

/**
 * Dummy checkout: no real payment is taken. Prices are re-read from Sanity
 * server-side so the client can never set its own totals.
 */
export async function placeOrder(
  items: CheckoutItemInput[],
): Promise<PlaceOrderResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You must be signed in to check out." };
  }

  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return {
      ok: false,
      error:
        "SANITY_API_WRITE_TOKEN is not configured. Add an Editor token to .env.local to place orders.",
    };
  }

  if (!items.length) {
    return { ok: false, error: "Your pack is empty." };
  }

  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await serverClient
    .withConfig({ useCdn: false })
    .fetch<
      { _id: string; title: string; price: number; inStock: boolean }[]
    >(`*[_type == "product" && _id in $ids]{_id, title, price, inStock}`, {
      ids,
    });

  const byId = new Map(products.map((p) => [p._id, p]));

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      return { ok: false, error: "One of the items no longer exists." };
    }
    if (!product.inStock) {
      return { ok: false, error: `${product.title} is out of stock.` };
    }
    const quantity = Math.max(1, Math.min(99, Math.round(item.quantity)));
    subtotal += product.price * quantity;
    orderItems.push({
      _key: `${item.productId}-${item.size ?? ""}-${item.color ?? ""}`,
      _type: "orderItem",
      product: { _type: "reference", _ref: item.productId },
      title: product.title,
      price: product.price,
      quantity,
      size: item.size,
      color: item.color,
    });
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;

  const user = await currentUser();
  const orderNumber = generateOrderNumber();

  try {
    await writeClient.create({
      _type: "order",
      orderNumber,
      clerkUserId: userId,
      customerName: user?.fullName ?? undefined,
      email: user?.primaryEmailAddress?.emailAddress ?? undefined,
      items: orderItems,
      subtotal,
      shipping,
      total,
      status: "processing",
      paymentMethod: "demo-card",
      placedAt: new Date().toISOString(),
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Could not save the order: ${error.message}`
          : "Could not save the order.",
    };
  }

  return { ok: true, orderNumber };
}
