import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { FAQ_SET_TAG, toLibrarySections } from "@/sanity/lib/sectionLibrary";
import { CONTACT_PAGE_QUERY } from "@/sanity/queries";
import type { CONTACT_PAGE_QUERY_RESULT } from "@/sanity.types";
import { defaultContactSections } from "@/data/contactPage";
import type { LibrarySection } from "@/data/sectionLibrary";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const CONTACT_PAGE_TAG = "contactPage";

/**
 * Says so loudly when the page that exists to capture leads has no way to
 * capture them. The Studio warns the owner at publish time; this is the
 * runtime half of the same check, for the case where it was published
 * anyway or the band was dropped by validation.
 */
function warnIfFormless(sections: LibrarySection[]): void {
  if (sections.some((section) => section._type === "contactForm")) return;
  console.warn(
    "[sanity] contactPage renders with NO contactForm section — visitors " +
      "cannot submit a request and every enquiry must arrive by phone. If " +
      "that is not intended, add “Contact form (lead capture)” to Contact " +
      "Page in /studio (or untick “Hide this section” on it).",
  );
}

/**
 * The /contact section stack — same singleton seam pattern as
 * `getMultifamilyIndexPage()`: a thrown fetch serves the default stack
 * (loud); a missing document or one without a `sections` array serves it
 * quietly; a published stack wins, with each item's missing fields falling
 * back to that section type's default copy.
 */
export async function getContactPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<LibrarySection[]> {
  let result: CONTACT_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      CONTACT_PAGE_QUERY,
      {},
      [CONTACT_PAGE_TAG, FAQ_SET_TAG],
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getContactPage",
      fallbackFile: "data/contactPage.ts",
      affects: "/contact section order and copy",
      error,
    });
    return defaultContactSections;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] contactPage document not published yet — /contact renders the default stack from data/contactPage.ts.",
    );
    return defaultContactSections;
  }

  if (!result.sections) {
    console.warn(
      "[sanity] contactPage document has no `sections` array — /contact " +
        "renders the default stack from data/contactPage.ts. Run " +
        "scripts/seed-contact-sections.ts, or open Contact Page in /studio " +
        "and publish the sections list.",
    );
    return defaultContactSections;
  }

  // An empty mapping result means every published item is hidden or invalid.
  // All-hidden is a deliberate owner choice; render nothing rather than
  // resurrecting the default page over their intent.
  const sections = toLibrarySections(result.sections, "contactPage");
  if (!sections) {
    const allHidden =
      result.sections.length > 0 &&
      result.sections.every(
        (item) => (item as { hidden?: boolean }).hidden === true,
      );
    if (allHidden) {
      warnIfFormless([]);
      return [];
    }
    console.warn(
      "[sanity] contactPage sections are published but none survived validation — " +
        "/contact renders the default stack from data/contactPage.ts.",
    );
    return defaultContactSections;
  }
  warnIfFormless(sections);
  return sections;
}
