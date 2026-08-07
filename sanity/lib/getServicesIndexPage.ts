import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { toLibrarySections } from "@/sanity/lib/sectionLibrary";
import { SERVICES_INDEX_PAGE_QUERY } from "@/sanity/queries";
import type { SERVICES_INDEX_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultServicesIndexSections } from "@/data/servicesIndexPage";
import type { LibrarySection } from "@/data/sectionLibrary";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const SERVICES_INDEX_PAGE_TAG = "servicesIndexPage";

/**
 * The /services section stack — same singleton seam pattern as
 * `getCareersPage()`: a thrown fetch serves the default stack (loud); a
 * missing document or one without a `sections` array serves it quietly; a
 * published stack wins, with each item's missing fields falling back to
 * that section type's default copy.
 */
export async function getServicesIndexPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LibrarySection[]> {
  let result: SERVICES_INDEX_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      SERVICES_INDEX_PAGE_QUERY,
      {},
      SERVICES_INDEX_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getServicesIndexPage",
      fallbackFile: "data/servicesIndexPage.ts",
      affects: "/services section order and copy",
      error,
    });
    return defaultServicesIndexSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] servicesIndexPage document not published yet — /services renders the default stack from data/servicesIndexPage.ts.",
    );
    return defaultServicesIndexSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] servicesIndexPage document has no `sections` array — /services " +
        "renders the default stack from data/servicesIndexPage.ts. Run " +
        "scripts/seed-services-index-sections.ts, or open Services Index Page " +
        "in /studio and publish the sections list.",
    );
    return defaultServicesIndexSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the default page over their intent.
  const sections = toLibrarySections(result.sections, "servicesIndexPage");
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return [];
    console.warn(
      "[sanity] servicesIndexPage sections are published but none survived validation — " +
        "/services renders the default stack from data/servicesIndexPage.ts.",
    );
    return defaultServicesIndexSections;
  }
  return sections;
}
