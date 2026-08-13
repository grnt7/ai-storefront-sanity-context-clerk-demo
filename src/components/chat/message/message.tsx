import { isToolUIPart, type UIMessage } from "ai";

import { cn } from "@/lib/utils";

import { TextPart } from "./text-part";
import { ToolActivity } from "./tool-activity";

interface MessageProps {
  message: UIMessage;
}

export function Message(props: MessageProps) {
  const { message } = props;

  const isUser = message.role === "user";
  const parts = message.parts ?? [];

  const textParts = parts.filter(
    (part) => part.type === "text" && part.text.trim(),
  );
  const toolParts = parts.filter(
    (part) => part.type === "dynamic-tool" || isToolUIPart(part),
  );

  if (textParts.length === 0 && toolParts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {/* Tool activity: shows the GROQ the agent wrote, filter changes, etc. */}
      {!isUser && toolParts.length > 0 && (
        <div className="flex flex-col items-start gap-1">
          {toolParts.map((part, i) => (
            <ToolActivity key={`${message.id}-tool-${i}`} part={part} />
          ))}
        </div>
      )}

      {textParts.length > 0 && (
        <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-[85%] space-y-2 rounded-lg px-4 py-3 text-sm",
              isUser ? "bg-pine text-white" : "bg-sage text-pine-ink",
            )}
          >
            {textParts.map((part, i) =>
              part.type === "text" ? (
                <TextPart
                  key={`${message.id}-text-${i}`}
                  text={part.text}
                  isUser={isUser}
                />
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
