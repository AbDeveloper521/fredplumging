import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { toLibrarySections } from "@/sanity/lib/sectionLibrary";
import { MULTIFAMILY_INDEX_PAGE_QUERY } from "@/sanity/queries";
import type { MULTIFAMILY_INDEX_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultMultifamilyIndexSections } from "@/data/multifamilyIndexPage";
import type { LibrarySection } from "@/data/sectionLibrary";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const MULTIFAMILY_INDEX_PAGE_TAG = "multifamilyIndexPage";

/**
 * The /multifamily section stack — same singleton seam pattern as
 * `getServicesIndexPage()`: a thrown fetch serves the default stack (loud); a
 * missing document or one without a `sections` array serves it quietly; a
 * published stack wins, with each item's missing fields falling back to that
 * section type's default copy.
 */
export async function getMultifamilyIndexPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LibrarySection[]> {
  let result: MULTIFAMILY_INDEX_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      MULTIFAMILY_INDEX_PAGE_QUERY,
      {},
      MULTIFAMILY_INDEX_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getMultifamilyIndexPage",
      fallbackFile: "data/multifamilyIndexPage.ts",
      affects: "/multifamily section order and copy",
      error,
    });
    return defaultMultifamilyIndexSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] multifamilyIndexPage document not published yet — /multifamily renders the default stack from data/multifamilyIndexPage.ts.",
    );
    return defaultMultifamilyIndexSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] multifamilyIndexPage document has no `sections` array — /multifamily " +
        "renders the default stack from data/multifamilyIndexPage.ts. Run " +
        "scripts/seed-multifamily-index-sections.ts, or open Multifamily Index " +
        "Page in /studio and publish the sections list.",
    );
    return defaultMultifamilyIndexSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the default page over their intent.
  const sections = toLibrarySections(result.sections, "multifamilyIndexPage");
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return [];
    console.warn(
      "[sanity] multifamilyIndexPage sections are published but none survived validation — " +
        "/multifamily renders the default stack from data/multifamilyIndexPage.ts.",
    );
    return defaultMultifamilyIndexSections;
  }
  return sections;
}
