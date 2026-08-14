import type { ToolSet } from "ai";
import { z } from "zod";

/**
 * Lightweight page context sent with every chat request.
 */
export interface DocumentContext {
  title: string;
  description?: string;
  pathname: string;
}

/**
 * Snapshot of the shopper's cart sent with every chat request,
 * so the agent knows what's in the pack without a tool call.
 */
export interface CartChatContext {
  items: {
    title: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }[];
  subtotal: number;
}

/**
 * Filters the agent can apply to the /products listing page.
 * Values must come from real documents (use groq_query first).
 */
export const productFiltersSchema = z.object({
  category: z
    .string()
    .optional()
    .describe("Category slug.current from category documents"),
  size: z
    .string()
    .optional()
    .describe('A size string exactly as stored on products, e.g. "10"'),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z
    .enum(["price-asc", "price-desc", "rating", "newest", "title-asc"])
    .optional(),
  q: z.string().optional().describe("Free-text keyword to match in titles"),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;

export const CLIENT_TOOL_NAMES = {
  PAGE_CONTEXT: "get_page_context",
  SET_FILTERS: "set_product_filters",
} as const;

/**
 * Client-side tools: defined without `execute` on the server,
 * handled in the browser via useChat's onToolCall.
 */
export const clientTools = {
  [CLIENT_TOOL_NAMES.PAGE_CONTEXT]: {
    description:
      "Get the current page content as text. Use when you need to know what the shopper is looking at right now.",
    inputSchema: z.object({}),
  },
  [CLIENT_TOOL_NAMES.SET_FILTERS]: {
    description:
      "Update the /products listing filters in the shopper's browser and navigate there. First use groq_query to confirm valid values (category slugs, sizes) and that matching products exist.",
    inputSchema: productFiltersSchema,
  },
} satisfies ToolSet;
