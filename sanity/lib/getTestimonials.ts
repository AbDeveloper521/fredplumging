import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { TESTIMONIALS_QUERY } from "@/sanity/queries";
import {
  testimonials as fallbackTestimonials,
  type Testimonial,
} from "@/data/testimonials";
import { isReviewTag } from "@/data/googleReviews";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const TESTIMONIAL_TAG = "testimonial";

/**
 * Testimonials ordered by the client-controlled `order` field. Falls back to
 * `data/testimonials.ts` on fetch failure or when nothing is published yet.
 */
export async function getTestimonials(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<Testimonial[]> {
  try {
    const result = await fetchSanityCached(
      TESTIMONIALS_QUERY,
      {},
      TESTIMONIAL_TAG,
      options,
    );

    const testimonials: Testimonial[] = [];
    for (const item of result) {
      if (item.name && item.quote && item.date) {
        testimonials.push({
          id: item.id,
          name: item.name,
          role: item.role ?? undefined,
          rating: item.rating ?? 5,
          quote: item.quote,
          date: item.date,
          featured: item.featured ?? undefined,
          source: item.source === "direct" ? "direct" : "google",
          reviewerMeta: item.reviewerMeta ?? undefined,
          sourceUrl: item.sourceUrl ?? undefined,
          // Unknown slugs are dropped (a typo must not hide the review from
          // every page); an empty result means "untagged", shown everywhere.
          serviceTags: item.serviceTags?.filter(isReviewTag),
          ownerReply: item.ownerReply ?? undefined,
          ownerReplyDate: item.ownerReplyDate ?? undefined,
        });
      }
    }

    if (testimonials.length === 0) {
      // Deliberately NOT the fallback: if the client deletes their last
      // testimonial, the deleted quote must not resurrect from the static
      // file — that's a consent problem. The section hides instead.
      logEmpty("getTestimonials", "the homepage testimonials section is hidden.");
    }
    return testimonials;
  } catch (error) {
    logFallback({
      fetcher: "getTestimonials",
      fallbackFile: "data/testimonials.ts",
      affects: "homepage testimonials section",
      error,
    });
    return fallbackTestimonials;
  }
}
