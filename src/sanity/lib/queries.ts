import { serverClient } from "@/sanity/lib/server-client";
import type { Category, Order, Product } from "@/lib/types";

/**
 * Fetch that degrades to a fallback instead of crashing the page —
 * keeps the storefront rendering before Sanity credentials are configured.
 */
async function safeFetch<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn("[sanity] query failed:", error);
    return fallback;
  }
}

const PRODUCT_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  sku,
  shortDescription,
  description,
  price,
  compareAtPrice,
  sizes,
  colors,
  inStock,
  featured,
  rating,
  reviewCount,
  features,
  tags,
  image,
  "category": category->{title, "slug": slug.current},
  "brand": brand->{title, "slug": slug.current}
}`;

export interface ProductFilters {
  category?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  q?: string;
}

const SORT_ORDERS: Record<string, string> = {
  "price-asc": "price asc",
  "price-desc": "price desc",
  rating: "rating desc",
  newest: "_createdAt desc",
  "title-asc": "title asc",
};

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const conditions = [`_type == "product"`, `defined(slug.current)`];
  const params: Record<string, unknown> = {};

  if (filters.category) {
    conditions.push(`category->slug.current == $category`);
    params.category = filters.category;
  }
  if (filters.size) {
    conditions.push(`$size in sizes`);
    params.size = filters.size;
  }
  if (typeof filters.minPrice === "number") {
    conditions.push(`price >= $minPrice`);
    params.minPrice = filters.minPrice;
  }
  if (typeof filters.maxPrice === "number") {
    conditions.push(`price <= $maxPrice`);
    params.maxPrice = filters.maxPrice;
  }
  if (filters.q) {
    conditions.push(
      `(title match $q + "*" || shortDescription match $q + "*" || $q in tags)`,
    );
    params.q = filters.q;
  }

  const order = SORT_ORDERS[filters.sort ?? ""] ?? "title asc";
  const query = `*[${conditions.join(" && ")}] | order(${order}) ${PRODUCT_PROJECTION}`;

  return safeFetch<Product[]>([], () => serverClient.fetch(query, params));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return safeFetch<Product | null>(null, () =>
    serverClient.fetch(
      `*[_type == "product" && slug.current == $slug][0] ${PRODUCT_PROJECTION}`,
      { slug },
    ),
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return safeFetch<Product[]>([], () =>
    serverClient.fetch(
      `*[_type == "product" && featured == true && defined(slug.current)] | order(title asc) [0...4] ${PRODUCT_PROJECTION}`,
    ),
  );
}

export async function getRelatedProducts(
  categorySlug: string,
  excludeId: string,
): Promise<Product[]> {
  return safeFetch<Product[]>([], () =>
    serverClient.fetch(
      `*[_type == "product" && category->slug.current == $categorySlug && _id != $excludeId][0...3] ${PRODUCT_PROJECTION}`,
      { categorySlug, excludeId },
    ),
  );
}

export async function getCategories(): Promise<Category[]> {
  return safeFetch<Category[]>([], () =>
    serverClient.fetch(
      `*[_type == "category" && defined(slug.current)] | order(title asc) {
        _id,
        title,
        "slug": slug.current,
        description,
        "productCount": count(*[_type == "product" && references(^._id)])
      }`,
    ),
  );
}

const ORDER_PROJECTION = `{
  _id,
  orderNumber,
  status,
  total,
  subtotal,
  shipping,
  placedAt,
  items[]{
    _key,
    title,
    price,
    quantity,
    size,
    color,
    "productSlug": product->slug.current,
    "productImage": product->image
  }
}`;

export async function getOrdersByUser(clerkUserId: string): Promise<Order[]> {
  // Orders must always be fresh — bypass the CDN cache
  return safeFetch<Order[]>([], () =>
    serverClient.withConfig({ useCdn: false }).fetch(
      `*[_type == "order" && clerkUserId == $clerkUserId] | order(placedAt desc) ${ORDER_PROJECTION}`,
      { clerkUserId },
    ),
  );
}
