import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@sanity/client";
import { classifyConversations } from "@sanity/context/insights";
import { scheduledEventHandler } from "@sanity/functions";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = scheduledEventHandler(async ({ context }) => {
  if (!context.clientOptions?.token) {
    console.error("[classify-conversations] No client token available");
    return;
  }

  // SANITY_PROJECT_ID and SANITY_DATASET are injected by the blueprint's env block.
  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: "2026-01-01",
    token: context.clientOptions.token,
    useCdn: false,
  });

  const result = await classifyConversations({
    client,
    model: openai("gpt-4o-mini"),
    telemetry: {
      shareMetrics: true,
    },
  });

  console.log(
    `Classified ${result.successCount}/${result.totalFound} conversations${result.errorCount > 0 ? ` (${result.errorCount} failed)` : ""}`,
  );
});
