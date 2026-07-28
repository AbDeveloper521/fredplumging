import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Singleton mirroring `data/contactPage.ts` exactly — the /contact page's
 * editable copy. Built now, populated later (standing rule): the page falls
 * back to the static data until this document is published.
 */
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Small label above the heading",
      description: "Tiny uppercase label, e.g. “Contact”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroHeading",
      title: "Big heading",
      description: "The page's one H1.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroIntro",
      title: "Intro paragraph",
      description: "Two or three sentences under the heading.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "responsePromise",
      title: "Response-time promise",
      description:
        "Shown with the quote path and under the form's submit button, e.g. “We typically respond within one business hour during business hours.” Only promise what you actually commit to.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "hours",
      title: "Business hours",
      description: "One row per line shown in the contact details column.",
      type: "array",
      of: [
        defineArrayMember({
          name: "row",
          title: "Row",
          type: "object",
          fields: [
            defineField({
              name: "days",
              title: "Days",
              description: "e.g. “Monday – Friday” or “Emergencies”.",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "hours",
              title: "Hours",
              description: "e.g. “7:00 AM – 6:00 PM” or “24/7”.",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "days", subtitle: "hours" },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "emergencyHeading",
      title: "Emergency card heading",
      description: "e.g. “Emergency? Call now.”",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "emergencyBody",
      title: "Emergency card text",
      description: "One or two sentences telling emergencies to call, not type.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faqs",
      title: "Questions & answers",
      description:
        "Contact-specific FAQ. Also published to search engines as structured data, so the text here must be exactly what visitors should read.",
      type: "array",
      of: [
        defineArrayMember({
          name: "faq",
          title: "Question",
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Contact Page" }),
  },
});
