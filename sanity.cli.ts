import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  studioHost: "frame-and-roll",
  deployment: {
    appId: "vkjndj1pwnv71mk7wg6zqtx8",
  },
});
