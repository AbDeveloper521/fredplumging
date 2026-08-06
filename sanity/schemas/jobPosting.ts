import { defineArrayMember, defineField, defineType } from "sanity";
import { lockedSlug } from "./fields";

/**
 * An open role on /about/careers. Closed roles (`open` unticked) stay in the
 * CMS so their URL keeps resolving with a "filled" notice — they just drop
 * off the listing.
 */
export const jobPosting = defineType({
  name: "jobPosting",
  title: "Job Posting",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Role title",
      description: "e.g. “Journeyman Plumber”. The card and page heading.",
      type: "string",
      validation: (rule) => rule.required().error("Every role needs a title."),
    }),
    lockedSlug({ source: "title", prefix: "/about/careers" }),
    defineField({
      name: "employmentType",
      title: "Employment type",
      description:
        "Stored in the format Google's job search expects, so the listing can feed Google Jobs without translation.",
      type: "string",
      options: {
        list: [
          { title: "Full Time", value: "FULL_TIME" },
          { title: "Part Time", value: "PART_TIME" },
          { title: "Contractor", value: "CONTRACTOR" },
          { title: "Temporary", value: "TEMPORARY" },
        ],
      },
      initialValue: "FULL_TIME",
      validation: (rule) =>
        rule.required().error("Pick the employment type — it shows on the card."),
    }),
    defineField({
      name: "team",
      title: "Team",
      description:
        "e.g. “Field Operations”. Shown on the role's own page — the listing card keeps to title, type, summary and Apply.",
      type: "string",
    }),
    defineField({
      name: "shift",
      title: "Shift",
      description:
        "Only for roles with a fixed shift, e.g. “Evening shift · 4 PM – 12 AM”. Leave empty otherwise. Shown on the role's own page.",
      type: "string",
    }),
    defineField({
      name: "openings",
      title: "Number of openings",
      description:
        "How many positions are open for this role. Shown on the role's own page and in Google's job data.",
      type: "number",
      validation: (rule) =>
        rule
          .integer()
          .error("Whole positions only.")
          .min(1)
          .error("A listed role has at least one opening."),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      description:
        "The paragraph on the role card and in search results. Say what the role is, who it suits, and why it's worth applying.",
      type: "text",
      rows: 4,
      validation: (rule) =>
        rule.required().error("The card and search results show this text."),
    }),
    defineField({
      name: "responsibilities",
      title: "Responsibilities",
      description: "One entry per bullet on the role's page. Optional.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "requirements",
      title: "Requirements",
      description: "One entry per bullet on the role's page. Optional.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "compensationNote",
      title: "Compensation note",
      description:
        "Free text, e.g. “Competitive hourly rate plus overtime”. Only state figures that are actually offered.",
      type: "string",
    }),
    defineField({
      name: "applyEmail",
      title: "Application email",
      description:
        "Where “Apply Now” sends applications. Leave empty to use the main email from Site Settings.",
      type: "string",
      validation: (rule) => rule.email().error("Enter a valid email address."),
    }),
    defineField({
      name: "applyUrl",
      title: "Application link",
      description:
        "An external application page (e.g. a job board). When set, “Apply Now” goes here instead of the email.",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "datePosted",
      title: "Date posted",
      description:
        "When the role went live. Needed (with the address in Site Settings) before the role can appear in Google's job search.",
      type: "date",
    }),
    defineField({
      name: "validThrough",
      title: "Open until",
      description:
        "The last day applications are accepted. Also needed for Google's job search.",
      type: "date",
    }),
    defineField({
      name: "open",
      title: "Role is open",
      description:
        "Untick when the role is filled — it drops off the listing but its page keeps resolving with a “filled” notice.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Display order",
      description:
        "Controls the order on the careers page — lower numbers appear first. Use 10, 20, 30… so you can slot new roles in between later.",
      type: "number",
      validation: (rule) =>
        rule
          .required()
          .error("Without a number the site can't know where to place this role.")
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
    select: { title: "title", team: "team", open: "open" },
    prepare: ({ title, team, open }) => ({
      title: `${open === false ? "✕ " : ""}${title ?? "Untitled role"}`,
      subtitle: `${team ?? "No team"}${open === false ? " · filled" : ""}`,
    }),
  },
});
