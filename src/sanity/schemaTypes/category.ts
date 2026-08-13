import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Categories",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'Category name (e.g., "Hiking Boots", "Backpacks")',
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
      description: "Short description of what belongs in this category",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
