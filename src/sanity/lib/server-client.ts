import "server-only";

import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Server-only read client. New Sanity projects require a token for API
 * reads even on public datasets, so all storefront queries run server-side
 * with the Viewer token — it is never shipped to the browser.
 */
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN,
});
