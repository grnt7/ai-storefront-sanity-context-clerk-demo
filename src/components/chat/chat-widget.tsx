"use client";

import { Compass } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { OPEN_CHAT_EVENT } from "@/components/ask-guide-button";
import { AGENT_CHAT_HIDDEN_ATTRIBUTE } from "@/lib/capture-context";

// The chat panel (markdown renderer, directives) only loads when opened
const Chat = dynamic(() => import("./chat").then((m) => m.Chat), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-line bg-parchment shadow-2xl">
      <Compass className="h-6 w-6 animate-pulse text-moss" />
    </div>
  ),
});

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      if (detail?.prompt) setInitialPrompt(detail.prompt);
      setIsOpen(true);
    };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, []);

  return (
    <div {...{ [AGENT_CHAT_HIDDEN_ATTRIBUTE]: "true" }}>
      {/* Floating launcher */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-pine-deep py-3 pl-4 pr-5 text-sm font-semibold text-white shadow-xl transition-transform hover:scale-[1.03]"
          aria-label="Open the Pack Guide chat"
        >
          <Compass className="h-5 w-5 text-blaze" />
          Pack Guide
        </button>
      )}

      {/* Panel — open to guests; sign-in only needed for order history */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(640px,calc(100dvh-40px))] w-[min(420px,calc(100vw-40px))] flex-col">
          <Chat
            onClose={() => setIsOpen(false)}
            initialPrompt={initialPrompt}
            onInitialPromptSent={() => setInitialPrompt(undefined)}
          />
        </div>
      )}
    </div>
  );
}
