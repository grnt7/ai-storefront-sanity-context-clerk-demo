import type { DocumentContext } from "@/lib/client-tools";

/**
 * Elements marked with this attribute (the chat widget itself)
 * are excluded from page-context capture.
 */
export const AGENT_CHAT_HIDDEN_ATTRIBUTE = "data-agent-chat";

const MAX_PAGE_CONTENT_CHARS = 8000;

export function getDocumentContext(): DocumentContext {
  return {
    title: document.title,
    description:
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ?? undefined,
    pathname: window.location.pathname + window.location.search,
  };
}

/**
 * Current page content as plain text, with the chat widget removed.
 */
export function getPageContent(): string {
  const clone = document.body.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(`[${AGENT_CHAT_HIDDEN_ATTRIBUTE}]`)
    .forEach((el) => el.remove());
  clone.querySelectorAll("script, style, noscript").forEach((el) => el.remove());

  const text = (clone.textContent ?? "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

  return text.slice(0, MAX_PAGE_CONTENT_CHARS);
}
