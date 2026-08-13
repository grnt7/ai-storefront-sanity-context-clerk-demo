import { defineArrayMember, defineField, defineType } from "sanity";

export const order = defineType({
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      description: 'Human-readable order reference (e.g., "TH-4F7K2M")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clerkUserId",
      title: "Clerk User ID",
      type: "string",
      description: "ID of the Clerk user who placed this order",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      description: "Products purchased in this order",
      of: [
        defineArrayMember({
          type: "object",
          name: "orderItem",
          fields: [
            defineField({
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description: "Product title at time of purchase",
            }),
            defineField({
              name: "price",
              title: "Unit Price (USD)",
              type: "number",
              description: "Price per unit at time of purchase",
            }),
            defineField({
              name: "quantity",
              title: "Quantity",
              type: "number",
            }),
            defineField({
              name: "size",
              title: "Size",
              type: "string",
            }),
            defineField({
              name: "color",
              title: "Color",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "title", quantity: "quantity", price: "price" },
            prepare({ title, quantity, price }) {
              return {
                title: title || "Item",
                subtitle: `${quantity ?? 1} x $${price ?? 0}`,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "subtotal",
      title: "Subtotal (USD)",
      type: "number",
    }),
    defineField({
      name: "shipping",
      title: "Shipping (USD)",
      type: "number",
    }),
    defineField({
      name: "total",
      title: "Total (USD)",
      type: "number",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Fulfilment status of the order",
      options: {
        list: [
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "processing",
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      description: "Demo builds use a simulated payment",
      initialValue: "demo-card",
    }),
    defineField({
      name: "placedAt",
      title: "Placed At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "orderNumber",
      total: "total",
      status: "status",
      name: "customerName",
    },
    prepare({ title, total, status, name }) {
      return {
        title: title || "Order",
        subtitle: `${name || "Unknown"} | $${total ?? 0} | ${status || "processing"}`,
      };
    },
  },
});
