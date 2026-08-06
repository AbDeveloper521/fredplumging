import { defineArrayMember, defineField, defineType } from "sanity";
import { imageWithAlt, lockedSlug, seoFields } from "./fields";

/**
 * "Areas We Serve" city page — a slug-keyed document (one per city), NOT a
 * singleton, carrying an orderable `sections` stack like the other page
 * stacks. Nearly every band reuses the shared service-section library
 * (banner hero, sub-service cards, dark about/heritage collage, client
 * reviews) plus the generic extras (Icon Card, FAQ, closing CTA); only the
 * communities band below is city-specific.
 *
 * TypeScript twins live in `data/cities.ts`; mapping in
 * `sanity/lib/citySections.ts`; rendering in
 * `components/sections/CitySectionRenderer.tsx`. The association badge
 * strip and the Google-map band are NOT stack items — the city template
 * renders them automatically after the stack, same as the service pages.
 *
 * Doorway-page rule: every band's copy must be written for ITS city — never
 * another city's text with the name swapped; search engines treat
 * near-duplicate city pages as doorway pages and may ignore or penalize
 * them.
 */

/** Shared library types the city stack accepts — reused, not forked. */
const SHARED_CITY_SECTION_TYPES = [
  "serviceHero",
  "propertyTypes",
  "serviceAbout",
  "serviceTestimonials",
  "iconCardSection",
  "serviceFaq",
  "finalCta",
];

/** `rule.required()` alone accepts whitespace — refuse it at publish time. */
const notJustSpaces = (message: string) => (value?: string) =>
  value === undefined || value === null || value.trim() !== "" ? true : message;

const filled = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

export const cityCommunities = defineType({
  name: "cityCommunities",
  title: "Communities band",
  type: "object",
  description:
    "The “Proudly Serving …” band: copy, the map-pin community chips, two photo slots, and the contact button.",
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      description: "e.g. “Proudly Serving Dallas and Surrounding Communities”.",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .error("The section needs a heading.")
          .custom(notJustSpaces("The section needs a heading.")),
    }),
    defineField({
      name: "body",
      title: "Paragraph",
      description:
        "One paragraph naming the nearby areas this city page covers — written for this city, not copied from another.",
      type: "text",
      rows: 4,
      validation: (rule) =>
        rule
          .required()
          .error("The section needs its paragraph.")
          .custom(notJustSpaces("The section needs its paragraph.")),
    }),
    defineField({
      name: "communities",
      title: "Community names",
      description:
        "The nearby communities shown as map-pin chips — only places the business actually serves, exactly as the owner lists them.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1),
    }),
    imageWithAlt({
      name: "photoPrimary",
      title: "Left photo",
      description:
        "The first of the two photos under the community chips — e.g. the city skyline. Both photos crop to the same wide shape so the pair stays aligned; drag the hotspot circle (click the image → Edit hotspot) over the part that must stay visible.",
      // The pair shares one wide frame — a per-photo shape override would
      // misalign it.
      frameRatio: false,
    }),
    defineField({
      name: "photoSubjectPrimary",
      title: "Intended left-photo subject",
      description:
        "What the left photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
    imageWithAlt({
      name: "photoSecondary",
      title: "Right photo",
      description:
        "The second of the two photos under the community chips — e.g. a technician arriving at a property. Crops to the same wide shape as the left photo.",
      frameRatio: false,
    }),
    defineField({
      name: "photoSubjectSecondary",
      title: "Intended right-photo subject",
      description:
        "What the right photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
    defineField({
      name: "ctaLabel",
      title: "Button text",
      description:
        "The button under the band, e.g. “Contact Us”. Leave both button fields empty for no button.",
      type: "string",
      validation: (rule) =>
        rule.custom((value: string | undefined, context) => {
          const parent = context.parent as Record<string, unknown> | undefined;
          if (typeof value === "string" && value.trim() === "")
            return "Write real text or clear the field — spaces alone don't count.";
          if (!filled(value) && filled(parent?.ctaHref))
            return "The button has a link but no text — fill this in or clear the link.";
          return true;
        }),
    }),
    defineField({
      name: "ctaHref",
      title: "Button link",
      description: "Where the button goes — usually /contact.",
      type: "string",
      validation: (rule) =>
        rule.custom((value: string | undefined, context) => {
          const parent = context.parent as Record<string, unknown> | undefined;
          if (filled(value) && !value.startsWith("/"))
            return "Use a page on this site, starting with a slash — e.g. /contact.";
          if (!filled(value) && filled(parent?.ctaLabel))
            return "The button has text but nowhere to go — add the link (usually /contact) or clear the text.";
          return true;
        }),
    }),
    defineField({
      name: "hidden",
      title: "Hide this section",
      description:
        "Keeps the content but stops showing it on the site. Untick to bring it back exactly as it was.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { heading: "heading", hidden: "hidden" },
    prepare: ({ heading, hidden }: { heading?: string; hidden?: boolean }) => ({
      title: `${hidden ? "🚫 " : ""}Communities band`,
      subtitle: hidden ? "HIDDEN — not shown on the site" : heading,
    }),
  },
});

export const citySectionTypes = [cityCommunities];

export const cityPage = defineType({
  name: "cityPage",
  title: "City Page",
  type: "document",
  groups: [{ name: "seo", title: "Search (SEO)" }],
  fields: [
    defineField({
      name: "city",
      title: "City name",
      description: "Just the city, e.g. “Dallas” — used in headings and search results.",
      type: "string",
      validation: (rule) => rule.required().error("Every city page needs a city name."),
    }),
    lockedSlug({ source: "city", prefix: "/areas-we-serve" }),
    defineField({
      name: "sections",
      title: "City-page sections",
      description:
        "The page, top to bottom. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove. The certification-badge strip and the Google-map band close the page automatically — they are not sections here. Write every band's copy for THIS city; never copy another city's text and swap the name.",
      type: "array",
      of: [
        ...SHARED_CITY_SECTION_TYPES.map((type) => ({ type })),
        ...citySectionTypes.map((type) => ({ type: type.name })),
      ],
    }),
    ...seoFields(),
  ],
  preview: {
    select: { title: "city", subtitle: "slug.current" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "City Page",
      subtitle: subtitle ? `/areas-we-serve/${subtitle}` : undefined,
    }),
  },
});
