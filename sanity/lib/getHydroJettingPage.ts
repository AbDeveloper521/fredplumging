import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { FAQ_SET_TAG, toLibrarySections } from "@/sanity/lib/sectionLibrary";
import { HYDRO_JETTING_PAGE_QUERY } from "@/sanity/queries";
import type { HYDRO_JETTING_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultHydroJettingSections } from "@/data/hydroJettingPage";
import type { LibrarySection } from "@/data/sectionLibrary";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const HYDRO_JETTING_PAGE_TAG = "hydroJettingPage";

/**
 * The /commercial/hydro-jetting section stack — same singleton seam pattern as
 * `getCommercialPage()`: a thrown fetch serves the default stack (loud); a
 * missing document or one without a `sections` array serves it quietly; a
 * published stack wins, with each item's missing fields falling back to that
 * section type's default copy.
 */
export async function getHydroJettingPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LibrarySection[]> {
  let result: HYDRO_JETTING_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      HYDRO_JETTING_PAGE_QUERY,
      {},
      [HYDRO_JETTING_PAGE_TAG, FAQ_SET_TAG],
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getHydroJettingPage",
      fallbackFile: "data/hydroJettingPage.ts",
      affects: "/commercial/hydro-jetting section order and copy",
      error,
    });
    return defaultHydroJettingSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] hydroJettingPage document not published yet — /commercial/hydro-jetting renders the default stack from data/hydroJettingPage.ts.",
    );
    return defaultHydroJettingSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] hydroJettingPage document has no `sections` array — " +
        "/commercial/hydro-jetting renders the default stack from " +
        "data/hydroJettingPage.ts. Run scripts/seed-hydro-jetting-page.ts, " +
        "or open Hydro Jetting Page in /studio and publish the sections list.",
    );
    return defaultHydroJettingSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the placeholder over their intent.
  const sections = toLibrarySections(result.sections, "hydroJettingPage");
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return [];
    console.warn(
      "[sanity] hydroJettingPage sections are published but none survived validation — " +
        "/commercial/hydro-jetting renders the default stack from data/hydroJettingPage.ts.",
    );
    return defaultHydroJettingSections;
  }
  return sections;
}
