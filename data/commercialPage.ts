import type { LibrarySection } from "./sectionLibrary";

/**
 * Commercial page (`/commercial`) — FALLBACK for the `commercialPage` Sanity
 * singleton (see `sanity/lib/getCommercialPage.ts`).
 *
 * Like the multi-family index page this carries NO page-specific section
 * types: the shared library already covers everything, so the stack is typed
 * as plain `LibrarySection[]` rather than another per-page union.
 *
 * ONE band on purpose. The owner composes this page himself in Studio, so the
 * job here is only to keep the route from rendering blank before he does.
 * The copy is deliberately, visibly placeholder — no service claims, nothing
 * that would read as finished marketing if it ever shipped by accident.
 */
export const defaultCommercialSections: LibrarySection[] = [
  {
    _type: "serviceHero",
    _key: "hero",
    eyebrow: "Commercial",
    heading: "Commercial Plumbing",
    subheading:
      "Placeholder banner — the sections for this page have not been added yet.",
    credentials: [],
  },
];
