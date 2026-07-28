import "server-only";
import { serverClient } from "@/sanity/lib/serverClient";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { sanityFetchOptions } from "@/sanity/lib/cacheOptions";
import { REVIEW_SETTINGS_QUERY } from "@/sanity/queries";
import { getGoogleReviews } from "@/sanity/lib/getGoogleReviews";
import {
  googleReviews as fallbackProfile,
  type GoogleReviewProfile,
} from "@/data/googleReviews";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const REVIEW_SETTINGS_TAG = "reviewSettings";

/**
 * The Google-listing profile shown around review sections: aggregate rating,
 * review count, and the outbound links. Sanity overrides the constants in
 * `data/googleReviews.ts` field by field; a broken CMS must never remove the
 * rating badge. When the optional Places refresh is configured (off by
 * default — see getGoogleReviews), its LIVE aggregate wins over both.
 */
export async function getReviewSettings(): Promise<GoogleReviewProfile> {
  let profile: GoogleReviewProfile;
  try {
    const result = await serverClient.fetch(
      REVIEW_SETTINGS_QUERY,
      {},
      sanityFetchOptions(REVIEW_SETTINGS_TAG),
    );

    if (!result) {
      console.error(
        "[sanity] reviewSettings document not found — serving fallback from data/googleReviews.ts. " +
          "Publish the Google Reviews document in /studio.",
      );
      profile = fallbackProfile;
    } else {
      profile = {
        ...fallbackProfile,
        rating: result.rating ?? fallbackProfile.rating,
        reviewCount: result.reviewCount ?? fallbackProfile.reviewCount,
        verifiedOn: result.verifiedOn ?? fallbackProfile.verifiedOn,
        reviewsUrl: result.reviewsUrl ?? fallbackProfile.reviewsUrl,
        writeReviewUrl: result.writeReviewUrl ?? undefined,
        headline: result.headline ?? undefined,
      };
    }
  } catch (error) {
    logFallback({
      fetcher: "getReviewSettings",
      fallbackFile: "data/googleReviews.ts",
      affects: "Google rating badge + review-section links on every page",
      error,
    });
    profile = fallbackProfile;
  }

  // Optional live aggregate — no-op (null) unless the Places key and place ID
  // are configured. Only the numbers refresh; never the curated review list.
  const live = await getGoogleReviews(profile.placeId);
  if (live) {
    profile = {
      ...profile,
      rating: live.rating,
      reviewCount: live.reviewCount,
    };
  }

  return profile;
}
