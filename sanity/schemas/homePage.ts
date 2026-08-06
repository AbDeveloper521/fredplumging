import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { defaultHomeSections } from "@/data/homePage";
import { imageWithAlt } from "./fields";
import { sectionsField } from "./sectionLibrary";

/**
 * The homepage as an orderable section stack — same architecture as the
 * service-page section library. One object type per homepage band; the
 * `homePage` singleton holds an array of them, so the owner gets add,
 * remove, duplicate and drag-reorder natively in Studio, plus a per-section
 * "Hide" toggle. Type names are prefixed `home*` because `serviceArea` /
 * `finalCta` are already taken by the service-section library.
 *
 * TypeScript twins live in `data/homePage.ts`; mapping in
 * `sanity/lib/sectionLibrary.ts`; rendering in
 * `components/sections/SectionRenderer.tsx`.
 *
 * Collection-driven bands (trust bar, services, property types,
 * testimonials, FAQ, and the compliance logo strip) only carry their heading
 * copy here — the lists themselves are edited in their own collections.
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

function sectionPreview(bandTitle: string) {
  return {
    select: { heading: "heading", hidden: "hidden" },
    prepare: ({ heading, hidden }: { heading?: string; hidden?: boolean }) => ({
      title: `${hidden ? "🚫 " : ""}${bandTitle}`,
      subtitle: hidden ? "HIDDEN — not shown on the site" : heading,
    }),
  };
}

export const homeHero = defineType({
  name: "homeHero",
  title: "Homepage banner (split headline)",
  type: "object",
  description:
    "The dark banner at the top: headline, intro, trust strip. Buttons, phone number, and the years figure come from Site Settings.",
  fields: [
    requiredString(
      "headingBefore",
      "Headline — first part",
      "The start of the big headline, shown in white, e.g. “Reliable Plumbing Solutions for”.",
      "The banner can't render without its headline.",
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
    imageWithAlt({
      name: "photo",
      title: "Background photo",
      description:
        "The photo BEHIND the whole banner — it fills the width of the band, darkened so the text stays readable. Wide, landscape photos work best (a crew, truck, or property shot). Until one is uploaded the site shows the styled dark background. Drag the hotspot circle (click the image → Edit hotspot) over the part that must stay visible — the banner crops wide, so the hotspot matters here.",
      // The wide banner crop is load-bearing — a stale portrait/square
      // override would break the composition, so no Frame-shape control.
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
  preview: {
    select: { heading: "headingBefore", hidden: "hidden" },
    prepare: ({ heading, hidden }) => ({
      title: `${hidden ? "🚫 " : ""}Homepage banner (split headline)`,
      subtitle: hidden ? "HIDDEN — not shown on the site" : heading,
    }),
  },
});

export const homeTrustBar = defineType({
  name: "homeTrustBar",
  title: "Trust-logo strip",
  type: "object",
  description:
    "The white logo row under the hero. The logos themselves are managed under Partners & Vendor Systems — only the line above them lives here.",
  fields: [
    optionalString(
      "tagline",
      "Line above the logos",
      "e.g. “Trusted by property managers and commercial facilities across DFW”.",
    ),
    hiddenField(),
  ],
  preview: {
    select: { heading: "tagline", hidden: "hidden" },
    prepare: ({ heading, hidden }) => ({
      title: `${hidden ? "🚫 " : ""}Trust-logo strip`,
      subtitle: hidden ? "HIDDEN — not shown on the site" : (heading ?? "Logos from Partners & Vendor Systems"),
    }),
  },
});

export const homeAbout = defineType({
  name: "homeAbout",
  title: "About band (collage + metrics)",
  type: "object",
  description:
    "Photo collage left, company story right, metrics row underneath. The red badge's year and the years metric come from Site Settings.",
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
      description: "The stat cards under the section. Four fill the row on desktop.",
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
      description:
        "The large photo in the collage, behind the red badge. The “Frame shape” control below the upload can change the frame's shape or show the photo uncropped.",
    }),
    photoSubjectField("primaryPhotoSubject", "What the main photo should eventually show."),
    imageWithAlt({
      name: "secondaryPhoto",
      title: "Small overlapping photo",
      description:
        "The smaller photo overlapping the main one. Its frame is fixed so the overlap composition holds — drag the hotspot circle (click the image → Edit hotspot) over the part that must stay visible.",
      // The overlap frame is absolutely positioned against the main photo;
      // a shape override here could cover it, so no control.
      frameRatio: false,
    }),
    photoSubjectField("secondaryPhotoSubject", "What the small photo should eventually show."),
    hiddenField(),
  ],
  preview: sectionPreview("About band (collage + metrics)"),
});

export const homeServices = defineType({
  name: "homeServices",
  title: "Services grid",
  type: "object",
  description:
    "The service-card grid. The cards themselves are managed under Services — only the heading block lives here.",
  fields: [
    optionalString("heading", "Heading", "e.g. “Complete Plumbing Support for Commercial Properties”. Leave empty for the default."),
    optionalString("eyebrow", "Small label above the heading", "e.g. “What We Do”."),
    optionalText("description", "Paragraph", "One or two sentences under the heading.", 3),
    hiddenField(),
  ],
  preview: sectionPreview("Services grid"),
});

export const homeEmergency = defineType({
  name: "homeEmergency",
  title: "Emergency band",
  type: "object",
  description:
    "The dark 24/7 band with the big phone number. The number itself comes from Site Settings.",
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
      description:
        "The tall photo on the right of the band. Vertical orientation works best. The “Frame shape” control below the upload can change the frame's shape or show the photo uncropped.",
    }),
    photoSubjectField("photoSubject", "What the photo should eventually show."),
    optionalString(
      "photoCaption",
      "White card on the photo",
      "The line in the small white card overlapping the photo, e.g. “Crews on call across DFW right now”.",
    ),
    hiddenField(),
  ],
  preview: sectionPreview("Emergency band"),
});

export const homeIndustries = defineType({
  name: "homeIndustries",
  title: "Who we serve (property types)",
  type: "object",
  description:
    "The dark property-type band: intro copy, photo, and one card per property type. The property types themselves are managed under Property Types — only the copy and photo live here.",
  fields: [
    optionalString("heading", "Heading", "e.g. “Plumbing Solutions Tailored to Multi-Family and Commercial Needs”. Leave empty for the default."),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Who We Serve”."),
    optionalText("description", "Paragraph", "One or two sentences under the heading.", 3),
    imageWithAlt({
      name: "photo",
      title: "Photo",
      description:
        "The photo beside the intro copy. The “Frame shape” control below the upload can change the frame's shape or show the photo uncropped.",
    }),
    photoSubjectField("photoSubject", "What the photo should eventually show."),
    hiddenField(),
  ],
  preview: sectionPreview("Who we serve (property types)"),
});

export const homeWhyChooseUs = defineType({
  name: "homeWhyChooseUs",
  title: "Why choose us",
  type: "object",
  description: "The sticky intro column with the stacked feature rows.",
  fields: [
    requiredString("heading", "Heading", "e.g. “Dependable Service Without the Guesswork”.", "The section needs a heading."),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Why Property Managers Choose Fred's”."),
    optionalText("description", "Paragraph", "The intro under the heading.", 4),
    iconItemArray("features", "Feature rows", "One row per reason, stacked on the right. Six read best."),
    imageWithAlt({
      name: "photo",
      title: "Photo",
      description:
        "The photo under the intro column (desktop only). The “Frame shape” control below the upload can change the frame's shape or show the photo uncropped.",
    }),
    photoSubjectField("photoSubject", "What the photo should eventually show."),
    optionalString(
      "photoCaption",
      "White card on the photo",
      "The line in the small white card on the photo. Write {yearsInBusiness} where the years figure goes — it's filled in from Site Settings, e.g. “{yearsInBusiness} years of repeat commercial clients”.",
    ),
    hiddenField(),
  ],
  preview: sectionPreview("Why choose us"),
});

export const homeProcess = defineType({
  name: "homeProcess",
  title: "How it works",
  type: "object",
  description: "The numbered step timeline. Step numbers (01, 02, …) are automatic.",
  fields: [
    requiredString("heading", "Heading", "e.g. “A Straightforward Service Process”.", "The section needs a heading."),
    optionalString("eyebrow", "Small label above the heading", "e.g. “How It Works”."),
    iconItemArray("steps", "Steps", "In order. Four fit the row on desktop."),
    hiddenField(),
  ],
  preview: sectionPreview("How it works"),
});

export const homeCompliance = defineType({
  name: "homeCompliance",
  title: "Vendor compliance band",
  type: "object",
  description:
    "The dark compliance band. Only the copy lives here — the logo tiles underneath are managed under Partners & Vendor Systems.",
  fields: [
    requiredString("heading", "Heading", "e.g. “Approved Across Leading Property Management Systems”.", "The section needs a heading."),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Vendor-Ready and Fully Compliant”."),
    optionalText("description", "Paragraph", "The copy under the heading.", 4),
    stringArray(
      "items",
      "Checkmark list",
      "Short compliance items, e.g. “Insurance verification”. Six fill the grid (2 × 3).",
    ),
    hiddenField(),
  ],
  preview: sectionPreview("Vendor compliance band"),
});

export const homeTestimonials = defineType({
  name: "homeTestimonials",
  title: "Client reviews (simple)",
  type: "object",
  description:
    "Shows reviews from the site-wide Testimonials collection — edit the reviews there, not here.",
  fields: [
    optionalString("heading", "Heading", "e.g. “Trusted by Property Managers Across DFW”. Leave empty for the default."),
    hiddenField(),
  ],
  preview: sectionPreview("Client reviews (simple)"),
});

export const homeCaseStudy = defineType({
  name: "homeCaseStudy",
  title: "Service scenario",
  type: "object",
  description: "The Problem / Solution / Outcome story with the property photo.",
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
      description:
        "The property photo on the left of the story. The “Frame shape” control below the upload can change the frame's shape or show the photo uncropped.",
    }),
    photoSubjectField("photoSubject", "What the photo should eventually show."),
    optionalString("photoCardTitle", "Dark card on the photo — first line", "e.g. “240-unit apartment community”."),
    optionalString("photoCardSubtitle", "Dark card on the photo — second line", "e.g. “Dallas, TX”."),
    hiddenField(),
  ],
  preview: sectionPreview("Service scenario"),
});

export const homeServiceArea = defineType({
  name: "homeServiceArea",
  title: "Service area (map graphic)",
  type: "object",
  description:
    "Where we work. The city chips and the map graphic come from Site Settings and the design — only the copy lives here.",
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
    hiddenField(),
  ],
  preview: sectionPreview("Service area (map graphic)"),
});

export const homeFaq = defineType({
  name: "homeFaq",
  title: "Q&A (from the FAQs list)",
  type: "object",
  description:
    "The homepage FAQ accordion. The questions themselves are managed under FAQs — only the heading block lives here.",
  fields: [
    optionalString("heading", "Heading", "e.g. “Common Questions”. Leave empty for the default."),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Good to Know”."),
    hiddenField(),
  ],
  preview: sectionPreview("Q&A (from the FAQs list)"),
});

export const homeLocationMap = defineType({
  name: "homeLocationMap",
  title: "Google-map band",
  type: "object",
  description:
    "The Google-map band. Its heading, supporting line, and map address are edited in Site Settings (they're shared with the service pages) — this item only controls where the band sits on the homepage.",
  fields: [hiddenField()],
  preview: {
    select: { hidden: "hidden" },
    prepare: ({ hidden }) => ({
      title: `${hidden ? "🚫 " : ""}Google-map band`,
      subtitle: hidden
        ? "HIDDEN — not shown on the site"
        : "Copy and map address in Site Settings",
    }),
  },
});

export const homeFinalCta = defineType({
  name: "homeFinalCta",
  title: "Closing band (quote form)",
  type: "object",
  description:
    "The dark closing band with the quote form. Buttons and the phone number come from Site Settings.",
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
    hiddenField(),
  ],
  preview: sectionPreview("Closing band (quote form)"),
});

export const homeSectionTypes = [
  homeHero,
  homeTrustBar,
  homeAbout,
  homeServices,
  homeEmergency,
  homeIndustries,
  homeWhyChooseUs,
  homeProcess,
  homeCompliance,
  homeTestimonials,
  homeCaseStudy,
  homeServiceArea,
  homeFaq,
  homeLocationMap,
  homeFinalCta,
];

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    sectionsField({
      title: "Homepage sections",
      description:
        "The homepage, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it.",
    }),
  ],
  // The Studio document starts prefilled with the shipped stack, so the
  // owner's first edit starts from the real page instead of an empty list.
  // JSON round-trip strips the `undefined`s (unset metric values, photos).
  initialValue: JSON.parse(JSON.stringify({ sections: defaultHomeSections })),
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
