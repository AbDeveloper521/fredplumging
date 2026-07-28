import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { CONTACT_PAGE_QUERY } from "@/sanity/queries";
import type { CONTACT_PAGE_QUERY_RESULT } from "@/sanity.types";
import {
  contactPage as fallbackContactPage,
  type ContactPageContent,
} from "@/data/contactPage";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const CONTACT_PAGE_TAG = "contactPage";

/**
 * Contact-page copy — same singleton seam pattern as `getSite()`: a thrown
 * fetch serves the full fallback (loud); an unpublished singleton serves the
 * fallback with a quieter note (nothing to resurrect — the fallback IS the
 * shipped copy until the document exists); a published document wins
 * field-by-field.
 */
export async function getContactPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<ContactPageContent> {
  let result: CONTACT_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      CONTACT_PAGE_QUERY,
      {},
      CONTACT_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getContactPage",
      fallbackFile: "data/contactPage.ts",
      affects: "/contact hero copy, hours, and FAQ",
      error,
    });
    return fallbackContactPage;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] contactPage document not published yet — /contact renders from data/contactPage.ts.",
    );
    return fallbackContactPage;
  }

  return {
    heroEyebrow: result.heroEyebrow ?? fallbackContactPage.heroEyebrow,
    heroHeading: result.heroHeading ?? fallbackContactPage.heroHeading,
    heroIntro: result.heroIntro ?? fallbackContactPage.heroIntro,
    responsePromise:
      result.responsePromise ?? fallbackContactPage.responsePromise,
    hours:
      result.hours
        ?.filter(
          (row): row is { days: string; hours: string } =>
            Boolean(row.days) && Boolean(row.hours),
        )
        .map((row) => ({ days: row.days, hours: row.hours })) ??
      fallbackContactPage.hours,
    emergencyHeading:
      result.emergencyHeading ?? fallbackContactPage.emergencyHeading,
    emergencyBody: result.emergencyBody ?? fallbackContactPage.emergencyBody,
    faqs:
      result.faqs
        ?.filter(
          (faq): faq is { question: string; answer: string } =>
            Boolean(faq.question) && Boolean(faq.answer),
        )
        .map((faq) => ({ question: faq.question, answer: faq.answer })) ??
      fallbackContactPage.faqs,
  };
}
