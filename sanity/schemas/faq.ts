import { defineField, defineType } from "sanity";

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      description:
        "Shown as the clickable headline in the “Common Questions” section on the homepage.",
      type: "string",
      validation: (rule) =>
        rule.required().error("An FAQ without a question can't be shown."),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      description:
        "The text that appears when a visitor clicks the question. Plain text, a few sentences.",
      type: "text",
      rows: 4,
      validation: (rule) =>
        rule
          .required()
          .error("A question with no answer would open an empty box on the site."),
    }),
    defineField({
      name: "order",
      title: "Display order",
      description:
        "Controls the order on the site — lower numbers appear first (1 is at the top). Use 10, 20, 30… so you can slot new questions in between later.",
      type: "number",
      validation: (rule) =>
        rule
          .required()
          .error("Without a number the site can't know where to place this question.")
          .integer()
          .error("Use a whole number like 10 or 20.")
          .min(0)
          .error("Use 0 or higher."),
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "question", order: "order" },
    prepare: ({ title, order }) => ({
      title: title ?? "Untitled question",
      subtitle: order != null ? `Position ${order}` : "No position set",
    }),
  },
});
