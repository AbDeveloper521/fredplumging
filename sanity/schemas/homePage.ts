import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { homePage as fallback } from "@/data/homePage";
import { imageWithAlt } from "./fields";

/**
 * Singleton mirroring `data/homePage.ts` exactly — the homepage's editable
 * section copy, one collapsible object per band. Built now, populated later
 * (standing rule): the homepage falls back to the static data until this
 * document is published, and field-by-field afterwards.
 *
 * NOT here (they already have homes): trust logos, services, property
 * types, testimonials, FAQs, and every business fact in Site Settings
 * (phone, cities, founded year, years in business).
 */

const HOME_ICONS: Array<{ title: string; value: NavIconName }> = [
  { title: "Clock (24/7 / response times)", value: "clock" },
  { title: "Shield check (licensed / compliance)", value: "shield-check" },
  { title: "Map pin (service area)", value: "map-pin" },
  { title: "Truck (dispatch)", value: "truck" },
  { title: "Speech bubble (communication)", value: "message-square" },
  { title: "Wrench (repairs)", value: "wrench" },
  { title: "Office building (commercial)", value: "building-2" },
  { title: "Clipboard check (vendor compliance)", value: "clipboard-check" },
  { title: "Calendar check (maintenance)", value: "calendar-check" },
  { title: "Phone call (contact)", value: "phone-call" },
  { title: "Magnifier check (assessment)", value: "search-check" },
  { title: "File check (documentation)", value: "file-check-2" },
  { title: "Warning triangle (problem)", value: "alert-triangle" },
  { title: "Lightbulb (solution)", value: "lightbulb" },
  { title: "Trending up (outcome)", value: "trending-up" },
  { title: "Award (experience)", value: "award" },
  { title: "Siren (emergency)", value: "siren" },
  { title: "Droplets (leaks / water)", value: "droplets" },
  { title: "Waves (drains / sewer)", value: "waves" },
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

function iconField(description: string) {
  return defineField({
    name: "icon",
    title: "Icon",
    // Optional by design: the site falls back to the wrench icon, so an
    // empty pick can never block a publish or drop the row.
    description: `${description} Leave empty to use the wrench icon.`,
    type: "string",
    options: { list: HOME_ICONS },
  });
}

/** Array of { icon, label } rows (hero trust strip, emergency benefits). */
function iconLabelArray(name: string, title: string, description: string) {
  return defineField({
    name,
    title,
    description,
    type: "array",
    of: [
      defineArrayMember({
        name: "item",
        title: "Item",
        type: "object",
        fields: [
          iconField("Small symbol next to the text."),
          requiredString("label", "Text", "A few words.", "The item needs its text."),
        ],
        preview: {
          select: { title: "label" },
          prepare: ({ title }) => ({ title: title ?? "Item" }),
        },
      }),
    ],
  });
}

/** Array of { icon, title, description } rows (features, steps). */
function iconItemArray(name: string, title: string, description: string) {
  return defineField({
    name,
    title,
    description,
    type: "array",
    of: [
      defineArrayMember({
        name: "item",
        title: "Item",
        type: "object",
        fields: [
          iconField("Small symbol next to the title."),
          requiredString("title", "Title", "Bold row title.", "The row needs a title."),
          defineField({
            name: "description",
            title: "Description",
            description: "One or two sentences under the title.",
            type: "text",
            rows: 3,
            validation: (rule) =>
              rule
                .required()
                .error("The row needs its description.")
                .custom(notJustSpaces("The row needs its description.")),
          }),
        ],
        preview: {
          select: { title: "title", subtitle: "description" },
          prepare: ({ title, subtitle }) => ({ title: title ?? "Item", subtitle }),
        },
      }),
    ],
  });
}

function stringArray(name: string, title: string, description: string) {
  return defineField({
    name,
    title,
    description,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
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

const collapsed = { collapsible: true, collapsed: true } as const;

/** Attaches `_key`s so array items land in Studio-ready shape. */
const keyed = <T extends object>(items: readonly T[]) =>
  items.map((item, i) => ({ _key: `item-${i}`, ...item }));

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "1 · Top banner (hero)",
      description:
        "The dark banner at the very top: headline, intro, trust strip. The buttons, phone number, and the years figure come from Site Settings.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString(
          "headingBefore",
          "Headline — first part",
          "The start of the big headline, shown in white, e.g. “Reliable Plumbing Solutions for”.",
          "The homepage can't render without its headline.",
        ),
        optionalString(
          "headingHighlight",
          "Headline — red words",
          "The words shown in red inside the headline, e.g. “Dallas–Fort Worth”. Leave empty for an all-white headline.",
        ),
        optionalString(
          "headingAfter",
          "Headline — last part",
          "The end of the headline, back in white, e.g. “Properties”. Leave empty to end on the red words.",
        ),
        optionalText(
          "subcopy",
          "Intro paragraph",
          "Two or three sentences under the headline saying what the company does and for whom.",
          4,
        ),
        optionalString(
          "eyebrow",
          "Small label above the headline",
          "Tiny uppercase label, e.g. “Commercial & Multi-Family Plumbing Experts”.",
        ),
        iconLabelArray(
          "trustIndicators",
          "Trust strip",
          "The row of proof points under the buttons, e.g. “24/7 Emergency Response”. Three items look best. Write {foundedYear} where the founding year goes — it's filled in from Site Settings.",
        ),
        optionalString(
          "experienceBadgeLabel",
          "Experience badge — line under the years",
          "The small line inside the badge, e.g. “Serving DFW property teams”. The “30+ Years” figure above it comes from Site Settings automatically.",
        ),
      ],
    }),
    defineField({
      name: "about",
      title: "2 · About band",
      description:
        "Photo collage on the left, company story on the right, metrics row underneath. The red badge's “Since 1996” line and the years metric come from Site Settings.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString("heading", "Heading", "e.g. “Commercial Plumbing Expertise Since 1996”.", "The section needs a heading."),
        optionalString("eyebrow", "Small label above the heading", "e.g. “Built on Experience. Trusted Across DFW.”"),
        optionalText("description", "Paragraph", "The company story under the heading.", 5),
        stringArray(
          "highlights",
          "Checkmark list",
          "Short bullet lines with red checkmarks, e.g. “Commercial and multi-family specialists”. Three read best.",
        ),
        optionalString(
          "badgeSubtitle",
          "Red badge — line under “Since 1996”",
          "e.g. “Family-owned & operated”. The year itself comes from Site Settings.",
        ),
        defineField({
          name: "metrics",
          title: "Metrics row",
          description:
            "The stat cards under the section. Four fill the row on desktop.",
          type: "array",
          of: [
            defineArrayMember({
              name: "metric",
              title: "Metric",
              type: "object",
              fields: [
                iconField("Small symbol above the number."),
                defineField({
                  name: "value",
                  title: "Big number",
                  description:
                    "e.g. “24/7” or “100%”. LEAVE EMPTY to show the years-in-business figure calculated from Site Settings (recommended for the experience metric — it updates itself every year).",
                  type: "string",
                  validation: (rule) =>
                    rule.custom(notJustSpaces("Write real text or clear the field — spaces alone don't count.")),
                }),
                requiredString("label", "Label", "The line under the number, e.g. “Years of Experience”.", "The metric needs its label."),
              ],
              preview: {
                select: { title: "label", subtitle: "value" },
                prepare: ({ title, subtitle }) => ({
                  title: title ?? "Metric",
                  subtitle: subtitle ?? "(years in business, from Site Settings)",
                }),
              },
            }),
          ],
        }),
        imageWithAlt({
          name: "primaryPhoto",
          title: "Main photo",
          description: "The large photo in the collage, behind the red badge.",
        }),
        photoSubjectField("primaryPhotoSubject", "What the main photo should eventually show."),
        imageWithAlt({
          name: "secondaryPhoto",
          title: "Small overlapping photo",
          description: "The smaller photo overlapping the main one.",
        }),
        photoSubjectField("secondaryPhotoSubject", "What the small photo should eventually show."),
      ],
    }),
    defineField({
      name: "emergency",
      title: "3 · Emergency band",
      description:
        "The dark 24/7 band with the big phone number. The number itself comes from Site Settings.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString("heading", "Heading", "e.g. “Plumbing Emergency? Our Team Is Ready 24/7.”", "The section needs a heading."),
        optionalString("eyebrow", "Small label above the heading", "e.g. “Available Day and Night”."),
        optionalText("body", "Paragraph", "One or two sentences on what counts as an emergency.", 3),
        iconLabelArray(
          "benefits",
          "Benefit list",
          "Short proof points under the phone number, e.g. “Fast dispatch”. Four fill the grid (2 × 2).",
        ),
        imageWithAlt({
          name: "photo",
          title: "Photo",
          description: "The tall photo on the right of the band. Vertical orientation works best.",
        }),
        photoSubjectField("photoSubject", "What the photo should eventually show."),
        optionalString(
          "photoCaption",
          "White card on the photo",
          "The line in the small white card overlapping the photo, e.g. “Crews on call across DFW right now”.",
        ),
      ],
    }),
    defineField({
      name: "whyChooseUs",
      title: "4 · Why choose us",
      description: "The sticky intro column with the stacked feature rows.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString("heading", "Heading", "e.g. “Dependable Service Without the Guesswork”.", "The section needs a heading."),
        optionalString("eyebrow", "Small label above the heading", "e.g. “Why Property Managers Choose Fred's”."),
        optionalText("description", "Paragraph", "The intro under the heading.", 4),
        iconItemArray(
          "features",
          "Feature rows",
          "One row per reason, stacked on the right. Six read best.",
        ),
        imageWithAlt({
          name: "photo",
          title: "Photo",
          description: "The photo under the intro column (desktop only).",
        }),
        photoSubjectField("photoSubject", "What the photo should eventually show."),
        optionalString(
          "photoCaption",
          "White card on the photo",
          "The line in the small white card on the photo. Write {yearsInBusiness} where the years figure goes — it's filled in from Site Settings, e.g. “{yearsInBusiness} years of repeat commercial clients”.",
        ),
      ],
    }),
    defineField({
      name: "process",
      title: "5 · How it works",
      description: "The numbered four-step timeline. Step numbers (01, 02, …) are automatic.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString("heading", "Heading", "e.g. “A Straightforward Service Process”.", "The section needs a heading."),
        optionalString("eyebrow", "Small label above the heading", "e.g. “How It Works”."),
        iconItemArray("steps", "Steps", "In order. Four fit the row on desktop."),
      ],
    }),
    defineField({
      name: "compliance",
      title: "6 · Vendor compliance band",
      description:
        "The dark compliance band. Only the copy lives here — the logo strip underneath is managed under Partners & Vendor Systems.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString("heading", "Heading", "e.g. “Approved Across Leading Property Management Systems”.", "The section needs a heading."),
        optionalString("eyebrow", "Small label above the heading", "e.g. “Vendor-Ready and Fully Compliant”."),
        optionalText("description", "Paragraph", "The copy under the heading.", 4),
        stringArray(
          "items",
          "Checkmark list",
          "Short compliance items, e.g. “Insurance verification”. Six fill the grid (2 × 3).",
        ),
      ],
    }),
    defineField({
      name: "caseStudy",
      title: "7 · Service scenario",
      description: "The Problem / Solution / Outcome story with the property photo.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString("heading", "Heading", "e.g. “Responsive Plumbing Support That Protects Your Property”.", "The section needs a heading."),
        optionalString("eyebrow", "Small label above the heading", "e.g. “Proven in the Field”."),
        optionalString("badgeLabel", "Grey badge above the heading", "e.g. “Representative service scenario”."),
        defineField({
          name: "storyBlocks",
          title: "Story blocks",
          description: "The Problem / Solution / Outcome cards, in order.",
          type: "array",
          of: [
            defineArrayMember({
              name: "storyBlock",
              title: "Block",
              type: "object",
              fields: [
                iconField("Small symbol in the red chip."),
                requiredString("label", "Label", "The small red word, e.g. “Problem”.", "The block needs its label."),
                defineField({
                  name: "copy",
                  title: "Text",
                  description: "One or two sentences.",
                  type: "text",
                  rows: 3,
                  validation: (rule) =>
                    rule
                      .required()
                      .error("The block needs its text.")
                      .custom(notJustSpaces("The block needs its text.")),
                }),
              ],
              preview: {
                select: { title: "label", subtitle: "copy" },
                prepare: ({ title, subtitle }) => ({ title: title ?? "Block", subtitle }),
              },
            }),
          ],
        }),
        imageWithAlt({
          name: "photo",
          title: "Photo",
          description: "The property photo on the left of the story.",
        }),
        photoSubjectField("photoSubject", "What the photo should eventually show."),
        optionalString(
          "photoCardTitle",
          "Dark card on the photo — first line",
          "e.g. “240-unit apartment community”.",
        ),
        optionalString(
          "photoCardSubtitle",
          "Dark card on the photo — second line",
          "e.g. “Dallas, TX”.",
        ),
      ],
    }),
    defineField({
      name: "serviceArea",
      title: "8 · Service area",
      description:
        "Where we work. The city chips and the map come from Site Settings and the design — only the copy lives here.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString("heading", "Heading", "e.g. “Proudly Serving the Dallas–Fort Worth Metroplex”.", "The section needs a heading."),
        optionalString("eyebrow", "Small label above the heading", "e.g. “Where We Work”."),
        optionalText("description", "Paragraph", "One sentence under the heading.", 3),
        optionalText(
          "calloutBody",
          "Red-edged callout box",
          "The paragraph in the box under the city chips, e.g. the “not sure whether we serve your area?” reassurance.",
          3,
        ),
      ],
    }),
    defineField({
      name: "finalCta",
      title: "9 · Closing call-to-action",
      description:
        "The dark closing band with the quote form. Buttons and the phone number come from Site Settings.",
      type: "object",
      options: collapsed,
      fields: [
        requiredString("heading", "Heading", "e.g. “Schedule Commercial Plumbing Service Today”.", "The section needs a heading."),
        optionalString("eyebrow", "Small label above the heading", "e.g. “Let's Solve the Problem”."),
        optionalText("description", "Paragraph", "One or two sentences under the heading.", 3),
        optionalText(
          "reassurance",
          "Phone reassurance line",
          "The line in the bordered box. Write {phone} where the number goes — it becomes a clickable phone link, e.g. “… around the clock — {phone}, 24 hours a day.”",
          3,
        ),
      ],
    }),
  ],
  // The Studio document starts prefilled with the shipped copy, so the
  // owner's first edit starts from the real text instead of blank fields.
  // JSON round-trip strips the `undefined`s (unset metric values, photos).
  initialValue: JSON.parse(
    JSON.stringify({
      hero: {
        ...fallback.hero,
        trustIndicators: keyed(fallback.hero.trustIndicators),
      },
      about: {
        ...fallback.about,
        highlights: [...fallback.about.highlights],
        metrics: keyed(fallback.about.metrics),
      },
      emergency: {
        ...fallback.emergency,
        benefits: keyed(fallback.emergency.benefits),
      },
      whyChooseUs: {
        ...fallback.whyChooseUs,
        features: keyed(fallback.whyChooseUs.features),
      },
      process: {
        ...fallback.process,
        steps: keyed(fallback.process.steps),
      },
      compliance: {
        ...fallback.compliance,
        items: [...fallback.compliance.items],
      },
      caseStudy: {
        ...fallback.caseStudy,
        storyBlocks: keyed(fallback.caseStudy.storyBlocks),
      },
      serviceArea: { ...fallback.serviceArea },
      finalCta: { ...fallback.finalCta },
    }),
  ),
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
