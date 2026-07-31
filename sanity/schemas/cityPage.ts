import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { imageWithAlt, lockedSlug, seoFields } from "./fields";

/**
 * "Areas We Serve" city page — a slug-keyed document (one per city), NOT a
 * singleton. Mirrors `data/cities.ts` exactly. Built now, populated later
 * (standing rule): each city route falls back to its static entry until the
 * matching document is published.
 */

const CARD_ICONS: Array<{ title: string; value: NavIconName }> = [
  { title: "Wrench (general plumbing)", value: "wrench" },
  { title: "Waves (drain & sewer)", value: "waves" },
  { title: "Gear (specialty services)", value: "cog" },
  { title: "Calendar check (maintenance)", value: "calendar-check" },
  { title: "Siren (emergency)", value: "siren" },
  { title: "Office building (commercial)", value: "building-2" },
  { title: "Shield check (backflow / compliance)", value: "shield-check" },
];

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
      name: "heroHeading",
      title: "Big heading",
      description: "The page's one H1, e.g. “Plumbing Services in Dallas, Texas”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroIntro",
      title: "Intro paragraph",
      description:
        "Two or three sentences under the heading. Write city-specific copy — do NOT copy another city's text and swap the city name; search engines treat near-duplicate city pages as doorway pages and may ignore or penalize them.",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "servicesHeading",
      title: "Services band heading",
      description: "e.g. “Reliable Plumbing Services in Dallas”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "serviceCards",
      title: "Service cards",
      description:
        "The service cards for this city. Each links to one of the existing service pages — use that page's address (e.g. /services/plumbing).",
      type: "array",
      of: [
        defineArrayMember({
          name: "card",
          title: "Service card",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Card heading",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "description",
              title: "Card text",
              description: "One short paragraph, written for this city.",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "href",
              title: "Service page",
              description:
                "The existing service page this card opens, starting with a slash — e.g. /services/drain-sewer.",
              type: "string",
              validation: (rule) =>
                rule
                  .required()
                  .custom((value?: string) =>
                    value?.startsWith("/")
                      ? true
                      : "Use a page on this site, starting with a slash.",
                  ),
            }),
            defineField({
              name: "icon",
              title: "Icon",
              description: "Small symbol on the card. Leave empty to use the wrench icon.",
              type: "string",
              options: { list: CARD_ICONS },
            }),
          ],
          preview: { select: { title: "title", subtitle: "href" } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "whyChooseHeading",
      title: "“Why choose us” heading",
      description: "e.g. “Why Choose Us in Dallas”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "whyChooseBody",
      title: "“Why choose us” paragraph",
      description: "One paragraph — written for this city, not copied from another.",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "reviewsHeading",
      title: "Reviews band heading",
      description: "Heading above the Google reviews, e.g. “What Our Clients Say”.",
      type: "string",
      initialValue: "What Our Clients Say",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heritageHeading",
      title: "Heritage band heading",
      description: "e.g. “Serving Dallas with Integrity and Expertise Since 1996”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heritageParagraphs",
      title: "Heritage paragraphs",
      description: "The history/commitment copy beside the photo. One entry per paragraph.",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 5 })],
      validation: (rule) => rule.required().min(1),
    }),
    imageWithAlt({
      name: "heritagePhoto",
      title: "Heritage photo",
      description:
        "The photo beside the heritage copy, carrying the red 24/7 Emergency badge. It is shown in a square frame by default; the “Frame shape” control below the upload can change that, or show the photo uncropped.",
    }),
    defineField({
      name: "heritagePhotoSubject",
      title: "Intended heritage-photo subject",
      description:
        "What the photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
    defineField({
      name: "communitiesHeading",
      title: "Communities band heading",
      description: "e.g. “Proudly Serving Dallas and Surrounding Communities”.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "communitiesBody",
      title: "Communities paragraph",
      description: "One paragraph naming the nearby areas this city page covers.",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
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
    defineField({
      name: "showLogoStrip",
      title: "Show the logo strip",
      description:
        "Shows the association/vendor logo row (from Partners & Vendor Systems) above the closing call-to-action.",
      type: "boolean",
      initialValue: true,
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
