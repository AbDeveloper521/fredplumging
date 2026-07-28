import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { FAQS_QUERY } from "@/sanity/queries";
import { faqs as fallbackFaqs, type Faq } from "@/data/faqs";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const FAQ_TAG = "faq";

/**
 * FAQs ordered by the client-controlled `order` field.
 * FAILED fetch → static fallback (loud). Successful EMPTY result → empty
 * array: the homepage FAQ section hides — deleted questions must not
 * resurrect from the static file.
 */
export async function getFaqs(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<Faq[]> {
  try {
    const result = await fetchSanityCached(FAQS_QUERY, {}, FAQ_TAG, options);

    const faqs: Faq[] = [];
    for (const item of result) {
      if (item.question && item.answer) {
        faqs.push({ question: item.question, answer: item.answer });
      }
    }

    if (faqs.length === 0) {
      logEmpty("getFaqs", "the homepage FAQ section is hidden.");
    }
    return faqs;
  } catch (error) {
    logFallback({
      fetcher: "getFaqs",
      fallbackFile: "data/faqs.ts",
      affects: "homepage FAQ section",
      error,
    });
    return fallbackFaqs;
  }
}
