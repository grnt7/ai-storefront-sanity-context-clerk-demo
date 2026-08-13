import { serverClient } from "@/sanity/lib/server-client";

/**
 * Public catalog lookup for chat product cards. The browser cannot query
 * Sanity directly (API reads require a token), so this proxies the small
 * card projection server-side.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const product = await serverClient.fetch(
      `*[_type == "product" && _id == $id][0] {
        title,
        "slug": slug.current,
        image,
        price,
        inStock
      }`,
      { id },
    );
    return Response.json(
      { product },
      { headers: { "Cache-Control": "public, max-age=60" } },
    );
  } catch (error) {
    console.error("[api/product-card]", error);
    return Response.json({ product: null }, { status: 200 });
  }
}
