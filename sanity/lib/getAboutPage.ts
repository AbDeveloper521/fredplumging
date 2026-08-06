import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { toLibrarySections } from "@/sanity/lib/sectionLibrary";
import { ABOUT_PAGE_QUERY } from "@/sanity/queries";
import type { ABOUT_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultAboutSections } from "@/data/aboutPage";
import type { LibrarySection } from "@/data/sectionLibrary";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const ABOUT_PAGE_TAG = "aboutPage";

/**
 * The About-page section stack — same singleton seam pattern as
 * `getHomePage()`: a thrown fetch serves the full default stack (loud); a
 * missing document or one without a `sections` array serves it quietly
 * (that also covers a document still published in the pre-stack fixed-field
 * shape — its old fields are ignored, the default stack renders, and the
 * migration script moves the content across); a published stack wins, with
 * each item's missing fields falling back to that section type's default
 * copy in `data/aboutPage.ts`.
 */
export async function getAboutPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LibrarySection[]> {
  let result: ABOUT_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      ABOUT_PAGE_QUERY,
      {},
      ABOUT_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getAboutPage",
      fallbackFile: "data/aboutPage.ts",
      affects: "/about section order, copy and photos",
      error,
    });
    return defaultAboutSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] aboutPage document not published yet — /about renders the default stack from data/aboutPage.ts.",
    );
    return defaultAboutSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] aboutPage document has no `sections` array (old fixed-field shape or empty) — " +
        "/about renders the default stack from data/aboutPage.ts. " +
        "Run scripts/migrate-about-sections.ts, or open About Page in /studio and publish the sections list.",
    );
    return defaultAboutSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the default page over their intent.
  const sections = toLibrarySections(result.sections, "aboutPage");
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) return [];
    console.warn(
      "[sanity] aboutPage sections are published but none survived validation — " +
        "/about renders the default stack from data/aboutPage.ts.",
    );
    return defaultAboutSections;
  }
  return sections;
}
