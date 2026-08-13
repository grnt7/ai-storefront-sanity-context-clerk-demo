import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@sanity/client";
import { classifyConversations } from "@sanity/context/insights";
import { scheduledEventHandler } from "@sanity/functions";
//#region functions/classify-conversations/index.ts
var handler = scheduledEventHandler(async ({ context }) => {
	if (!context.clientOptions?.token) {
		console.error("[classify-conversations] No client token available");
		return;
	}
	const client = createClient({
		projectId: process.env.SANITY_PROJECT_ID,
		dataset: process.env.SANITY_DATASET,
		apiVersion: "2026-01-01",
		token: context.clientOptions.token,
		useCdn: false
	});
	const result = await classifyConversations({
		client,
		model: anthropic("claude-haiku-4-5"),
		telemetry: { shareMetrics: true }
	});
	console.log(`Classified ${result.successCount}/${result.totalFound} conversations${result.errorCount > 0 ? ` (${result.errorCount} failed)` : ""}`);
});
//#endregion
export { handler };

//# sourceMappingURL=index.js.map