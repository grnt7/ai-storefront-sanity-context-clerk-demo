import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Products",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "details", title: "Details" },
    { name: "inventory", title: "Inventory" },
  ],
  fields: [
    // Content
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'Product name (e.g., "Ridgeline Mid Hiking Boot")',
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL-friendly identifier",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      description: 'Stock keeping unit (e.g., "BOOT-RDG-001")',
      group: "content",
    }),
    defineField({
      name: "shortDescription",
      title: "Short Description",
      type: "text",
      rows: 2,
      description: "One-liner for product cards (max 160 characters)",
      group: "content",
      validation: (rule) => rule.max(160).warning("Keep it under 160 characters"),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 6,
      description:
        "Full product description: comfort, fit, materials, and what it is best used for. Used for semantic search.",
      group: "content",
    }),
    defineField({
      name: "image",
      title: "Main Image",
      type: "image",
      description: "Primary product photo",
      group: "content",
      options: { hotspot: true },
    }),

    // Details
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Product category",
      group: "details",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
      description: "Product brand",
      group: "details",
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      description:
        'Notable features and benefits (e.g., "Waterproof", "Cushioned midsole", "Vibram outsole")',
      group: "details",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      description:
        'Search tags for discovery (e.g., "comfortable", "lightweight", "winter", "beginner-friendly")',
      group: "details",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      description: "Average customer rating from 0 to 5",
      group: "details",
      validation: (rule) => rule.min(0).max(5),
    }),
    defineField({
      name: "reviewCount",
      title: "Review Count",
      type: "number",
      description: "Number of customer reviews",
      group: "details",
    }),

    // Inventory
    defineField({
      name: "price",
      title: "Price (USD)",
      type: "number",
      description: "Current price in US dollars",
      group: "inventory",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Compare-at Price (USD)",
      type: "number",
      description: "Original price before discount, if the product is on sale",
      group: "inventory",
    }),
    defineField({
      name: "sizes",
      title: "Sizes",
      type: "array",
      description:
        'Available US sizes as strings (e.g., "8", "9", "10", "10.5"). For one-size products use "One Size".',
      group: "inventory",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "colors",
      title: "Colors",
      type: "array",
      description: 'Available colorways (e.g., "Moss", "Slate", "Sand")',
      group: "inventory",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      description: "Whether the product is currently available to buy",
      group: "inventory",
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show this product on the homepage",
      group: "inventory",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      price: "price",
      category: "category.title",
      media: "image",
      inStock: "inStock",
    },
    prepare({ title, price, category, media, inStock }) {
      return {
        title,
        subtitle: `$${price ?? "?"} | ${category || "Uncategorized"}${inStock === false ? " | OUT OF STOCK" : ""}`,
        media,
      };
    },
  },
});
