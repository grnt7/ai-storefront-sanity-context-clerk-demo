import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  studioHost: "trailhead-p6kwp4us",
  deployment: {
    appId: "eh6941up1v74oczbzhpke3hi",
  },
});
