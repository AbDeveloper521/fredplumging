import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      description:
        "The customer's words, shown in the “Client Feedback” section on the homepage. A few sentences works best.",
      type: "text",
      rows: 4,
      validation: (rule) =>
        rule.required().error("A testimonial card without a quote would be empty."),
    }),
    defineField({
      name: "name",
      title: "Customer name",
      description:
        "Shown under the quote. First name and last initial is fine, e.g. “Melissa R.”",
      type: "string",
      validation: (rule) =>
        rule.required().error("Every quote needs a name so visitors know who said it."),
    }),
    defineField({
      name: "role",
      title: "Job title / company",
      description:
        "Shown under the name, e.g. “Property Manager, Fort Worth”. Optional but adds credibility.",
      type: "string",
    }),
    defineField({
      name: "date",
      title: "When",
      description:
        "Shown next to the review, written out — e.g. “March 2026”.",
      type: "string",
      validation: (rule) =>
        rule.required().error("Reviews without a date look stale — add e.g. “March 2026”."),
    }),
    defineField({
      name: "rating",
      title: "Star rating",
      description: "1 to 5 stars, shown on the review card.",
      type: "number",
      initialValue: 5,
      validation: (rule) =>
        rule
          .required()
          .error("Pick a star rating from 1 to 5.")
          .integer()
          .error("Whole stars only.")
          .min(1)
          .max(5)
          .error("Ratings run from 1 to 5 stars."),
    }),
    defineField({
      name: "featured",
      title: "Feature this review",
      description:
        "The featured review appears in the large card at the top of the section. If several are marked, the one earliest in the display order wins.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display order",
      description:
        "Controls the order on the site — lower numbers appear first. Use 10, 20, 30… so you can slot new reviews in between later.",
      type: "number",
      validation: (rule) =>
        rule
          .required()
          .error("Without a number the site can't know where to place this review.")
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
    select: { title: "name", subtitle: "role", featured: "featured" },
    prepare: ({ title, subtitle, featured }) => ({
      title: `${featured ? "★ " : ""}${title ?? "Unnamed reviewer"}`,
      subtitle: subtitle ?? undefined,
    }),
  },
});
