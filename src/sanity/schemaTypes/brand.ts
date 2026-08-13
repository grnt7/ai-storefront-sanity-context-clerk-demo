import { defineField, defineType } from "sanity";

export const brand = defineType({
  name: "brand",
  title: "Brands",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'Brand name (e.g., "Cairn Supply Co.")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "URL-friendly identifier",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Short blurb about the brand and what it is known for",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
