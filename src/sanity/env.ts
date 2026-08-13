export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-03";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/**
 * Falls back to a well-formed placeholder so the app builds and boots
 * before .env.local is filled in. Queries return empty results until then.
 */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";

export const isSanityConfigured = projectId !== "placeholder";

export const studioTitle = "Trailhead";
