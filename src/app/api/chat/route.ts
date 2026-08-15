import { createOpenAI } from "@ai-sdk/openai";
import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sanityInsightsIntegration } from "@sanity/context/ai-sdk";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import {
  clientTools,
  type CartChatContext,
  type DocumentContext,
} from "@/lib/client-tools";
import { serverClient } from "@/sanity/lib/server-client";
import { writeClient } from "@/sanity/lib/write-client";

const DEFAULT_MODEL = "gpt-4o";
const MAX_STEPS = 20;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let cachedInitialContext: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function initialContextUrl(mcpUrl: string): string {
  const url = new URL(mcpUrl);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/initial-context`;
  return url.toString();
}

// Slow on cold start — subsequent calls return the cached result
async function fetchInitialContext(): Promise<string | null> {
  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;
  if (!mcpUrl) return null;

  const isStale = Date.now() - cacheTimestamp > CACHE_TTL_MS;
  const fetchPromise = isStale
    ? fetch(initialContextUrl(mcpUrl), {
        headers: {
          Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
        },
      })
        .then(async (res) => {
          if (res.ok) {
            cachedInitialContext = await res.text();
            cacheTimestamp = Date.now();
          }
        })
        .catch(() => {})
    : null;

  if (!cachedInitialContext) await fetchPromise;

  return cachedInitialContext;
}

const FALLBACK_SYSTEM_PROMPT = `
You are the Pack Guide, the shopping assistant for Frame & Roll, a bikepacking, adventure bags, and urban commuter carry store.

## Your capabilities
- Search bags by mount type, capacity, price, features, or riding style
- Compare products and make honest recommendations for gravel, MTB, touring, and city commuter setups
- Answer questions about availability, capacity, and waterproofing
- Look up the signed-in shopper's own orders when they are signed in

## How to respond
- Always use available tools to look up real content — never guess or make up products
- Combine hard filters (price, capacity in sizes, inStock) with semantic ranking in a single GROQ query when the shopper mixes constraints with vibes
- Be warm, brief, and practical — like a seasoned bikepacker, not a salesperson
- Say "out of stock" ONLY when a product exists and its inStock field is false. If we do not carry an item at all, say we don't carry it — never call it out of stock
- If nothing matches, say so and suggest the closest alternative
- If the shopper asks about their orders but is not signed in, tell them to sign in using the button in the site header — never invent order details
`.trim();

interface RecentOrder {
  orderNumber: string;
  status?: string;
  total?: number;
  placedAt?: string;
  customerName?: string;
  items?: { title?: string; quantity?: number; size?: string; color?: string }[];
}

function formatCart(cart?: CartChatContext): string {
  if (!cart?.items?.length) {
    return "Their cart is currently empty.";
  }
  const lines = cart.items
    .map(
      (i) =>
        `- ${i.quantity} x ${i.title}${i.size ? ` (Size ${i.size})` : ""}${i.color ? ` — ${i.color}` : ""} — $${i.price * i.quantity}`,
    )
    .join("\n");
  return `## In their cart right now\n\n${lines}\nCart subtotal: $${cart.subtotal} (free shipping at $150)\n\nUse this to advise: suggest complementary gear, flag anything already in the cart, and mention the free-shipping threshold when relevant.`;
}

function formatOrders(orders: RecentOrder[], isSignedIn: boolean): string {
  if (!isSignedIn) {
    return `## Order history

The shopper is browsing as a guest — you do not have access to their orders. If they ask about past purchases or delivery status, explain they can sign in with the button in the site header. Do not guess or invent order details.`;
  }
  if (!orders.length) {
    return "They have not placed any orders yet.";
  }
  const lines = orders
    .map((o) => {
      const date = o.placedAt
        ? new Date(o.placedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "unknown date";
      const items = (o.items ?? [])
        .map(
          (i) =>
            `${i.quantity ?? 1} x ${i.title ?? "item"}${i.size ? ` (Size ${i.size})` : ""}`,
        )
        .join(", ");
      return `- ${o.orderNumber} — ${o.status ?? "processing"} — placed ${date} — ${items}${typeof o.total === "number" ? ` — total $${o.total}` : ""}`;
    })
    .join("\n");
  return `## Their recent orders (newest first, with shipping status)\n\n${lines}\n\nAnswer order and delivery questions directly from this. Use the get_my_orders tool only if they ask about older orders or need more detail.`;
}

interface BuildSystemPromptParams {
  basePrompt: string;
  documentContext?: DocumentContext;
  initialContext?: string | null;
  userName?: string | null;
  isSignedIn: boolean;
  cart?: CartChatContext;
  recentOrders: RecentOrder[];
}

function buildSystemPrompt(props: BuildSystemPromptParams): string {
  const {
    basePrompt,
    documentContext,
    initialContext,
    userName,
    isSignedIn,
    cart,
    recentOrders,
  } = props;

  const shopperLabel = isSignedIn
    ? userName || "a signed-in shopper"
    : "a guest shopper (not signed in)";

  return `
${basePrompt}
${initialContext ? `\n# Data reference\n\nUse this to understand what's available and write better queries.\n\n${initialContext}\n` : ""}
# The shopper

You are talking to ${shopperLabel}.

${formatCart(cart)}

${formatOrders(recentOrders, isSignedIn)}

# Current page

<page-context>
  <title>${documentContext?.title ?? ""}</title>
  <description>${documentContext?.description ?? ""}</description>
  <pathname>${documentContext?.pathname ?? ""}</pathname>
</page-context>

For more detail about what's visible on the page, use the get_page_context tool.
To change what the shopper sees on /products, use the set_product_filters tool.

# Displaying products

To display products as rich cards, query Sanity to get the _id and _type, then use this directive syntax:

- Block: ::document{id="<_id>" type="<_type>"}
- Inline: :document{id="<_id>" type="<_type>"}

Always use directives for product names so the UI can render them as cards.
`;
}

interface ChatRequest {
  messages: UIMessage[];
  documentContext?: DocumentContext;
  cart?: CartChatContext;
  id: string;
}

export async function POST(req: Request) {
  const { messages, documentContext, cart, id: chatId }: ChatRequest =
    await req.json();

  if (!process.env.SANITY_CONTEXT_MCP_URL) {
    return Response.json(
      { error: "SANITY_CONTEXT_MCP_URL is not set" },
      { status: 500 },
    );
  }
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: "OPENAI_API_KEY is not set" },
      { status: 500 },
    );
  }
  if (!process.env.SANITY_API_READ_TOKEN) {
    return Response.json(
      { error: "SANITY_API_READ_TOKEN is not set" },
      { status: 500 },
    );
  }

  const { userId } = await auth();

  let mcpClient: MCPClient | null = null;

  try {
    const ordersPromise = userId
      ? serverClient.withConfig({ useCdn: false }).fetch<RecentOrder[]>(
          `*[_type == "order" && clerkUserId == $userId] | order(placedAt desc) [0...5] {
            orderNumber, status, total, placedAt, customerName,
            items[]{ title, quantity, size, color }
          }`,
          { userId },
        )
      : Promise.resolve([] as RecentOrder[]);

    const [mcpClientResult, agentConfig, initialContext, user, recentOrders] =
      await Promise.all([
        createMCPClient({
          transport: {
            type: "http",
            url: process.env.SANITY_CONTEXT_MCP_URL,
            headers: {
              Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
            },
          },
        }),
        serverClient.fetch<{ systemPrompt: string | null } | null>(
          `*[_type == "agent.config" && slug.current == $slug][0] { systemPrompt }`,
          { slug: process.env.AGENT_CONFIG_SLUG || "pack-guide" },
        ),
        fetchInitialContext(),
        userId ? currentUser().catch(() => null) : Promise.resolve(null),
        ordersPromise,
      ]);

    mcpClient = mcpClientResult;

    // currentUser() can return null (rate limits, transient errors) even for
    // a valid session — fall back to the name snapshotted on their orders
    const shopperName =
      user?.firstName ||
      user?.fullName ||
      user?.username ||
      user?.primaryEmailAddress?.emailAddress ||
      recentOrders?.find((o) => o.customerName)?.customerName ||
      null;

    const systemPrompt = buildSystemPrompt({
      basePrompt: agentConfig?.systemPrompt || FALLBACK_SYSTEM_PROMPT,
      documentContext,
      initialContext,
      userName: shopperName,
      isSignedIn: !!userId,
      cart,
      recentOrders: recentOrders ?? [],
    });

    const allMcpTools = await mcpClient.tools();

    // Exclude initial_context tool — its data is already in the system prompt
    const mcpTools = Object.fromEntries(
      Object.entries(allMcpTools).filter(([name]) => name !== "initial_context"),
    );

    // Order lookup is only available for signed-in shoppers
    const getMyOrders = userId
      ? tool({
          description:
            "Get the signed-in shopper's own orders: order numbers, status, totals, dates, and purchased items (with product _id, title, price, quantity, size, color). Use for any question about their purchases.",
          inputSchema: z.object({}),
          execute: async () => {
            const orders = await serverClient.withConfig({ useCdn: false }).fetch(
              `*[_type == "order" && clerkUserId == $userId] | order(placedAt desc) [0...10] {
            orderNumber,
            status,
            total,
            placedAt,
            items[]{
              title,
              price,
              quantity,
              size,
              color,
              "productId": product->_id,
              "productType": product->_type
            }
          }`,
              { userId },
            );
            return { orders };
          },
        })
      : null;

    const modelId = process.env.OPENAI_MODEL || DEFAULT_MODEL;

    const hasWriteToken = !!process.env.SANITY_API_WRITE_TOKEN;

    const result = streamText({
      model: openai(modelId),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: {
        ...mcpTools,
        ...clientTools,
        ...(getMyOrders ? { get_my_orders: getMyOrders } : {}),
      },
      stopWhen: stepCountIs(MAX_STEPS),
      // Conversation Insights: saves transcripts to Sanity for the
      // classification dashboard in Studio. Requires a write token.
      ...(hasWriteToken
        ? {
            experimental_telemetry: {
              isEnabled: true,
              integrations: [
                sanityInsightsIntegration({
                  client: writeClient,
                  agentId: "pack-guide",
                  threadId: chatId,
                }),
              ],
            },
          }
        : {}),
      onFinish: async () => {
        await mcpClient?.close();
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    await mcpClient?.close();
    console.error("[api/chat]", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 },
    );
  }
}
