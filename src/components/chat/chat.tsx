"use client";

import { Show, SignInButton } from "@clerk/nextjs";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai";
import { Compass, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useCart } from "@/components/cart/cart-context";
import { getDocumentContext, getPageContent } from "@/lib/capture-context";
import {
  CLIENT_TOOL_NAMES,
  productFiltersSchema,
  type CartChatContext,
  type ProductFiltersInput,
} from "@/lib/client-tools";

import { ChatInput } from "./chat-input";
import { Loader } from "./loader";
import { Message } from "./message/message";

const SUGGESTIONS = [
  "Waterproof seat pack under $120?",
  "What bags do I need for a 2-day gravel overnight?",
  "What did I order last time?",
];

/**
 * True while the last assistant message has no streamed text yet —
 * used to show the loader.
 */
function isWaitingForText(messages: UIMessage[]): boolean {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") return true;

  const parts = last.parts ?? [];
  if (parts.length === 0) return true;

  const lastPart = parts[parts.length - 1];
  return !(lastPart.type === "text" && lastPart.text.trim().length > 0);
}

interface ChatProps {
  onClose: () => void;
  initialPrompt?: string;
  onInitialPromptSent?: () => void;
}

export function Chat({ onClose, initialPrompt, onInitialPromptSent }: ChatProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live cart snapshot, read via ref so the (once-created) transport
  // always sends the current cart with each request
  const { items: cartItems, subtotal: cartSubtotal } = useCart();
  const cartRef = useRef<CartChatContext>({ items: [], subtotal: 0 });
  useEffect(() => {
    cartRef.current = {
      items: cartItems.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
        size: i.size,
        color: i.color,
      })),
      subtotal: cartSubtotal,
    };
  }, [cartItems, cartSubtotal]);

  const applyProductFilters = useCallback(
    (filters: ProductFiltersInput): string => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.size) params.set("size", filters.size);
      if (typeof filters.minPrice === "number")
        params.set("minPrice", String(filters.minPrice));
      if (typeof filters.maxPrice === "number")
        params.set("maxPrice", String(filters.maxPrice));
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.q) params.set("q", filters.q);

      const newUrl = `/products${params.size ? `?${params}` : ""}`;
      router.push(newUrl, { scroll: false });
      return newUrl;
    },
    [router],
  );

  const { messages, sendMessage, status, addToolOutput, error, regenerate } =
    useChat({
      transport: new DefaultChatTransport({
        body: () => ({
          documentContext: getDocumentContext(),
          cart: cartRef.current,
        }),
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onToolCall: async ({ toolCall }) => {
        if (toolCall.dynamic) return;

        const respond = (output: unknown): void => {
          addToolOutput({
            tool: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            output,
          });
        };

        switch (toolCall.toolName) {
          case CLIENT_TOOL_NAMES.PAGE_CONTEXT: {
            respond(getPageContent());
            return;
          }

          case CLIENT_TOOL_NAMES.SET_FILTERS: {
            const parsed = productFiltersSchema.safeParse(toolCall.input);
            if (!parsed.success) {
              respond(`Invalid input: ${parsed.error.message}`);
              return;
            }
            const url = applyProductFilters(parsed.data);
            respond(`Filters applied. Navigated to ${url}`);
          }
        }
      },
    });

  // Auto-send the prompt passed from an "Ask the Trail Guide" button
  const sentInitialPrompt = useRef(false);
  useEffect(() => {
    if (!initialPrompt || sentInitialPrompt.current) return;
    sentInitialPrompt.current = true;
    sendMessage({ text: initialPrompt });
    onInitialPromptSent?.();
  }, [initialPrompt, sendMessage, onInitialPromptSent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const isLoading = status === "submitted" || status === "streaming";
  const showLoader = isLoading && isWaitingForText(messages);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-parchment shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-pine-deep px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Compass className="h-4 w-4 text-blaze" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Pack Guide</h3>
            <Show when="signed-in">
              <p className="text-xs text-white/50">
                Live from Sanity · knows your orders
              </p>
            </Show>
            <Show when="signed-out">
              <p className="text-xs text-white/50">
                Live from Sanity · sign in for order history
              </p>
            </Show>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-pine-ink/50">
              Ask about any bag in the store — capacity, waterproofing, or what
              to pack for your ride.
            </p>
            <Show when="signed-out">
              <p className="text-xs text-pine-ink/40">
                Questions about your orders?{" "}
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="font-medium text-moss underline-offset-2 hover:underline"
                  >
                    Sign in
                  </button>
                </SignInButton>
              </p>
            </Show>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage({ text: suggestion })}
                  className="rounded-full border border-line bg-sage/60 px-4 py-2 text-xs text-pine-ink/80 transition-colors hover:border-pine/30 hover:text-pine-ink"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}

            {showLoader && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg bg-sage px-4 py-2 text-sm text-pine-ink">
                  <Loader />
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="flex flex-col gap-2 rounded-lg bg-blaze/10 px-4 py-3 text-sm text-blaze-deep">
                  <span>{error.message || "Something went wrong."}</span>
                  <button
                    type="button"
                    onClick={() => regenerate()}
                    className="w-fit rounded bg-blaze px-3 py-1 text-xs font-medium text-white hover:bg-blaze-deep"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-line p-3">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
