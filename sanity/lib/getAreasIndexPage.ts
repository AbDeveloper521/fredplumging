import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { toLibrarySections } from "@/sanity/lib/sectionLibrary";
import { AREAS_INDEX_PAGE_QUERY } from "@/sanity/queries";
import type { AREAS_INDEX_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultAreasIndexSections } from "@/data/areasIndexPage";
import type { LibrarySection } from "@/data/sectionLibrary";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const AREAS_INDEX_PAGE_TAG = "areasIndexPage";

/**
 * The /areas-we-serve section stack — same singleton seam pattern as
 * `getServicesIndexPage()`: a thrown fetch serves the default stack (loud); a
 * missing document or one without a `sections` array serves it quietly; a
 * published stack wins, with each item's missing fields falling back to that
 * section type's default copy.
 */
export async function getAreasIndexPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LibrarySection[]> {
  let result: AREAS_INDEX_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      AREAS_INDEX_PAGE_QUERY,
      {},
      AREAS_INDEX_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getAreasIndexPage",
      fallbackFile: "data/areasIndexPage.ts",
      affects: "/areas-we-serve section order and copy",
      error,
    });
    return defaultAreasIndexSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] areasIndexPage document not published yet — /areas-we-serve renders the default stack from data/areasIndexPage.ts.",
    );
    return defaultAreasIndexSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] areasIndexPage document has no `sections` array — /areas-we-serve " +
        "renders the default stack from data/areasIndexPage.ts. Run " +
        "scripts/seed-areas-index-sections.ts, or open Areas We Serve Index " +
        "Page in /studio and publish the sections list.",
    );
    return defaultAreasIndexSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the default page over their intent.
  const sections = toLibrarySections(result.sections, "areasIndexPage");
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return [];
    console.warn(
      "[sanity] areasIndexPage sections are published but none survived validation — " +
        "/areas-we-serve renders the default stack from data/areasIndexPage.ts.",
    );
    return defaultAreasIndexSections;
  }
  return sections;
}
