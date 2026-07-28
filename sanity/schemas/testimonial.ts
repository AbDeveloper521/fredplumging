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
        "Shown under the quote, exactly as the reviewer signs on Google — e.g. “John Hamm”.",
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
      name: "source",
      title: "Where the review was posted",
      description:
        "Google reviews show a “Posted on Google” line on the card. Only mark a review as Google if it is actually published on the Google listing — visitors can click through and check.",
      type: "string",
      options: {
        list: [
          { title: "Google", value: "google" },
          { title: "Direct / email", value: "direct" },
        ],
        layout: "radio",
      },
      initialValue: "google",
      validation: (rule) =>
        rule.required().error("Pick where the review came from."),
    }),
    defineField({
      name: "reviewerMeta",
      title: "Reviewer standing",
      description:
        "The reviewer's standing on Google, shown when there's no job title — e.g. “Local Guide · 32 reviews”.",
      type: "string",
    }),
    defineField({
      name: "sourceUrl",
      title: "Link to the review",
      description:
        "A link to the review on the platform it was posted on. The date on the card links here when set.",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "serviceTags",
      title: "Service tags",
      description:
        "Which service and property-type pages this review appears on. Valid values: commercial-plumbing, emergency-plumbing, drain-sewer, maintenance, specialty-services, plumbing, senior-care-facilities, student-housing, apartments, condos, assisted-living, nursing-homes. Anything else is ignored.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "verified",
      title: "Verified",
      description:
        "Means “someone confirmed this review exists on the public listing”. Untick if you can no longer find it there.",
      type: "boolean",
      initialValue: true,
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
    select: {
      title: "name",
      role: "role",
      reviewerMeta: "reviewerMeta",
      featured: "featured",
    },
    prepare: ({ title, role, reviewerMeta, featured }) => ({
      title: `${featured ? "★ " : ""}${title ?? "Unnamed reviewer"}`,
      subtitle: role ?? reviewerMeta ?? undefined,
    }),
  },
});
