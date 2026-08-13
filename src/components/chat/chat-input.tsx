"use client";

import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  disabled,
}: ChatInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about gear, sizes, your orders…"
        className="flex-1 rounded-full border border-line bg-sage/50 px-4 py-2.5 text-sm text-pine-ink placeholder:text-pine-ink/40 focus:border-pine/40 focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blaze text-white transition-colors hover:bg-blaze-deep disabled:opacity-40"
        aria-label="Send message"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </form>
  );
}
