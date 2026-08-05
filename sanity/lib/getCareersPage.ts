import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { toCareersSections } from "@/sanity/lib/careersSections";
import { CAREERS_PAGE_QUERY } from "@/sanity/queries";
import type { CAREERS_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultCareersSections, type CareersSection } from "@/data/careersPage";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const CAREERS_PAGE_TAG = "careersPage";

/**
 * The Careers-page section stack — same singleton seam pattern as
 * `getAboutPage()`: a thrown fetch serves the full default stack (loud); a
 * missing document or one without a `sections` array serves it quietly; a
 * published stack wins, with each item's missing fields falling back to
 * that section type's default copy in `data/careersPage.ts`.
 */
export async function getCareersPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<CareersSection[]> {
  let result: CAREERS_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      CAREERS_PAGE_QUERY,
      {},
      CAREERS_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getCareersPage",
      fallbackFile: "data/careersPage.ts",
      affects: "/about/careers section order, copy and hero photo",
      error,
    });
    return defaultCareersSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] careersPage document not published yet — /about/careers renders the default stack from data/careersPage.ts.",
    );
    return defaultCareersSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] careersPage document has no `sections` array — /about/careers " +
        "renders the default stack from data/careersPage.ts. Run " +
        "scripts/seed-careers-sections.ts, or open Careers Page in /studio " +
        "and publish the sections list.",
    );
    return defaultCareersSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the default page over their intent.
  const sections = toCareersSections(result.sections);
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return [];
    console.warn(
      "[sanity] careersPage sections are published but none survived validation — " +
        "/about/careers renders the default stack from data/careersPage.ts.",
    );
    return defaultCareersSections;
  }
  return sections;
}
