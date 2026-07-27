import { defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { imageWithAlt, lockedSlug, richBody, seoFields } from "./fields";
import { sectionArrayMembers } from "./serviceSections";

const ICON_CHOICES: Array<{ title: string; value: NavIconName }> = [
  { title: "Wrench (general plumbing)", value: "wrench" },
  { title: "Siren (emergency)", value: "siren" },
  { title: "Waves (drain & sewer)", value: "waves" },
  { title: "Calendar check (maintenance)", value: "calendar-check" },
  { title: "Office building (commercial)", value: "building-2" },
  { title: "Gear (specialty services)", value: "cog" },
  { title: "Shield check (backflow / compliance)", value: "shield-check" },
  { title: "Heart pulse (senior care)", value: "heart-pulse" },
  { title: "Graduation cap (student housing)", value: "graduation-cap" },
];

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  groups: [
    { name: "advanced", title: "Advanced" },
    { name: "seo", title: "Search (SEO)" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Service name",
      description:
        "Shown as the card headline on the homepage “What We Do” grid and as the big heading on the service's own page.",
      type: "string",
      validation: (rule) =>
        rule.required().error("Every service needs a name."),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      description:
        "One or two sentences shown on the homepage card and used as the page's search-engine description.",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule
          .required()
          .error("Cards and search results show this text — it can't be empty.")
          .max(200)
          .error("Keep it under 200 characters so it fits on the card."),
    }),
    defineField({
      name: "sections",
      title: "Page sections",
      description:
        "The service page, built section by section, in order. Remove a section and the page simply renders without it. Leave the whole list empty to use the simple “Page content” layout below instead.",
      type: "array",
      of: sectionArrayMembers,
    }),
    richBody({
      description:
        "The main content of the service's own page: headings, paragraphs, lists, links, and call-us boxes. Only used when “Page sections” above is empty — if that list has sections, this field is ignored.",
    }),
    imageWithAlt({
      name: "photo",
      title: "Photo",
      description:
        "Shown on the homepage card and the service page. Best: a real photo of your team doing this work — e.g. a technician in a commercial mechanical room for Commercial Plumbing, a sewer camera in use for Drain & Sewer, a crew responding at night for Emergency. Until a photo is added the site shows a styled placeholder.",
    }),
    defineField({
      name: "icon",
      title: "Icon",
      description: "Small symbol shown on the service card.",
      type: "string",
      options: { list: ICON_CHOICES },
      validation: (rule) =>
        rule.required().error("Pick an icon so the card doesn't render empty."),
    }),
    defineField({
      name: "featured",
      title: "Feature on homepage",
      description:
        "Featured services appear as the two large cards at the top of the homepage services grid. Mark exactly two.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display order",
      description:
        "Controls the order of the cards — lower numbers appear first. Use 10, 20, 30… so you can slot new services in between later.",
      type: "number",
      validation: (rule) =>
        rule
          .required()
          .error("Without a number the site can't know where to place this service.")
          .integer()
          .error("Use a whole number like 10 or 20.")
          .min(0)
          .error("Use 0 or higher."),
    }),
    lockedSlug({ source: "title", prefix: "/services" }),
    ...seoFields(),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", slug: "slug.current", featured: "featured" },
    prepare: ({ title, slug, featured }) => ({
      title: `${featured ? "★ " : ""}${title ?? "Untitled service"}`,
      subtitle: slug ? `/services/${slug}` : "No web address yet",
    }),
  },
});
