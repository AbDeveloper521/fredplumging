import { defineArrayMember, defineField, defineType } from "sanity";
import type { NavIconName } from "@/data/navigation";
import { defaultPartnersSections } from "@/data/partnersPage";
import { sectionsField } from "./sectionLibrary";

/**
 * The Partners page (/about/partners) as an orderable section stack — same
 * architecture as the homepage and About page. One object type per
 * Partners band; the `partnersPage` singleton holds an array of them, so
 * the owner gets add, remove, duplicate and drag-reorder natively in
 * Studio, plus a per-section "Hide" toggle. The stack also accepts the
 * shared library types (reviews, FAQ, Icon Card, map band, closing CTA) —
 * reused, not forked.
 *
 * TypeScript twins live in `data/partnersPage.ts`; mapping in
 * `sanity/lib/sectionLibrary.ts`; rendering in
 * `components/sections/SectionRenderer.tsx`.
 *
 * Collection-driven: the per-platform cards come from Trust Logos (an entry
 * WITH a paragraph gets a card), reviews from Testimonials. Derived: the
 * hero credential chips come from Site Settings. Copy rule that still
 * binds: platform claims never upgrade — "approved vendor" / "registered
 * and in good standing" never becomes "certified".
 */

const ONBOARDING_ICONS: Array<{ title: string; value: NavIconName }> = [
  { title: "File check (documentation)", value: "file-check-2" },
  { title: "Shield check (coverage / compliance)", value: "shield-check" },
  { title: "Clock (same-day dispatch)", value: "clock-4" },
  { title: "Clipboard list (work orders)", value: "clipboard-list" },
  { title: "Wrench (repairs)", value: "wrench" },
  { title: "Truck (dispatch)", value: "truck" },
  { title: "Phone call (contact)", value: "phone-call" },
  { title: "Office building (commercial)", value: "building-2" },
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

export const partnersHero = defineType({
  name: "partnersHero",
  title: "Partners banner (hero)",
  type: "object",
  description:
    "The dark banner at the top: small label, big heading, intro paragraphs. The credential chips (licence, years, dispatch) come from Site Settings.",
  fields: [
    requiredString(
      "heading",
      "Big heading",
      "The page's one H1, e.g. “Fully Compliant and Approved Across Leading Vendor Systems”.",
      "The banner can't render without its heading.",
    ),
    optionalString(
      "eyebrow",
      "Small label above the heading",
      "Tiny uppercase label, e.g. “About Us”.",
    ),
    defineField({
      name: "paragraphs",
      title: "Intro paragraphs",
      description:
        "The paragraphs under the heading. One entry per paragraph. Platform claims stay as written — “registered and in good standing”, never “certified”.",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 5 })],
    }),
    defineField({
      name: "showCredentials",
      title: "Show the credential chips",
      description:
        "The row of chips under the intro — licence number, years in DFW, 24/7 dispatch. Their wording comes from Site Settings; this only shows or hides the row.",
      type: "boolean",
      initialValue: true,
    }),
    hiddenField(),
  ],
  preview: sectionPreview("Partners banner (hero)"),
});

export const vendorOnboarding = defineType({
  name: "vendorOnboarding",
  title: "Vendor-approval value points",
  type: "object",
  description:
    "The dark band of four cards explaining what an approved-vendor record buys the property manager. Keep the claims consistent with the document panel in the credentials band.",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “What Vendor Approval Buys You On Day One”.",
      "The section needs a heading.",
    ),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Why It Matters”."),
    optionalText(
      "description",
      "Paragraph",
      "One or two sentences under the heading.",
      3,
    ),
    defineField({
      name: "items",
      title: "Value points",
      description: "The cards, in order. Four fill the row on desktop.",
      type: "array",
      of: [
        defineArrayMember({
          name: "item",
          title: "Value point",
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              description: "Small symbol in the red chip. Leave empty to use the wrench icon.",
              type: "string",
              options: { list: ONBOARDING_ICONS },
            }),
            requiredString("title", "Title", "Short, e.g. “Coverage that stays current”.", "The card needs a title."),
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
            prepare: ({ title, subtitle }) => ({ title: title ?? "Value point", subtitle }),
          },
        }),
      ],
    }),
    hiddenField(),
  ],
  preview: sectionPreview("Vendor-approval value points"),
});

export const partnerPlatforms = defineType({
  name: "partnerPlatforms",
  title: "Platform cards",
  type: "object",
  description:
    "The per-platform explainer cards (VendorCafe, Compliance Depot, …). The cards themselves are managed under Partners & Vendor Systems — an entry WITH a paragraph gets a card here. Only the heading block lives in this item.",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “Approved Across the Systems Property Managers Already Use”.",
      "The section needs a heading.",
    ),
    optionalString("eyebrow", "Small label above the heading", "e.g. “Vendor Compliance”."),
    optionalText("description", "Paragraph", "One or two sentences under the heading.", 4),
    hiddenField(),
  ],
  preview: sectionPreview("Platform cards"),
});

export const partnerCredentials = defineType({
  name: "partnerCredentials",
  title: "Documents band",
  type: "object",
  description:
    "The dark band with the compliance-dashboard panel. The panel's document line items are part of the design — only the copy and button live here.",
  fields: [
    requiredString(
      "heading",
      "Heading",
      "e.g. “The Documents Behind the Approvals”.",
      "The section needs a heading.",
    ),
    optionalString("eyebrow", "Small label above the heading", "e.g. “The Paper Trail”."),
    optionalText("description", "Paragraph", "One or two sentences under the heading.", 4),
    optionalString(
      "ctaLabel",
      "Button text",
      "e.g. “Request Compliance Documents”. Leave empty for the default.",
    ),
    optionalString(
      "ctaHref",
      "Button link",
      "Where the button goes — usually /contact. Leave empty for the default.",
    ),
    hiddenField(),
  ],
  preview: sectionPreview("Documents band"),
});

export const partnersSectionTypes = [
  partnersHero,
  vendorOnboarding,
  partnerPlatforms,
  partnerCredentials,
];

export const partnersPage = defineType({
  name: "partnersPage",
  title: "Partners Page",
  type: "document",
  fields: [
    sectionsField({
      title: "Partners-page sections",
      description:
        "The Partners page, top to bottom — the same section library every page uses. Drag to reorder. The ⋮ menu on each section offers Duplicate and Remove; open a section and tick “Hide this section” to keep its content without showing it.",
    }),
  ],
  // The Studio document starts prefilled with the shipped stack, so the
  // owner's first edit starts from the real page instead of an empty list.
  // JSON round-trip strips the `undefined`s.
  initialValue: JSON.parse(JSON.stringify({ sections: defaultPartnersSections })),
  preview: {
    prepare: () => ({ title: "Partners Page" }),
  },
});
