import { TriangleAlert } from "lucide-react";

import { isSanityConfigured } from "@/sanity/env";

/**
 * Shown until .env.local has a real Sanity project ID.
 */
export function SetupBanner() {
  if (isSanityConfigured) return null;

  return (
    <div className="border-b border-blaze/30 bg-blaze/10 px-4 py-2.5 text-center text-xs text-blaze-deep">
      <TriangleAlert className="mr-1.5 inline h-3.5 w-3.5" />
      Setup needed: add your Sanity project ID and tokens to{" "}
      <code className="font-mono font-semibold">.env.local</code>, then run{" "}
      <code className="font-mono font-semibold">npm run seed</code> — see the
      README.
    </div>
  );
}
