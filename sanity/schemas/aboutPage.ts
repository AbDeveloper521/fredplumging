import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { defaultAboutSections } from "@/data/aboutPage";
import { imageWithAlt } from "./fields";
import { sectionsField } from "./sectionLibrary";

/**
 * The About page as an orderable section stack — same architecture as the
 * homepage and the service pages. One object type per About band; the
 * `aboutPage` singleton holds an array of them, so the owner gets add,
 * remove, duplicate and drag-reorder natively in Studio, plus a per-section
 * "Hide" toggle. The stack also accepts the shared library types (Icon Card,
 * reviews, map band, closing CTA) — reused, not forked.
 *
 * TypeScript twins live in `data/aboutPage.ts`; mapping in
 * `sanity/lib/sectionLibrary.ts`; rendering in
 * `components/sections/SectionRenderer.tsx`.
 *
 * Derived, never stored: the hero credential chips (licence, years, service
 * area) and the story badge's "Since {year}" title come from Site Settings.
 */

const VALUE_ICONS: Array<{ title: string; value: NavIconName }> = [
  { title: "Award (professionalism)", value: "award" },
  { title: "Shield check (integrity)", value: "shield-check" },
  { title: "Clock (reliability)", value: "clock" },
  { title: "Siren (safety)", value: "siren" },
  { title: "Wrench (licensed team)", value: "wrench" },
  { title: "Office building (vendor portals)", value: "building-2" },
  { title: "Heart handshake", value: "heart-handshake" },
];

/** `rule.required()` alone accepts whitespace — refuse it at publish time. */
const notJustSpaces = (message: string) => (value?: string) =>
  value === undefined || value === null || value.trim() !== "" ? true : message;

function requiredString(name: string, title: string, description: string, errorMessage: string) {
  return defineField({
    name,
    title,
    description,
    type: "string",
    validation: (rule) =>
      rule.required().error(errorMessage).custom(notJustSpaces(errorMessage)),
  });
}

function optionalString(name: string, title: string, description: string) {
  return defineField({
    name,
    title,
    description,
    type: "string",
    validation: (rule) =>
      rule.custom(notJustSpaces("Write real text or clear the field — spaces alone don't count.")),
  });
}

function paragraphsField(name: string, title: string, description: string) {
  return defineField({
    name,
    title,
    description,
    type: "array",
    of: [defineArrayMember({ type: "text", rows: 5 })],
  });
}

/** Every section type carries the same hide toggle. */
function hiddenField() {
  return defineField({
    name: "hidden",
    title: "Hide this section",
    description:
      "Keeps the content but stops showing it on the site. Untick to bring it back exactly as it was.",
    type: "boolean",
    initialValue: false,
  });
}

function photoSubjectField(name: string, description: string) {
  return defineField({
    name,
    title: "Intended photo subject",
    description: `${description} Shown inside the styled placeholder until a real photo is uploaded.`,
    type: "string",
  });
}

function sectionPreview(bandTitle: string) {
  return {
    select: { heading: "heading", hidden: "hidden" },
    prepare: ({ heading, hidden }: { heading?: string; hidden?: boolean }) => ({
      title: `${hidden ? "🚫 " : ""}${bandTitle}`,
      subtitle: hidden ? "HIDDEN — not shown on the site" : heading,
    }),
  };
}

export const aboutHero = defineType({
  name: "aboutHero",
  title: "About banner (hero)",
  type: "object",
  description:
    "The dark banner at the top: small label, big heading, intro paragraphs. The credential chips (licence, years, service area) come from Site Settings.",
  fields: [
    requiredString(
      "heading",
      "Big heading",
      "The page's one H1, e.g. “About Fred's Plumbing”.",
      "The banner can't render without its heading.",
    ),
    optionalString(
      "eyebrow",
      "Small label above the heading",
      "Tiny uppercase label, e.g. “Fred's Plumbing”.",
    ),
    paragraphsField(
      "paragraphs",
      "Intro paragraphs",
      "The paragraphs under the heading. One entry per paragraph.",
    ),
    defineField({
      name: "showCredentials",
      title: "Show the credential chips",
      description:
        "The row of chips under the intro — licence number, years in business, 24/7 dispatch, service area. Their wording comes from Site Settings; this only shows or hides the row.",
      type: "boolean",
      initialValue: true,
    }),
    hiddenField(),
  ],
  preview: sectionPreview("About banner (hero)"),
});

export const aboutStory = defineType({
  name: "aboutStory",
  title: "Story band",
  type: "object",
  description:
    "Copy left, two-photo collage right. The red badge's “Since 1996” year comes from Site Settings — only the line under it lives here.",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “Committed to Quality and Service Since 1996”.",
      "The section needs a heading.",
    ),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Our Story”."),
    paragraphsField(
      "paragraphs",
      "Story paragraphs",
      "The founder/history copy. One entry per paragraph.",
    ),
    optionalString(
      "badgeSubtitle",
      "Red badge — line under the year",
      "e.g. “Family and employee owned”. The “Since 1996” year itself comes from Site Settings.",
    ),
    imageWithAlt({
      name: "photoPrimary",
      title: "Main photo",
      description:
        "The large photo in the collage. The “Frame shape” control below the upload can change the frame's shape or show the photo uncropped.",
    }),
    photoSubjectField("photoSubjectPrimary", "What the main photo should eventually show."),
    imageWithAlt({
      name: "photoSecondary",
      title: "Small overlapping photo",
      description:
        "The smaller photo overlapping the main one. Its frame is fixed so the overlap composition holds — drag the hotspot circle (click the image → Edit hotspot) over the part that must stay visible.",
      // Same overlap composition as the homepage collage — no override.
      frameRatio: false,
    }),
    photoSubjectField("photoSubjectSecondary", "What the small photo should eventually show."),
    hiddenField(),
  ],
  preview: sectionPreview("Story band"),
});

export const aboutEvolution = defineType({
  name: "aboutEvolution",
  title: "Evolution band (dark)",
  type: "object",
  description: "The dark band: growth/today copy left, one large photo right.",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “Evolving to Meet the Needs of a Growing Region”.",
      "The section needs a heading.",
    ),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Then and Now”."),
    paragraphsField(
      "paragraphs",
      "Paragraphs",
      "The growth/today copy. One entry per paragraph.",
    ),
    imageWithAlt({
      name: "photo",
      title: "Photo",
      description:
        "The single large photo beside the copy. The “Frame shape” control below the upload can change the frame's shape or show the photo uncropped.",
    }),
    photoSubjectField("photoSubject", "What the photo should eventually show."),
    hiddenField(),
  ],
  preview: sectionPreview("Evolution band (dark)"),
});

export const valuesGrid = defineType({
  name: "valuesGrid",
  title: "Values grid",
  type: "object",
  description: "The “What We Stand For” card grid: icon, label, one line each.",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “What We Stand For”.",
      "The section needs a heading.",
    ),
    optionalString("eyebrow", "Small label above the heading", "e.g. “How We Work”."),
    defineField({
      name: "values",
      title: "Values",
      description:
        "Four to six cards, each a quality the copy above actually claims — don't invent new ones to fill the grid.",
      type: "array",
      of: [
        defineArrayMember({
          name: "value",
          title: "Value",
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              description: "Small symbol on the card. Leave empty to use the wrench icon.",
              type: "string",
              options: { list: VALUE_ICONS },
            }),
            requiredString("title", "Label", "e.g. “Professionalism”.", "The card needs its label."),
            defineField({
              name: "description",
              title: "One line",
              type: "text",
              rows: 2,
              validation: (rule) =>
                rule
                  .required()
                  .error("The card needs its line of text.")
                  .custom(notJustSpaces("The card needs its line of text.")),
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        }),
      ],
      validation: (rule) => rule.min(4).max(6),
    }),
    hiddenField(),
  ],
  preview: sectionPreview("Values grid"),
});

export const pageLinks = defineType({
  name: "pageLinks",
  title: "Page links",
  type: "object",
  description: "Closing link cards to related pages (Partners, Careers, Testimonials).",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “Where to Next”.",
      "The section needs a heading.",
    ),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Keep Exploring”."),
    defineField({
      name: "links",
      title: "Link cards",
      description: "One card per page.",
      type: "array",
      of: [
        defineArrayMember({
          name: "link",
          title: "Link card",
          type: "object",
          fields: [
            requiredString("title", "Title", "e.g. “Careers”.", "The card needs a title."),
            defineField({
              name: "description",
              title: "One line of context",
              type: "text",
              rows: 2,
              validation: (rule) =>
                rule
                  .required()
                  .error("The card needs its line of context.")
                  .custom(notJustSpaces("The card needs its line of context.")),
            }),
            defineField({
              name: "href",
              title: "Page",
              description: "A page on this site, starting with a slash — e.g. /about/partners.",
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
          ],
          preview: { select: { title: "title", subtitle: "href" } },
        }),
      ],
    }),
    hiddenField(),
  ],
  preview: sectionPreview("Page links"),
});

export const aboutSectionTypes = [
  aboutHero,
  aboutStory,
  aboutEvolution,
  valuesGrid,
  pageLinks,
];

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    sectionsField({
      title: "About-page sections",
      description:
        "The About page, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it.",
    }),
  ],
  // The Studio document starts prefilled with the shipped stack, so the
  // owner's first edit starts from the real page instead of an empty list.
  // JSON round-trip strips the `undefined`s (unset photos).
  initialValue: JSON.parse(JSON.stringify({ sections: defaultAboutSections })),
  preview: {
    prepare: () => ({ title: "About Page" }),
  },
});
