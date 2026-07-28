import { defineField, defineType } from "sanity";

/**
 * Singleton mirroring the `googleReviews` constant in `data/googleReviews.ts`
 * — the aggregate figures and links for the Google Business Profile. The
 * individual reviews live in the Testimonials collection; this document holds
 * only the numbers shown NEXT to them.
 */
export const reviewSettings = defineType({
  name: "reviewSettings",
  title: "Google Reviews",
  type: "document",
  description:
    "The rating and review count here are shown to visitors as facts about the Google listing. Keep them in step with the live listing — a number that doesn't match what a visitor sees on Google reads as dishonest.",
  fields: [
    defineField({
      name: "rating",
      title: "Average rating",
      description:
        "The average star rating on the Google listing, e.g. 5. Shown beside the review count.",
      type: "number",
      initialValue: 5,
      validation: (rule) =>
        rule
          .required()
          .error("The rating is shown beside every review section.")
          .min(0)
          .max(5)
          .error("Google ratings run from 0 to 5."),
    }),
    defineField({
      name: "reviewCount",
      title: "Review count",
      description:
        "The total number of public reviews on the Google listing, e.g. 133. Update it as new reviews come in.",
      type: "number",
      initialValue: 133,
      validation: (rule) =>
        rule
          .required()
          .error("The count is shown beside the rating, e.g. “133 Google reviews”.")
          .integer()
          .error("Whole reviews only.")
          .min(0)
          .error("Use 0 or higher."),
    }),
    defineField({
      name: "verifiedOn",
      title: "Figures last verified",
      description:
        "The month someone last checked the rating and count against the live listing, written out — e.g. “July 2026”.",
      type: "string",
    }),
    defineField({
      name: "reviewsUrl",
      title: "Reviews link",
      description:
        "The Google listing with the reviews tab open — where “133 Google reviews” links to.",
      type: "url",
      validation: (rule) =>
        rule
          .required()
          .error("Visitors need a link to read the reviews on Google.")
          .uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "writeReviewUrl",
      title: "Leave-a-review link",
      description:
        "The direct “write a review” link from the Google Business Profile. Shown as a button on the Testimonials page when set.",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "headline",
      title: "Section label override",
      description:
        "Overrides the small label above review sections (default “Client Feedback”). Leave empty to keep the default.",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Google Reviews" }),
  },
});
