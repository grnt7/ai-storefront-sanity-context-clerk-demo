"use client";

import { Show, SignInButton } from "@clerk/nextjs";
import { Compass, X } from "lucide-react";
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
          aria-label="Open the Trail Guide chat"
        >
          <Compass className="h-5 w-5 text-blaze" />
          Trail Guide
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(640px,calc(100dvh-40px))] w-[min(420px,calc(100vw-40px))] flex-col">
          <Show when="signed-in">
            <Chat
              onClose={() => setIsOpen(false)}
              initialPrompt={initialPrompt}
              onInitialPromptSent={() => setInitialPrompt(undefined)}
            />
          </Show>

          <Show when="signed-out">
            <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-parchment shadow-2xl">
              <div className="flex items-center justify-between bg-pine-deep px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Compass className="h-4 w-4 text-blaze" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Trail Guide
                    </h3>
                    <p className="text-xs text-white/50">
                      Knows every product in the store
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <Compass className="h-10 w-10 text-moss" />
                <div>
                  <p className="display text-2xl font-semibold text-pine-ink">
                    Sign in to hit the trail
                  </p>
                  <p className="mt-2 text-sm text-pine-ink/60">
                    The Trail Guide can recommend gear, filter the catalog, and
                    answer questions about your orders.
                  </p>
                </div>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="rounded-md bg-blaze px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blaze-deep"
                  >
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </div>
          </Show>
        </div>
      )}
    </div>
  );
}
