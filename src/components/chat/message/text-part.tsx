import { remarkAgentDirectives } from "@sanity/agent-directives/react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";

import { cn } from "@/lib/utils";

import { Document } from "./document";

interface TextPartProps {
  text: string;
  isUser: boolean;
}

/**
 * Wrapper for consecutive directives — renders children in a flex column
 */
function DirectivesStack({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

type ExtendedComponents = Components & {
  Document: typeof Document;
  DirectivesStack: typeof DirectivesStack;
};

export function TextPart(props: TextPartProps) {
  const { text, isUser } = props;

  if (!text.trim()) return null;

  const components: ExtendedComponents = {
    Document,
    DirectivesStack,

    a(anchorProps) {
      const { href = "", children } = anchorProps;
      const isInternal = href.startsWith("/");
      const className = cn(
        "underline",
        isUser
          ? "text-white/90 hover:text-white"
          : "text-blaze-deep hover:text-blaze",
      );

      if (isInternal) {
        return (
          <Link href={href} className={className}>
            {children}
          </Link>
        );
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {children}
        </a>
      );
    },
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="whitespace-pre-wrap">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-4">{children}</ul>
    ),
    ol: (listProps) => <ol className="list-decimal pl-4">{listProps.children}</ol>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkAgentDirectives]} components={components}>
      {text}
    </ReactMarkdown>
  );
}
