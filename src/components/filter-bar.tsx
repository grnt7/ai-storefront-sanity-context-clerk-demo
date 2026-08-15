"use client";

import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const SIZES = [
  "1L",
  "2L",
  "3L",
  "5L",
  "8L",
  "10L",
  "15L",
  "16L",
  "18L",
  "20L",
  "22L",
  "24L",
  "26L",
  "One Size",
];

const SORTS = [
  { value: "", label: "A–Z" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

export function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, {
      scroll: false,
    });
  };

  const activeCategory = searchParams.get("category");
  const activeSize = searchParams.get("size");
  const activeSort = searchParams.get("sort") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const hasFilters =
    !!activeCategory || !!activeSize || !!maxPrice || !!searchParams.get("sort");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setParam("category", null)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            !activeCategory
              ? "border-pine bg-pine text-white"
              : "border-line bg-parchment text-pine-ink/70 hover:text-pine-ink",
          )}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() =>
              setParam(
                "category",
                activeCategory === category.slug ? null : category.slug,
              )
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === category.slug
                ? "border-pine bg-pine text-white"
                : "border-line bg-parchment text-pine-ink/70 hover:text-pine-ink",
            )}
          >
            {category.title}
          </button>
        ))}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs text-pine-ink/60">
          Capacity
          <select
            value={activeSize ?? ""}
            onChange={(e) => setParam("size", e.target.value || null)}
            className="rounded-md border border-line bg-parchment px-2 py-1.5 font-mono text-xs text-pine-ink"
          >
            <option value="">Any</option>
            {SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-xs text-pine-ink/60">
          Max $
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setParam("maxPrice", e.target.value || null)}
            className="w-20 rounded-md border border-line bg-parchment px-2 py-1.5 font-mono text-xs text-pine-ink"
          />
        </label>

        <label className="flex items-center gap-1.5 text-xs text-pine-ink/60">
          Sort
          <select
            value={activeSort}
            onChange={(e) => setParam("sort", e.target.value || null)}
            className="rounded-md border border-line bg-parchment px-2 py-1.5 font-mono text-xs text-pine-ink"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-blaze hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
