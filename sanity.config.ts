"use client";

import {
  CONTEXT_SCHEMA_TYPE_NAME,
  contextPlugin,
  CONVERSATION_SCHEMA_TYPE_NAME,
} from "@sanity/context/studio";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId, studioTitle } from "@/sanity/env";
import { schemaTypes } from "@/sanity/schemaTypes";

// Document types grouped under "AI Agent" in the sidebar
const agentTypes = [
  "agent.config",
  CONTEXT_SCHEMA_TYPE_NAME,
  CONVERSATION_SCHEMA_TYPE_NAME,
];

export default defineConfig({
  name: "default",
  title: studioTitle,
  basePath: "/studio",

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure: (S) => {
        const defaultListItems = S.documentTypeListItems().filter(
          (item) => !agentTypes.includes(item.getId() ?? ""),
        );

        return S.list()
          .title("Content")
          .items([
            ...defaultListItems,
            S.divider(),
            S.listItem()
              .title("AI Agent")
              .child(
                S.list()
                  .title("AI Agent")
                  .items([
                    S.documentTypeListItem("agent.config").title(
                      "Agent Configs",
                    ),
                    S.documentTypeListItem(CONTEXT_SCHEMA_TYPE_NAME).title(
                      "Sanity Contexts",
                    ),
                    S.documentTypeListItem(CONVERSATION_SCHEMA_TYPE_NAME).title(
                      "Conversations",
                    ),
                  ]),
              ),
          ]);
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
    contextPlugin(),
  ],

  schema: {
    types: schemaTypes,
  },
});
