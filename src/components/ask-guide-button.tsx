"use client";

import { Compass } from "lucide-react";

import { cn } from "@/lib/utils";

export const OPEN_CHAT_EVENT = "trailhead:open-chat";

export function AskGuideButton({
  className,
  prompt,
  children,
}: {
  className?: string;
  prompt?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent(OPEN_CHAT_EVENT, { detail: { prompt } }),
        )
      }
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10",
        className,
      )}
    >
      <Compass className="h-4 w-4" />
      {children ?? "Ask the Trail Guide"}
    </button>
  );
}
