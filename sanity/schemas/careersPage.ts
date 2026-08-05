import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { defaultCareersSections } from "@/data/careersPage";
import { imageWithAlt } from "./fields";

/**
 * The Careers page (/about/careers) as an orderable section stack — same
 * architecture as the other page stacks. The shipped stack is the owner's
 * three-band reference (hero, values, job openings); the previous page's
 * extra bands (traits, hiring process, closing CTA) keep their types here
 * so the owner can re-add them with one click. The stack also accepts the
 * shared library types (Icon Card, reviews, map band, closing CTA).
 *
 * TypeScript twins live in `data/careersPage.ts`; mapping in
 * `sanity/lib/careersSections.ts`; rendering in
 * `components/sections/CareersSectionRenderer.tsx`.
 *
 * Collection-driven: the job cards come from Job Postings — never duplicate
 * job content into this document. Applications stay mailto-only (no form
 * backend).
 */

const VALUE_ICONS: Array<{ title: string; value: NavIconName }> = [
  { title: "Graduation cap (training / development)", value: "graduation-cap" },
  { title: "People (team culture)", value: "users" },
  { title: "Shield check (trust / impact)", value: "shield-check" },
  { title: "Heart handshake (respect)", value: "heart-handshake" },
  { title: "Award (pride in the work)", value: "award" },
  { title: "Wrench (the trade)", value: "wrench" },
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

function optionalText(name: string, title: string, description: string, rows = 3) {
  return defineField({
    name,
    title,
    description,
    type: "text",
    rows,
    validation: (rule) =>
      rule.custom(notJustSpaces("Write real text or clear the field — spaces alone don't count.")),
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

function sectionPreview(bandTitle: string) {
  return {
    select: { heading: "heading", hidden: "hidden" },
    prepare: ({ heading, hidden }: { heading?: string; hidden?: boolean }) => ({
      title: `${hidden ? "🚫 " : ""}${bandTitle}`,
      subtitle: hidden ? "HIDDEN — not shown on the site" : heading,
    }),
  };
}

export const careersHero = defineType({
  name: "careersHero",
  title: "Top banner (hero)",
  type: "object",
  description:
    "The dark banner at the top: small label, big heading, the hiring-voice paragraphs, and an optional background photo.",
  fields: [
    requiredString(
      "heading",
      "Big heading",
      "The page's one H1, e.g. “Careers at Fred's Plumbing”.",
      "The banner can't render without its heading.",
    ),
    optionalString(
      "eyebrow",
      "Small label above the heading",
      "Tiny uppercase label, e.g. “Fred's Plumbing”.",
    ),
    defineField({
      name: "paragraphs",
      title: "Intro paragraphs",
      description:
        "The hiring-voice paragraphs under the heading, one entry per paragraph. This is the owner's own copy — keep the wording.",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 6 })],
    }),
    imageWithAlt({
      name: "photo",
      title: "Background photo",
      description:
        "The photo BEHIND the banner — it fills the whole width of the dark band, darkened so the text stays readable. Wide, landscape photos work best (a crew or truck shot). Until one is uploaded the site shows the styled dark background. Drag the hotspot circle (click the image → Edit hotspot) over the part that must stay visible — the banner crops wide, so the hotspot matters here.",
      // The background crop is load-bearing — no frame-shape override.
      frameRatio: false,
    }),
    defineField({
      name: "darkOverlay",
      title: "Dark overlay over the photo",
      description:
        "Keeps text readable over bright photos. Turn this off only if your image is already dark or has its own overlay — the text must stay readable.",
      type: "boolean",
      initialValue: true,
    }),
    hiddenField(),
  ],
  preview: sectionPreview("Top banner (hero)"),
});

export const careerValues = defineType({
  name: "careerValues",
  title: "Values band",
  type: "object",
  description:
    "The dark band of three cards — what working here is like. Icon, title, and a sentence or two each.",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “A Company That Values Your Growth and Commitment”.",
      "The section needs a heading.",
    ),
    optionalString("eyebrow", "Small label above the heading", "Leave empty for none."),
    defineField({
      name: "items",
      title: "Value cards",
      description: "Three cards fill the row on desktop.",
      type: "array",
      of: [
        defineArrayMember({
          name: "item",
          title: "Value card",
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              description: "Small symbol in the red chip. Leave empty to use the wrench icon.",
              type: "string",
              options: { list: VALUE_ICONS },
            }),
            requiredString("title", "Title", "Short, e.g. “Strong Team Culture”.", "The card needs a title."),
            defineField({
              name: "description",
              title: "Description",
              description: "One or two sentences under the title.",
              type: "text",
              rows: 3,
              validation: (rule) =>
                rule
                  .required()
                  .error("The card needs its description.")
                  .custom(notJustSpaces("The card needs its description.")),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
            prepare: ({ title, subtitle }) => ({ title: title ?? "Value card", subtitle }),
          },
        }),
      ],
    }),
    hiddenField(),
  ],
  preview: sectionPreview("Values band"),
});

export const jobOpenings = defineType({
  name: "jobOpenings",
  title: "Job openings",
  type: "object",
  description:
    "The open-roles card grid. The jobs themselves are managed under Careers in the sidebar — never write job content here. Only the heading lives in this item.",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “Work With a Company That Invests in Your Success”.",
      "The section needs a heading.",
    ),
    hiddenField(),
  ],
  preview: sectionPreview("Job openings"),
});

export const careerTraits = defineType({
  name: "careerTraits",
  title: "Traits band (retired from the default page)",
  type: "object",
  description:
    "The dark “What We Look For” trait grid from the earlier careers page — add it back here if the owner wants it again.",
  fields: [
    requiredString("heading", "Heading", "e.g. “What We Look For”.", "The section needs a heading."),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Who Thrives Here”."),
    optionalText("description", "Paragraph", "The hiring-philosophy paragraph under the heading.", 4),
    defineField({
      name: "traits",
      title: "Traits",
      description: "One card per trait — short name plus a one-line gloss.",
      type: "array",
      of: [
        defineArrayMember({
          name: "trait",
          title: "Trait",
          type: "object",
          fields: [
            requiredString("name", "Trait", "e.g. “Ownership mindset”.", "The trait needs its name."),
            requiredString("gloss", "One line", "e.g. “Treats every job as theirs to finish right.”", "The trait needs its line."),
          ],
          preview: { select: { title: "name", subtitle: "gloss" } },
        }),
      ],
    }),
    optionalString(
      "quote",
      "Closing line",
      "Rendered in quotes under the grid, e.g. “Respect and communication are essential at Fred's.” Leave empty to hide.",
    ),
    hiddenField(),
  ],
  preview: sectionPreview("Traits band"),
});

export const hiringProcess = defineType({
  name: "hiringProcess",
  title: "Hiring process (retired from the default page)",
  type: "object",
  description:
    "The numbered hiring-steps band from the earlier careers page — add it back here if the owner wants it again. Step numbers are automatic.",
  fields: [
    requiredString("heading", "Heading", "e.g. “How Hiring Works”.", "The section needs a heading."),
    defineField({
      name: "steps",
      title: "Steps",
      description: "In order. Four fit the row on desktop.",
      type: "array",
      of: [
        defineArrayMember({
          name: "step",
          title: "Step",
          type: "object",
          fields: [
            requiredString("title", "Title", "One word or two, e.g. “Ride along”.", "The step needs a title."),
            defineField({
              name: "description",
              title: "Description",
              description: "One or two sentences.",
              type: "text",
              rows: 3,
              validation: (rule) =>
                rule
                  .required()
                  .error("The step needs its description.")
                  .custom(notJustSpaces("The step needs its description.")),
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        }),
      ],
    }),
    hiddenField(),
  ],
  preview: sectionPreview("Hiring process"),
});

export const careersCta = defineType({
  name: "careersCta",
  title: "Careers closing band (retired from the default page)",
  type: "object",
  description:
    "The dark closing band with the email and call buttons (both come from Site Settings) — add it back here if the owner wants it again.",
  fields: [
    requiredString("heading", "Heading", "e.g. “Think You Belong on This Team?”", "The section needs a heading."),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Join the Team”."),
    optionalText("description", "Paragraph", "One or two sentences under the heading.", 3),
    hiddenField(),
  ],
  preview: sectionPreview("Careers closing band"),
});

export const careersSectionTypes = [
  careersHero,
  careerValues,
  jobOpenings,
  careerTraits,
  hiringProcess,
  careersCta,
];

/**
 * Shared library types the Careers stack also accepts — the same object
 * types the other stacks use, so a section edited here behaves identically
 * everywhere.
 */
const SHARED_CAREERS_SECTION_TYPES = [
  "iconCardSection",
  "serviceTestimonials",
  "homeLocationMap",
  "homeFinalCta",
];

export const careersPage = defineType({
  name: "careersPage",
  title: "Careers Page",
  type: "document",
  fields: [
    defineField({
      name: "sections",
      title: "Careers-page sections",
      description:
        "The Careers page, top to bottom. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it.",
      type: "array",
      of: [
        ...careersSectionTypes.map((type) => ({ type: type.name })),
        ...SHARED_CAREERS_SECTION_TYPES.map((type) => ({ type })),
      ],
    }),
  ],
  // The Studio document starts prefilled with the shipped three-band stack.
  // JSON round-trip strips the `undefined`s (the empty hero photo slot).
  initialValue: JSON.parse(JSON.stringify({ sections: defaultCareersSections })),
  preview: {
    prepare: () => ({ title: "Careers Page" }),
  },
});
