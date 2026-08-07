import type { LibrarySection } from "./sectionLibrary";

/**
 * Areas We Serve index page (`/areas-we-serve`) — FALLBACK for the
 * `areasIndexPage` Sanity singleton (see `sanity/lib/getAreasIndexPage.ts`).
 *
 * This page carries NO page-specific section types: the audit found nothing
 * the shared library doesn't already cover, so its stack is typed as plain
 * `LibrarySection[]` rather than yet another per-page union.
 *
 * The shipped stack is deliberately minimal — the banner and the coverage
 * band, nothing else. The owner composes the rest in Studio, so anything more
 * here would be a layout he has to undo rather than build on.
 */
export const defaultAreasIndexSections: LibrarySection[] = [
  {
    _type: "serviceHero",
    _key: "hero",
    // The copy the hand-built /areas-we-serve placeholder carried, verbatim.
    eyebrow: "Areas We Serve",
    heading: "Serving the Dallas–Fort Worth Metroplex",
    subheading:
      "Crews staged across DFW so response times stay short no matter where your property sits.",
    credentials: [],
  },
  {
    // The band that keeps the city-page links on this page. Its chips come
    // from Site Settings and its links from the `cityPage` documents, so a
    // third city needs no edit here.
    _type: "serviceArea",
    _key: "coverage",
    heading: "Cities We Serve",
  },
];
