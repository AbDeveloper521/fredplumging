import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { imageWithAlt } from "./fields";

/**
 * The constrained section library for service pages.
 *
 * Each object type below is one section a service page can include, in any
 * order, each individually omittable. TypeScript twins live in
 * `data/serviceSections.ts`; the render components in `components/sections/`.
 * Previews are written so the Sections list reads like a page outline
 * ("Signs You Need — 4 cards"), never "Object".
 */

/** Icon dropdown constrained to the single site-wide icon registry. */
function iconField(options: { description: string; choices: Array<{ title: string; value: NavIconName }> }) {
  return defineField({
    name: "icon",
    title: "Icon",
    description: options.description,
    type: "string",
    options: { list: options.choices },
    validation: (rule) => rule.required().error("Pick an icon so the row doesn't render with an empty box."),
  });
}

const GENERAL_ICONS: Array<{ title: string; value: NavIconName }> = [
  { title: "Droplets (leaks / water)", value: "droplets" },
  { title: "Wrench (repairs)", value: "wrench" },
  { title: "Office building (commercial)", value: "building-2" },
  { title: "Flame (water heaters)", value: "flame" },
  { title: "Shield check (compliance)", value: "shield-check" },
  { title: "Calendar check (maintenance)", value: "calendar-check" },
  { title: "Gauge (water pressure)", value: "gauge" },
  { title: "Waves (drains / sewer)", value: "waves" },
  { title: "Siren (emergency)", value: "siren" },
  { title: "Clock (response times)", value: "clock" },
  { title: "Award (experience)", value: "award" },
  { title: "Gear (equipment / technology)", value: "cog" },
  { title: "Map pin (service area)", value: "map-pin" },
];

const PROPERTY_ICONS: Array<{ title: string; value: NavIconName }> = [
  { title: "Building (apartments)", value: "building" },
  { title: "Hotel (condos)", value: "hotel" },
  { title: "Heart handshake (assisted living)", value: "heart-handshake" },
  { title: "Stethoscope (nursing homes)", value: "stethoscope" },
];

function requiredString(name: string, title: string, description: string, errorMessage: string) {
  return defineField({
    name,
    title,
    description,
    type: "string",
    validation: (rule) => rule.required().error(errorMessage),
  });
}

function requiredText(name: string, title: string, description: string, errorMessage: string, rows = 3) {
  return defineField({
    name,
    title,
    description,
    type: "text",
    rows,
    validation: (rule) => rule.required().error(errorMessage),
  });
}

const internalHref = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: "string",
    validation: (rule) =>
      rule
        .required()
        .error("The button needs a page to go to — usually /contact.")
        .custom((value?: string) =>
          value?.startsWith("/")
            ? true
            : "Use a page on this site, starting with a slash — e.g. /contact.",
        ),
  });

export const serviceHero = defineType({
  name: "serviceHero",
  title: "Top banner (hero)",
  type: "object",
  description: "The dark banner at the very top of the page: big heading, intro, call buttons, credentials strip.",
  fields: [
    requiredString(
      "heading",
      "Big heading",
      "The main page headline, e.g. “Plumbing Services In The Dallas–Fort Worth Metroplex”. This is the page's one H1 — search engines weigh it heavily.",
      "The page can't render without its main headline.",
    ),
    requiredText(
      "subheading",
      "Intro paragraph",
      "Two or three sentences under the heading saying what this service is and who it's for.",
      "Visitors need one paragraph of context under the headline.",
    ),
    requiredString(
      "secondaryCtaLabel",
      "Second button text",
      "The outlined button next to the red call button, e.g. “Request a Property Assessment”. Keep every button label on the page different.",
      "The second button needs its own label.",
    ),
    internalHref(
      "secondaryCtaHref",
      "Second button link",
      "Where the second button goes — usually /contact.",
    ),
    defineField({
      name: "credentials",
      title: "Credentials strip",
      description:
        "The slim row of proof points under the buttons, e.g. “Licensed & Insured”. Three items look best.",
      type: "array",
      of: [
        defineArrayMember({
          name: "credential",
          title: "Credential",
          type: "object",
          fields: [
            iconField({ description: "Small symbol next to the credential.", choices: GENERAL_ICONS }),
            requiredString("label", "Text", "A few words, e.g. “Licensed & Insured”.", "The credential needs its text."),
          ],
          preview: {
            select: { title: "label" },
            prepare: ({ title }) => ({ title: title ?? "Credential" }),
          },
        }),
      ],
      validation: (rule) => rule.max(4).error("Keep the strip to at most 4 items so it stays on one line."),
    }),
    defineField({
      name: "eyebrow",
      title: "Small label above the heading",
      description: "Tiny uppercase label above the headline, e.g. “FRED'S PLUMBING”. Leave empty to hide.",
      type: "string",
    }),
    defineField({
      name: "phoneCtaLabel",
      title: "Call-button text",
      description:
        "Text on the red call button. Write {phone} where the number goes — it's filled in from Site Settings, e.g. “Emergency? Call {phone}”. Leave empty for “Call 24/7: {phone}”.",
      type: "string",
    }),
    defineField({
      name: "showAvailabilityDot",
      title: "Show the pulsing availability dot",
      description:
        "Adds the small pulsing red dot next to the first credential — use on pages where 24/7 availability is the message.",
      type: "boolean",
      initialValue: false,
    }),
    imageWithAlt({
      name: "photo",
      title: "Banner photo",
      description:
        "Tall photo on the right of the banner — vertical orientation works best. Until one is uploaded the site shows a styled placeholder.",
    }),
    defineField({
      name: "photoSubject",
      title: "Intended photo subject",
      description:
        "What the banner photo should eventually show, e.g. “A technician feeding a sewer camera line into a cleanout”. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare: ({ heading }) => ({
      title: "Top banner (hero)",
      subtitle: heading ?? "No heading yet",
    }),
  },
});

export const serviceAbout = defineType({
  name: "serviceAbout",
  title: "About this service",
  type: "object",
  description: "Photo collage with the red 24/7 badge on the left, company story on the right.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “About Our Plumbing Services”.", "The section needs a heading."),
    defineField({
      name: "paragraphs",
      title: "Paragraphs",
      description: "One entry per paragraph. Two short paragraphs read best.",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 4 })],
      validation: (rule) =>
        rule.required().min(1).error("Write at least one paragraph — the section is empty without copy."),
    }),
    requiredString(
      "ctaLabel",
      "Button text",
      "The dark button under the copy, e.g. “Talk to Our Team”. Keep every button label on the page different.",
      "The button needs a label.",
    ),
    internalHref("ctaHref", "Button link", "Where the button goes — usually /contact."),
    imageWithAlt({
      name: "photoPrimary",
      title: "Main photo",
      description: "The large photo in the collage.",
    }),
    defineField({
      name: "photoSubjectPrimary",
      title: "Intended main-photo subject",
      description:
        "What the main photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
    imageWithAlt({
      name: "photoSecondary",
      title: "Small overlapping photo",
      description: "The smaller photo overlapping the main one.",
    }),
    defineField({
      name: "photoSubjectSecondary",
      title: "Intended small-photo subject",
      description:
        "What the small photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
  ],
  preview: {
    select: { heading: "heading", paragraphs: "paragraphs" },
    prepare: ({ heading, paragraphs }) => ({
      title: heading ?? "About this service",
      subtitle: `About — ${paragraphs?.length ?? 0} paragraph${paragraphs?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const whatsIncluded = defineType({
  name: "whatsIncluded",
  title: "What's included",
  type: "object",
  description: "The scope list: a grid of the work this service covers, one row per item.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “What Our Plumbing Service Covers”.", "The section needs a heading."),
    requiredText(
      "intro",
      "Intro line",
      "One sentence under the heading framing the list.",
      "Add one framing sentence — the grid looks abrupt without it.",
      2,
    ),
    defineField({
      name: "items",
      title: "Covered work",
      description: "One row per type of work. Six rows fill the grid evenly (2 columns × 3 rows).",
      type: "array",
      of: [
        defineArrayMember({
          name: "item",
          title: "Item",
          type: "object",
          fields: [
            requiredString("title", "Title", "Bold row title, e.g. “Slab Leak Detection & Repair”.", "The row needs a title."),
            requiredText("description", "One-line description", "A single sentence saying what this covers.", "The row needs its one-line description.", 2),
            iconField({ description: "Small symbol on the left of the row.", choices: GENERAL_ICONS }),
            defineField({
              name: "href",
              title: "Link (optional)",
              description:
                "Where the row links. A related page like /services/maintenance, or a spot further down this page like #repair-or-replace. Leave empty for plain text.",
              type: "string",
              validation: (rule) =>
                rule.custom((value?: string) =>
                  !value || value.startsWith("/") || value.startsWith("#")
                    ? true
                    : "Start with / for a page on this site or # for a spot on this page.",
                ),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
            prepare: ({ title, subtitle }) => ({ title: title ?? "Item", subtitle }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(2).error("List at least two types of work — one alone reads as the whole service."),
    }),
  ],
  preview: {
    select: { heading: "heading", items: "items" },
    prepare: ({ heading, items }) => ({
      title: heading ?? "What's included",
      subtitle: `What's included — ${items?.length ?? 0} item${items?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const signsYouNeed = defineType({
  name: "signsYouNeed",
  title: "Warning signs",
  type: "object",
  description: "Symptom cards phrased as the questions property managers actually ask, each answered directly.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “Signs Your Property Needs a Plumber”.", "The section needs a heading."),
    defineField({
      name: "cards",
      title: "Symptom cards",
      description: "One card per warning sign. Four cards fill the grid evenly (2 × 2).",
      type: "array",
      of: [
        defineArrayMember({
          name: "card",
          title: "Card",
          type: "object",
          fields: [
            requiredString(
              "question",
              "Symptom, as a question",
              "Written the way someone would actually ask it, e.g. “Are tenants reporting low water pressure on upper floors?”",
              "The card needs its question.",
            ),
            requiredText(
              "answer",
              "Answer",
              "Two sentences. Start with the direct answer, then the detail — AI search engines extract the first sentence.",
              "The card needs its answer.",
            ),
            iconField({ description: "Small symbol in the card's red chip.", choices: GENERAL_ICONS }),
          ],
          preview: {
            select: { title: "question" },
            prepare: ({ title }) => ({ title: title ?? "Card" }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(2).error("Add at least two warning signs — a single card looks like a mistake."),
    }),
    requiredString(
      "ctaLabel",
      "Button text",
      "The button under the cards, e.g. “Describe Your Issue — Get a Callback”. Keep every button label on the page different.",
      "The button needs a label.",
    ),
    internalHref("ctaHref", "Button link", "Where the button goes — usually /contact."),
    defineField({
      name: "background",
      title: "Background",
      description:
        "Which band this section sits on. Pick to keep the page alternating light and dark.",
      type: "string",
      options: {
        list: [
          { title: "White (default)", value: "white" },
          { title: "Dark navy", value: "dark" },
        ],
      },
    }),
  ],
  preview: {
    select: { heading: "heading", cards: "cards" },
    prepare: ({ heading, cards }) => ({
      title: heading ?? "Warning signs",
      subtitle: `Warning signs — ${cards?.length ?? 0} card${cards?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const processSteps = defineType({
  name: "processSteps",
  title: "How we work",
  type: "object",
  description: "The numbered step-by-step timeline on the dark band.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “How We Work With Property Managers”.", "The section needs a heading."),
    defineField({
      name: "steps",
      title: "Steps",
      description: "In order. Four steps fit the row on desktop.",
      type: "array",
      of: [
        defineArrayMember({
          name: "step",
          title: "Step",
          type: "object",
          fields: [
            requiredString("title", "Step name", "One or two words, e.g. “Assess”.", "The step needs a name."),
            requiredText("description", "What happens", "One or two sentences describing this step.", "Describe what happens in this step.", 2),
          ],
          preview: {
            select: { title: "title", subtitle: "description" },
            prepare: ({ title, subtitle }) => ({ title: title ?? "Step", subtitle }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(2).error("A process needs at least two steps."),
    }),
  ],
  preview: {
    select: { heading: "heading", steps: "steps" },
    prepare: ({ heading, steps }) => ({
      title: heading ?? "How we work",
      subtitle: `Process — ${steps?.length ?? 0} step${steps?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const comparisonTable = defineType({
  name: "comparisonTable",
  title: "Comparison table",
  type: "object",
  description: "A real table comparing situations and recommendations — extracts cleanly into AI search answers.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “Repair or Replace? How We Advise Property Owners”.", "The section needs a heading."),
    defineField({
      name: "columnLabels",
      title: "Column headings (optional)",
      description:
        "Three headings for the table columns, in order. Leave empty to use “Situation | Typical Recommendation | Why”.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) =>
        rule.max(3).error("The table has three columns — three headings at most."),
    }),
    defineField({
      name: "rows",
      title: "Table rows",
      description:
        "One row per situation: the first field fills column 1, the second column 2, the third column 3.",
      type: "array",
      of: [
        defineArrayMember({
          name: "row",
          title: "Row",
          type: "object",
          fields: [
            requiredString("situation", "Situation", "What the property is facing, e.g. “Pinhole leak in one copper line”.", "The row needs its situation."),
            requiredString("recommendation", "Typical recommendation", "Short, e.g. “Repair” or “Repipe”.", "The row needs a recommendation."),
            requiredText("why", "Why", "One sentence explaining the recommendation.", "Explain the recommendation in one sentence.", 2),
          ],
          preview: {
            select: { title: "situation", subtitle: "recommendation" },
            prepare: ({ title, subtitle }) => ({ title: title ?? "Row", subtitle }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(2).error("A comparison needs at least two rows."),
    }),
    defineField({
      name: "footnote",
      title: "Line under the table",
      description: "Optional single sentence under the table, e.g. how recommendations are decided.",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { heading: "heading", rows: "rows" },
    prepare: ({ heading, rows }) => ({
      title: heading ?? "Comparison table",
      subtitle: `Table — ${rows?.length ?? 0} row${rows?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const serviceTrust = defineType({
  name: "serviceTrust",
  title: "Why trust us",
  type: "object",
  description: "Compact row of proof points, with the partner-logo strip underneath.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “Trusted Plumbing Professionals Across The DFW Metroplex”.", "The section needs a heading."),
    defineField({
      name: "items",
      title: "Proof points",
      description: "Three items sit in one row on desktop.",
      type: "array",
      of: [
        defineArrayMember({
          name: "item",
          title: "Proof point",
          type: "object",
          fields: [
            requiredString("title", "Title", "Short, e.g. “Proven Experience”.", "The proof point needs a title."),
            requiredText("description", "Description", "One or two sentences of substance behind the claim.", "Back the claim with a sentence.", 3),
            iconField({ description: "Small symbol above the title.", choices: GENERAL_ICONS }),
          ],
          preview: {
            select: { title: "title" },
            prepare: ({ title }) => ({ title: title ?? "Proof point" }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).error("Add at least one proof point."),
    }),
    defineField({
      name: "showLogos",
      title: "Show the partner logo strip",
      description: "Shows the Trust Logos collection (AAGD, TDLR, …) under the row.",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { heading: "heading", items: "items" },
    prepare: ({ heading, items }) => ({
      title: heading ?? "Why trust us",
      subtitle: `Trust — ${items?.length ?? 0} proof point${items?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const serviceTestimonials = defineType({
  name: "serviceTestimonials",
  title: "Client reviews",
  type: "object",
  description: "Shows reviews from the site-wide Testimonials collection — edit the reviews there, not here.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “What Our Clients Say”.", "The section needs a heading."),
  ],
  preview: {
    select: { heading: "heading" },
    prepare: ({ heading }) => ({
      title: heading ?? "Client reviews",
      subtitle: "Reviews — pulled from the Testimonials collection",
    }),
  },
});

export const propertyTypes = defineType({
  name: "propertyTypes",
  title: "Property cards",
  type: "object",
  description:
    "A grid of property cards — link cards into the property-type pages, or informational cards (no link) with photos.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “Built for the Properties You Manage”.", "The section needs a heading."),
    defineField({
      name: "cards",
      title: "Property cards",
      description: "One card per property type. Four fill the row on desktop.",
      type: "array",
      of: [
        defineArrayMember({
          name: "card",
          title: "Card",
          type: "object",
          fields: [
            requiredString("title", "Title", "e.g. “Apartments”.", "The card needs a title."),
            requiredText("blurb", "One-liner", "A single line about this property type.", "The card needs its one-liner.", 2),
            defineField({
              name: "slug",
              title: "Property-type page (optional)",
              description:
                "The web-address ending of the property-type page this card opens, e.g. “apartments” for /multifamily/apartments. Leave empty for an informational card with no link.",
              type: "string",
              validation: (rule) =>
                rule.custom((value?: string) =>
                  !value || /^[a-z0-9-]+$/.test(value)
                    ? true
                    : "Just the address ending — lowercase letters and dashes, e.g. “assisted-living”.",
                ),
            }),
            iconField({ description: "Small symbol on the card — hidden when the card has a photo.", choices: PROPERTY_ICONS }),
            imageWithAlt({
              name: "photo",
              title: "Card photo (optional)",
              description: "Photo across the top of the card. Cards without one show the icon instead.",
            }),
            defineField({
              name: "photoSubject",
              title: "Intended photo subject",
              description:
                "What the card photo should eventually show. Shown inside a styled placeholder until a real photo is uploaded — leave empty (with no photo) for an icon card.",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "blurb" },
            prepare: ({ title, subtitle }) => ({ title: title ?? "Card", subtitle }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).error("Add at least one property type card."),
    }),
    defineField({
      name: "background",
      title: "Background",
      description:
        "Which band this section sits on. Pick to keep the page alternating light and dark.",
      type: "string",
      options: {
        list: [
          { title: "Dark navy (default)", value: "dark" },
          { title: "White", value: "white" },
          { title: "Off-white", value: "offwhite" },
        ],
      },
    }),
    defineField({
      name: "ctaLabel",
      title: "Button under the grid (optional)",
      description:
        "Text for a single button under the cards, e.g. “Tell Us About Your Property”. Leave empty for no button. Keep every button label on the page different.",
      type: "string",
    }),
    defineField({
      name: "ctaHref",
      title: "Button link",
      description: "Where the button goes — usually /contact. Only used when button text is set.",
      type: "string",
      validation: (rule) =>
        rule.custom((value?: string) =>
          !value || value.startsWith("/")
            ? true
            : "Use a page on this site, starting with a slash — e.g. /contact.",
        ),
    }),
  ],
  preview: {
    select: { heading: "heading", cards: "cards" },
    prepare: ({ heading, cards }) => ({
      title: heading ?? "Property types",
      subtitle: `Property types — ${cards?.length ?? 0} card${cards?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const serviceFaq = defineType({
  name: "serviceFaq",
  title: "Questions & answers",
  type: "object",
  description:
    "FAQ for this service. Also published to search engines as structured data, so the text here must be exactly what visitors should read.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “Plumbing Service Questions, Answered”.", "The section needs a heading."),
    defineField({
      name: "faqs",
      title: "Questions",
      description: "Phrase each the way a person would actually ask it. Answers should open with the direct answer (“Yes. …”), then the detail.",
      type: "array",
      of: [
        defineArrayMember({
          name: "faq",
          title: "Question",
          type: "object",
          fields: [
            requiredString("question", "Question", "As a person would ask it, e.g. “Do you work on occupied apartment buildings?”", "Write the question."),
            requiredText("answer", "Answer", "Open with the direct answer, then elaborate. Don't leave [BRACKETED] gaps in place when the real fact is known — replace them.", "Write the answer.", 4),
            defineField({
              name: "href",
              title: "Link under the answer (optional)",
              description:
                "A related page to point readers at, e.g. /services/maintenance. Leave empty for no link.",
              type: "string",
              validation: (rule) =>
                rule.custom((value?: string) =>
                  !value || value.startsWith("/")
                    ? true
                    : "Use a page on this site, starting with a slash.",
                ),
            }),
            defineField({
              name: "linkLabel",
              title: "Link text",
              description:
                "The words the link shows, e.g. “See Maintenance Programs”. Only used when a link is set.",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "question" },
            prepare: ({ title }) => ({ title: title ?? "Question" }),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).error("Add at least one question."),
    }),
    defineField({
      name: "background",
      title: "Background",
      description:
        "Which band this section sits on. Pick to keep the page alternating light and dark.",
      type: "string",
      options: {
        list: [
          { title: "Off-white (default)", value: "offwhite" },
          { title: "White", value: "white" },
        ],
      },
    }),
  ],
  preview: {
    select: { heading: "heading", faqs: "faqs" },
    prepare: ({ heading, faqs }) => ({
      title: heading ?? "Questions & answers",
      subtitle: `FAQ — ${faqs?.length ?? 0} question${faqs?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const serviceArea = defineType({
  name: "serviceArea",
  title: "Service area",
  type: "object",
  description: "Where we work: copy plus the city list. Cities come from Site Settings — edit them there.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “Proudly Serving The Entire Dallas–Fort Worth Metroplex”.", "The section needs a heading."),
    requiredText("body", "Paragraph", "One paragraph naming the areas served. The city chips underneath come from Site Settings automatically.", "The section needs its paragraph.", 4),
    imageWithAlt({
      name: "photo",
      title: "Photo",
      description: "Photo on the right, e.g. a Dallas or Fort Worth skyline.",
    }),
    defineField({
      name: "photoSubject",
      title: "Intended photo subject",
      description:
        "What the photo should eventually show. Shown inside the styled placeholder until a real photo is uploaded.",
      type: "string",
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare: ({ heading }) => ({
      title: heading ?? "Service area",
      subtitle: "Service area — cities from Site Settings",
    }),
  },
});

export const relatedServices = defineType({
  name: "relatedServices",
  title: "Related services",
  type: "object",
  description: "Cards linking to sibling service pages.",
  fields: [
    requiredString("heading", "Heading", "Section heading, e.g. “Related Services”.", "The section needs a heading."),
    defineField({
      name: "serviceSlugs",
      title: "Which services",
      description:
        "The web-address endings of the services to show, e.g. “emergency-plumbing” for /services/emergency-plumbing. Three cards fill the row.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(1).error("Pick at least one service to show."),
    }),
  ],
  preview: {
    select: { heading: "heading", serviceSlugs: "serviceSlugs" },
    prepare: ({ heading, serviceSlugs }) => ({
      title: heading ?? "Related services",
      subtitle: `Related — ${serviceSlugs?.length ?? 0} service${serviceSlugs?.length === 1 ? "" : "s"}`,
    }),
  },
});

export const finalCta = defineType({
  name: "finalCta",
  title: "Closing call-to-action",
  type: "object",
  description: "The centered dark band at the end of the page: heading, one line, call buttons.",
  fields: [
    requiredString("heading", "Heading", "e.g. “Get a Plumbing Partner Your Properties Can Count On”.", "The closing band needs a heading."),
    requiredText("body", "Supporting line", "One sentence under the heading.", "Add one supporting sentence.", 2),
    requiredString(
      "secondaryCtaLabel",
      "Second button text",
      "The outlined button next to the red call button, e.g. “Request a Quote”. Keep every button label on the page different.",
      "The second button needs its own label.",
    ),
    internalHref("secondaryCtaHref", "Second button link", "Where the second button goes — usually /contact."),
    defineField({
      name: "phoneCtaLabel",
      title: "Call-button text",
      description:
        "Text on the red call button. Write {phone} where the number goes — it's filled in from Site Settings, e.g. “Call {phone} — Available Now”. Leave empty for “Call {phone} Now”.",
      type: "string",
    }),
    defineField({
      name: "showAvailabilityDot",
      title: "Show the pulsing availability dot",
      description:
        "Adds the small pulsing red dot beside the call button — use on pages where 24/7 availability is the message.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { heading: "heading" },
    prepare: ({ heading }) => ({
      title: heading ?? "Closing call-to-action",
      subtitle: "Closing CTA",
    }),
  },
});

export const serviceSectionTypes = [
  serviceHero,
  serviceAbout,
  whatsIncluded,
  signsYouNeed,
  processSteps,
  comparisonTable,
  serviceTrust,
  serviceTestimonials,
  propertyTypes,
  serviceFaq,
  serviceArea,
  relatedServices,
  finalCta,
];

/**
 * The section array's member list — shared by every document type that
 * carries a `sections` field (service, industry), so the library stays one
 * set of types with no per-document duplication.
 */
export const sectionArrayMembers = serviceSectionTypes.map((type) => ({
  type: type.name,
}));
