"use client";

import type { UIMessagePart, UIDataTypes, UITools } from "ai";
import { ChevronRight, Database, Filter, Package, ScanText } from "lucide-react";
import { useState } from "react";

type AnyPart = UIMessagePart<UIDataTypes, UITools>;

function labelFor(toolName: string): {
  label: string;
  icon: React.ReactNode;
} {
  switch (toolName) {
    case "groq_query":
      return {
        label: "Queried Sanity with GROQ",
        icon: <Database className="h-3 w-3" />,
      };
    case "schema_explorer":
      return {
        label: "Explored the schema",
        icon: <Database className="h-3 w-3" />,
      };
    case "array_field_reader":
      return {
        label: "Read content fields",
        icon: <Database className="h-3 w-3" />,
      };
    case "get_my_orders":
      return {
        label: "Checked your orders",
        icon: <Package className="h-3 w-3" />,
      };
    case "get_page_context":
      return {
        label: "Read the current page",
        icon: <ScanText className="h-3 w-3" />,
      };
    case "set_product_filters":
      return {
        label: "Updated the catalog filters",
        icon: <Filter className="h-3 w-3" />,
      };
    default:
      return { label: toolName, icon: <Database className="h-3 w-3" /> };
  }
}

/**
 * Compact, expandable record of a tool call. For groq_query the expanded
 * view shows the exact GROQ the agent generated — schema-aware filters
 * plus semantic ranking in a single query.
 */
export function ToolActivity({ part }: { part: AnyPart }) {
  const [open, setOpen] = useState(false);

  const toolName =
    part.type === "dynamic-tool"
      ? part.toolName
      : part.type.startsWith("tool-")
        ? part.type.slice(5)
        : null;

  if (!toolName) return null;

  const state = "state" in part ? part.state : undefined;
  const input =
    "input" in part &&
    (state === "input-available" || state === "output-available")
      ? part.input
      : undefined;
  const output =
    "output" in part && state === "output-available" ? part.output : undefined;

  const { label, icon } = labelFor(toolName);
  const running = state === "input-streaming" || state === "input-available";

  const groq =
    toolName === "groq_query" &&
    input &&
    typeof input === "object" &&
    "query" in input &&
    typeof (input as { query: unknown }).query === "string"
      ? (input as { query: string }).query
      : null;

  // Prefer the input; for zero-argument tools (e.g. get_my_orders) fall back
  // to the result so the expanded chip is never an empty "{}"
  const toDetail = (value: unknown): string | null => {
    if (value === undefined || value === null) return null;
    if (typeof value === "string") return value.trim() || null;
    if (typeof value === "object" && Object.keys(value).length === 0)
      return null;
    return JSON.stringify(value, null, 2);
  };

  const detail = (groq ?? toDetail(input) ?? toDetail(output))?.slice(0, 4000);

  return (
    <div className="max-w-full">
      <button
        type="button"
        onClick={() => detail && setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-line bg-parchment px-2.5 py-1 font-mono text-[11px] text-moss transition-colors hover:text-pine-ink"
      >
        {icon}
        <span>{label}</span>
        {running && <span className="animate-pulse">…</span>}
        {detail && (
          <ChevronRight
            className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`}
          />
        )}
      </button>

      {open && detail && (
        <pre className="mt-1 max-h-48 max-w-full overflow-auto rounded-md border border-line bg-pine-deep p-3 font-mono text-[11px] leading-relaxed text-white/90">
          {detail.trim()}
        </pre>
      )}
    </div>
  );
}
