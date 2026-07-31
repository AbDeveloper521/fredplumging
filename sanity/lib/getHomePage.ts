import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { toHomeSections } from "@/sanity/lib/homeSections";
import { HOME_PAGE_QUERY } from "@/sanity/queries";
import type { HOME_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultHomeSections, type HomeSection } from "@/data/homePage";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const HOME_PAGE_TAG = "homePage";

/**
 * The homepage section stack — same singleton seam pattern as `getSite()`:
 * a thrown fetch serves the full default stack (loud); a missing document
 * or one without a `sections` array serves it quietly (that also covers a
 * document still published in the pre-stack grouped shape — its old fields
 * are ignored, the default stack renders, and the owner rebuilds in the new
 * structure); a published stack wins, with each item's missing fields
 * falling back to that section type's default copy in `data/homePage.ts`.
 */
export async function getHomePage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<HomeSection[]> {
  let result: HOME_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(HOME_PAGE_QUERY, {}, HOME_PAGE_TAG, options);
  } catch (error) {
    logFallback({
      fetcher: "getHomePage",
      fallbackFile: "data/homePage.ts",
      affects: "homepage section order, copy and photos",
      error,
    });
    return defaultHomeSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] homePage document not published yet — the homepage renders the default stack from data/homePage.ts.",
    );
    return defaultHomeSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] homePage document has no `sections` array (old grouped shape or empty) — " +
        "the homepage renders the default stack from data/homePage.ts. " +
        "Open Home Page in /studio and publish the sections list to take control.",
    );
    return defaultHomeSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the default page over their intent.
  const sections = toHomeSections(result.sections);
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every((item) => (item as { hidden?: boolean }).hidden === true);
    if (allHidden) return [];
    console.warn(
      "[sanity] homePage sections are published but none survived validation — " +
        "the homepage renders the default stack from data/homePage.ts.",
    );
    return defaultHomeSections;
  }
  return sections;
}
