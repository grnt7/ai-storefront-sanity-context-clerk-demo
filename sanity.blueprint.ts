import {
  defineBlueprint,
  defineRobotToken,
  defineScheduledFunction,
} from "@sanity/blueprints";
import { config } from "dotenv";

config({ path: ".env.local" });

/**
 * Conversation Insights: classifies Trail Guide conversations every
 * 10 minutes (success, sentiment, content gaps). Results appear in the
 * Insights dashboard inside Sanity Studio.
 *
 * Deploy with: npm run deploy:blueprints
 */
export default defineBlueprint({
  resources: [
    defineScheduledFunction({
      name: "classify-conversations",
      timeout: 600,
      robotToken: "$.resources.classify-conversations-robot.token",
      env: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
        SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
        SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
      },
      event: {
        // Hourly — sub-hourly schedules need a higher Sanity plan
        expression: "0 * * * *",
      },
    }),
    defineRobotToken({
      name: "classify-conversations-robot",
      label: "Classify Conversations Robot",
      memberships: [
        {
          resourceType: "project",
          resourceId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
          roleNames: ["editor"],
        },
      ],
    }),
  ],
});
