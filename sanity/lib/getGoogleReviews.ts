import "server-only";

/**
 * OPTIONAL live refresh of the aggregate figures from the Places API (New).
 *
 * Deliberately a no-op returning null unless BOTH `GOOGLE_PLACES_API_KEY` and
 * a resolved place ID are present — the site must never depend on Google's
 * API being reachable or configured.
 *
 * This is only a source for the AGGREGATE numbers (rating, count). It must
 * never replace the curated review list: the API hard-caps at 5 reviews per
 * place, cannot paginate to 133, and cannot choose which 5 — swapping the 20
 * curated reviews for an arbitrary 5 would be a regression, not a refresh.
 */

export interface GooglePlacesSnapshot {
  rating: number;
  reviewCount: number;
  /** The (at most 5) reviews Google returns — informational only. */
  reviews: unknown[];
}

export async function getGoogleReviews(
  placeId: string | undefined,
): Promise<GooglePlacesSnapshot | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !placeId) return null;

  try {
    const resource = placeId.startsWith("places/")
      ? placeId
      : `places/${placeId}`;
    const response = await fetch(
      `https://places.googleapis.com/v1/${resource}?fields=rating,userRatingCount,reviews`,
      {
        headers: { "X-Goog-Api-Key": apiKey },
        // Same backstop cadence as the Sanity fetchers.
        next: { revalidate: 86400 },
      },
    );
    if (!response.ok) {
      console.warn(
        `[places] ${resource} returned ${response.status} — aggregate refresh skipped.`,
      );
      return null;
    }
    const data = (await response.json()) as {
      rating?: number;
      userRatingCount?: number;
      reviews?: unknown[];
    };
    if (typeof data.rating !== "number" || typeof data.userRatingCount !== "number") {
      return null;
    }
    return {
      rating: data.rating,
      reviewCount: data.userRatingCount,
      reviews: data.reviews ?? [],
    };
  } catch (error) {
    console.warn("[places] aggregate refresh failed — using CMS figures.", error);
    return null;
  }
}
