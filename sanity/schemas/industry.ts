import { defineField, defineType } from "sanity";
import { imageWithAlt, lockedSlug, richBody, seoFields } from "./fields";
import { sectionArrayMembers } from "./serviceSections";

export const industry = defineType({
  name: "industry",
  title: "Property Type",
  type: "document",
  groups: [{ name: "seo", title: "Search (SEO)" }],
  fields: [
    defineField({
      name: "title",
      title: "Property type name",
      description:
        "Shown in the homepage “Who We Serve” selector and as the big heading on its own page, e.g. “Apartment Communities”.",
      type: "string",
      validation: (rule) =>
        rule.required().error("Every property type needs a name."),
    }),
    defineField({
      name: "description",
      title: "Description",
      description:
        "A few sentences shown in the homepage panel and on the property type's own page. Also used as the page's search-engine description.",
      type: "text",
      rows: 4,
      validation: (rule) =>
        rule.required().error("The panel and page show this text — it can't be empty."),
    }),
    defineField({
      name: "bulletPoints",
      title: "What's included",
      description:
        "Short bullet points shown as a checklist, e.g. “Unit-level service”. Three to six work best.",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .error("Add at least one bullet — the checklist would render empty.")
          .max(6)
          .error("More than 6 bullets overflows the panel — trim to the essentials."),
    }),
    imageWithAlt({
      name: "photo",
      title: "Photo",
      description:
        "This photo appears in this property type's panel on the HOMEPAGE (“Industries We Serve”) — it is NOT the large photos on the property type's own page. Those come from the “Page sections” list above (Top banner, About, and so on). Best: a real photo of this kind of property — e.g. an apartment community exterior, a condominium entrance, a technician working quietly in a senior living facility. Until a photo is added the site shows a styled placeholder.",
      // Fills the homepage panel edge-to-edge — the panel sets the shape,
      // so a frame override would do nothing here.
      frameRatio: false,
    }),
    defineField({
      name: "order",
      title: "Display order",
      description:
        "Controls the order in the homepage selector — lower numbers appear first. Use 10, 20, 30… so you can slot new ones in between later.",
      type: "number",
      validation: (rule) =>
        rule
          .required()
          .error("Without a number the site can't know where to place this property type.")
          .integer()
          .error("Use a whole number like 10 or 20.")
          .min(0)
          .error("Use 0 or higher."),
    }),
    defineField({
      name: "sections",
      title: "Page sections",
      description:
        "The property-type page, built section by section, in order — the same section library the service pages use. Remove a section and the page simply renders without it. Leave the whole list empty to use the simple “Page content” layout below instead.",
      type: "array",
      of: sectionArrayMembers,
    }),
    richBody({
      description:
        "The main content of this property type's own page: headings, paragraphs, lists, links, and call-us boxes. Only used when “Page sections” above is empty — if that list has sections, this field is ignored.",
    }),
    lockedSlug({ source: "title", prefix: "/multifamily" }),
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
    select: { title: "title", slug: "slug.current" },
    prepare: ({ title, slug }) => ({
      title: title ?? "Untitled property type",
      subtitle: slug ? `/multifamily/${slug}` : "No web address yet",
    }),
  },
});
