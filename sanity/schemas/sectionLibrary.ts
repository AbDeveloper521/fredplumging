import { defineField } from "sanity";

/**
 * THE shared section library, schema side: the one list of section types
 * every page document's `sections` array accepts, and the grouped "Add
 * item…" menu that keeps a 46-type library usable.
 *
 * Deliberately a list of type NAMES, not imported definitions — the object
 * types stay defined (and registered via schemas/index.ts) in their home
 * files, and the document schemas that call `sectionsField()` are those
 * same files, so importing definitions here would be circular. A name typo
 * fails loudly at `npm run typegen` (schema extract rejects unknown type
 * references).
 *
 * TypeScript twin: `data/sectionLibrary.ts`; mapping:
 * `sanity/lib/sectionLibrary.ts`; rendering:
 * `components/sections/SectionRenderer.tsx`.
 */

/** The grouped insert menu — every group's `of` lists registered type names. */
export const SECTION_LIBRARY_GROUPS = [
  {
    name: "heroes",
    title: "Heroes",
    of: ["homeHero", "serviceHero", "aboutHero", "partnersHero", "careersHero"],
  },
  {
    name: "content",
    title: "Content bands",
    of: [
      "serviceAbout",
      "homeAbout",
      "aboutStory",
      "aboutEvolution",
      "homeEmergency",
      "homeWhyChooseUs",
      "homeCaseStudy",
      "homeCompliance",
      "partnerCredentials",
      "whatsIncluded",
      "comparisonTable",
      "serviceArea",
      "homeServiceArea",
      "cityCommunities",
      "processSteps",
      "homeProcess",
      "hiringProcess",
      "careerTraits",
      "serviceFaq",
    ],
  },
  {
    name: "cards",
    title: "Cards & grids",
    of: [
      "propertyTypes",
      "iconCardSection",
      "signsYouNeed",
      "serviceTrust",
      "valuesGrid",
      "careerValues",
      "vendorOnboarding",
      "pageLinks",
      "relatedServices",
    ],
  },
  {
    name: "collections",
    title: "Collections",
    of: [
      "serviceTestimonials",
      "homeTestimonials",
      "homeTrustBar",
      "homeServices",
      "homeIndustries",
      "homeFaq",
      // Named faqBand, not faq — the `faq` type name is the per-question FAQ
      // document (the homepage list), and Sanity's type registry is flat.
      "faqBand",
      "jobOpenings",
      "partnerPlatforms",
      "badgeStrip",
      "homeLocationMap",
    ],
  },
  {
    name: "closing",
    title: "CTA & closing",
    of: ["finalCta", "homeFinalCta", "careersCta"],
  },
];

/**
 * Every type a `sections` array accepts: the grouped library plus the
 * retired badge strip, which stays in the union so published stacks that
 * still contain it raise no unknown-type noise — but joins no group, so the
 * insert menu never suggests a band that renders nothing.
 */
export const SECTION_LIBRARY_TYPE_NAMES = [
  ...SECTION_LIBRARY_GROUPS.flatMap((group) => group.of),
  "trustLogoStrip",
];

/**
 * The one `sections` field every page document uses — same library, same
 * grouped insert menu everywhere; only the field description is per-page.
 */
export function sectionsField(options: { title: string; description: string }) {
  return defineField({
    name: "sections",
    title: options.title,
    description: options.description,
    type: "array",
    of: SECTION_LIBRARY_TYPE_NAMES.map((type) => ({ type })),
    options: {
      insertMenu: {
        filter: true,
        groups: SECTION_LIBRARY_GROUPS,
      },
    },
  });
}
