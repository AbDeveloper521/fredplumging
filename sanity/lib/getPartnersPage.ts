import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { toLibrarySections } from "@/sanity/lib/sectionLibrary";
import { PARTNERS_PAGE_QUERY } from "@/sanity/queries";
import type { PARTNERS_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultPartnersSections } from "@/data/partnersPage";
import type { LibrarySection } from "@/data/sectionLibrary";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const PARTNERS_PAGE_TAG = "partnersPage";

/**
 * The Partners-page section stack — same singleton seam pattern as
 * `getAboutPage()`: a thrown fetch serves the full default stack (loud); a
 * missing document or one without a `sections` array serves it quietly; a
 * published stack wins, with each item's missing fields falling back to
 * that section type's default copy in `data/partnersPage.ts`.
 */
export async function getPartnersPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LibrarySection[]> {
  let result: PARTNERS_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      PARTNERS_PAGE_QUERY,
      {},
      PARTNERS_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getPartnersPage",
      fallbackFile: "data/partnersPage.ts",
      affects: "/about/partners section order and copy",
      error,
    });
    return defaultPartnersSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] partnersPage document not published yet — /about/partners renders the default stack from data/partnersPage.ts.",
    );
    return defaultPartnersSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] partnersPage document has no `sections` array — /about/partners " +
        "renders the default stack from data/partnersPage.ts. Run " +
        "scripts/seed-partners-sections.ts, or open Partners Page in /studio " +
        "and publish the sections list.",
    );
    return defaultPartnersSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the default page over their intent.
  const sections = toLibrarySections(result.sections, "partnersPage");
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return [];
    console.warn(
      "[sanity] partnersPage sections are published but none survived validation — " +
        "/about/partners renders the default stack from data/partnersPage.ts.",
    );
    return defaultPartnersSections;
  }
  return sections;
}
