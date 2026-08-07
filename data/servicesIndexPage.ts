import { homePageDefaults } from "./homePage";
import type { LibrarySection } from "./sectionLibrary";

/**
 * Services index page (`/services`) — FALLBACK for the `servicesIndexPage`
 * Sanity singleton (see `sanity/lib/getServicesIndexPage.ts`).
 *
 * This page carries NO page-specific section types: every band it can hold
 * already exists in the shared library, so its stack is typed as plain
 * `LibrarySection[]` rather than a seventh per-page union.
 *
 * The shipped stack is deliberately minimal — the banner and the services
 * grid, nothing else. The owner composes the rest in Studio, so anything
 * more here would be a layout he has to undo rather than build on.
 */
export const defaultServicesIndexSections: LibrarySection[] = [
  {
    _type: "serviceHero",
    _key: "hero",
    // The copy the hand-built /services placeholder carried, verbatim.
    eyebrow: "Services",
    heading: "Plumbing Services for Commercial & Multi-Family Properties",
    subheading:
      "A full range of plumbing services for commercial buildings, apartment communities, and care facilities across the Metroplex.",
    credentials: [],
  },
  // The grid ships with this section type's own default copy — the owner
  // retitles it for the index page in Studio.
  { _type: "homeServices", _key: "services", ...homePageDefaults.services },
];
