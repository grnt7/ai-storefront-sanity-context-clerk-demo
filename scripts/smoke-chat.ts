/**
 * Smoke-tests the agent pipeline without the browser:
 * OpenAI model + Sanity Context MCP tools + the demo question.
 *
 * Usage: npx tsx scripts/smoke-chat.ts
 */
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { createOpenAI } = await import("@ai-sdk/openai");
  const { createMCPClient } = await import("@ai-sdk/mcp");
  const { generateText, stepCountIs } = await import("ai");

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const mcpClient = await createMCPClient({
    transport: {
      type: "http",
      url: process.env.SANITY_CONTEXT_MCP_URL!,
      headers: {
        Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
      },
    },
  });

  const tools = await mcpClient.tools();
  console.log("MCP tools:", Object.keys(tools).join(", "));

  const result = await generateText({
    model: openai(process.env.OPENAI_MODEL || "gpt-4o"),
    system:
      "You are the Pack Guide for Frame & Roll, a bikepacking and adventure bags store. Use groq_query to look up real products. Combine hard filters (price, size, inStock) with semantic ranking in a single GROQ query. Answer briefly with product names and prices.",
    prompt: "Waterproof seat pack under $120?",
    tools,
    stopWhen: stepCountIs(8),
  });

  for (const step of result.steps) {
    for (const call of step.toolCalls) {
      console.log(
        `\nTOOL ${call.toolName}:`,
        JSON.stringify("input" in call ? call.input : call).slice(0, 400),
      );
    }
  }

  console.log("\nANSWER:\n" + result.text);

  await mcpClient.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
