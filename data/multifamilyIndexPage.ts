import { homePageDefaults } from "./homePage";
import type { LibrarySection } from "./sectionLibrary";

/**
 * Multi-family index page (`/multifamily`) — FALLBACK for the
 * `multifamilyIndexPage` Sanity singleton (see
 * `sanity/lib/getMultifamilyIndexPage.ts`).
 *
 * This page carries NO page-specific section types: the audit found nothing
 * the shared library doesn't already cover, so its stack is typed as plain
 * `LibrarySection[]` rather than yet another per-page union.
 *
 * The shipped stack is deliberately minimal — the banner and the property-type
 * card band, nothing else. The owner composes the rest in Studio, so anything
 * more here would be a layout he has to undo rather than build on.
 */
export const defaultMultifamilyIndexSections: LibrarySection[] = [
  {
    _type: "serviceHero",
    _key: "hero",
    // The copy the hand-built /multifamily placeholder carried, verbatim.
    eyebrow: "Multifamily",
    heading: "Plumbing Built for Multifamily Portfolios",
    subheading:
      "Apartments, condos, and care communities — one plumbing partner across the whole portfolio.",
    credentials: [],
  },
  // One card per document in the Property Types collection, in balanced
  // centred rows — adding or removing a property type never touches this
  // page. The band ships with this section type's own default copy; the
  // owner retitles it for the index page in Studio.
  {
    _type: "homeIndustries",
    _key: "propertyTypes",
    ...homePageDefaults.industries,
  },
];
