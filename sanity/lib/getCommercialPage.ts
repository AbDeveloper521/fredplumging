import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { FAQ_SET_TAG, toLibrarySections } from "@/sanity/lib/sectionLibrary";
import { COMMERCIAL_PAGE_QUERY } from "@/sanity/queries";
import type { COMMERCIAL_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultCommercialSections } from "@/data/commercialPage";
import type { LibrarySection } from "@/data/sectionLibrary";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const COMMERCIAL_PAGE_TAG = "commercialPage";

/**
 * The /commercial section stack — same singleton seam pattern as
 * `getMultifamilyIndexPage()`: a thrown fetch serves the default stack (loud);
 * a missing document or one without a `sections` array serves it quietly; a
 * published stack wins, with each item's missing fields falling back to that
 * section type's default copy.
 */
export async function getCommercialPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LibrarySection[]> {
  let result: COMMERCIAL_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      COMMERCIAL_PAGE_QUERY,
      {},
      [COMMERCIAL_PAGE_TAG, FAQ_SET_TAG],
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getCommercialPage",
      fallbackFile: "data/commercialPage.ts",
      affects: "/commercial section order and copy",
      error,
    });
    return defaultCommercialSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] commercialPage document not published yet — /commercial renders the placeholder banner from data/commercialPage.ts.",
    );
    return defaultCommercialSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] commercialPage document has no `sections` array — /commercial " +
        "renders the placeholder banner from data/commercialPage.ts. Run " +
        "scripts/seed-commercial-sections.ts, or open Commercial Page in " +
        "/studio and publish the sections list.",
    );
    return defaultCommercialSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the placeholder over their intent.
  const sections = toLibrarySections(result.sections, "commercialPage");
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return [];
    console.warn(
      "[sanity] commercialPage sections are published but none survived validation — " +
        "/commercial renders the placeholder banner from data/commercialPage.ts.",
    );
    return defaultCommercialSections;
  }
  return sections;
}
