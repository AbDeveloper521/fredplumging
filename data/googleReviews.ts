import { services } from "./services";
import { industries } from "./industries";

/**
 * Fred's Plumbing's Google Business Profile — the identifiers and the
 * aggregate figures shown around the review sections.
 *
 * Verified against the live listing on 28 July 2026:
 *   rating 5.0 · 133 reviews · FID 0x6d28a9a9242e61cb:0x10c8773cb4095848
 *
 * As of the reviews phase these constants are the FALLBACK: the site reads via
 * `getReviewSettings()` in `sanity/lib/getReviewSettings.ts`, so the client can
 * update the count in the Studio without a redeploy.
 *
 * IMPORTANT — no AggregateRating in JSON-LD. Google does not allow a business
 * to mark up its own rating for its own LocalBusiness/Organization entity;
 * self-serving markup is ineligible for review rich results and can trigger a
 * structured-data manual action. These numbers are for humans, in visible page
 * copy only. Do not add them to `components/seo/JsonLd.tsx`.
 */

export interface GoogleReviewProfile {
  /** Average star rating shown beside the count, e.g. 5.0. */
  rating: number;
  /** Total public reviews on the listing. */
  reviewCount: number;
  /** Month the figures above were last verified — shown as "as of …". */
  verifiedOn: string;
  /** Public listing, reviews tab open. */
  reviewsUrl: string;
  /** Canonical CID permalink — survives listing renames. */
  listingUrl: string;
  /** Short link from the client's Google Business Profile. */
  shortUrl: string;
  /** Direct "write a review" link — shown as a button when set. */
  writeReviewUrl?: string;
  /** Overrides the default review-section eyebrow ("Client Feedback"). */
  headline?: string;
  /** Google's internal feature ID for the listing. */
  featureId: string;
  /** Decimal form of the second half of the feature ID. */
  cid: string;
  /**
   * Places API (New) resource name, `places/ChIJ…`. Left undefined until
   * resolved — see `scripts/resolve-place-id.ts`. Only needed if the live
   * Places refresh in `sanity/lib/getGoogleReviews.ts` is switched on.
   */
  placeId?: string;
}

export const googleReviews: GoogleReviewProfile = {
  rating: 5.0,
  reviewCount: 133,
  verifiedOn: "July 2026",
  reviewsUrl:
    "https://www.google.com/maps/place/Fred's+Plumbing/data=!4m8!3m7!1s0x6d28a9a9242e61cb:0x10c8773cb4095848!9m1!1b1",
  listingUrl: "https://www.google.com/maps?cid=1209347602551232584",
  shortUrl: "https://maps.app.goo.gl/9udwmxZNR5SKHRrJ6",
  featureId: "0x6d28a9a9242e61cb:0x10c8773cb4095848",
  cid: "1209347602551232584",
};

/**
 * Every slug a review may be tagged with — the union of live service and
 * property-type routes. Used to validate `serviceTags` coming out of the CMS
 * so a typo can't quietly hide a review from every page.
 */
export const REVIEW_TAGS: readonly string[] = [
  ...services.map((service) => service.slug),
  ...industries.map((industry) => industry.slug),
];

/**
 * Default review tags per service / property-type page — which reviews a
 * page prefers when its CMS document doesn't say otherwise. Property-type
 * pages simply prefer reviews tagged with their own slug.
 */
export const DEFAULT_PAGE_REVIEW_TAGS: Record<string, string[]> = {
  "emergency-plumbing": ["emergency-plumbing"],
  "commercial-plumbing": ["commercial-plumbing", "maintenance"],
  "drain-sewer": ["drain-sewer"],
  plumbing: ["plumbing"],
  maintenance: ["maintenance", "commercial-plumbing"],
  "specialty-services": ["commercial-plumbing", "plumbing"],
  "senior-care-facilities": ["commercial-plumbing", "plumbing"],
  "student-housing": ["apartments", "commercial-plumbing"],
  apartments: ["apartments"],
  condos: ["condos"],
  "assisted-living": ["assisted-living"],
  "nursing-homes": ["nursing-homes"],
};

export function isReviewTag(value: unknown): value is string {
  return typeof value === "string" && REVIEW_TAGS.includes(value);
}

/**
 * Reviews relevant to a page, most recent first, with a graceful widening:
 * tagged reviews are preferred, but if fewer than `min` match, untagged and
 * other reviews top up the list rather than leaving a thin or empty section.
 */
export function reviewsForTags<T extends { serviceTags?: string[] }>(
  all: T[],
  tags: string[] | undefined,
  { limit = 4, min = 3 }: { limit?: number; min?: number } = {},
): T[] {
  if (!tags || tags.length === 0) return all.slice(0, limit);

  const matches = all.filter((review) =>
    review.serviceTags?.some((tag) => tags.includes(tag)),
  );
  if (matches.length >= min) return matches.slice(0, limit);

  const rest = all.filter((review) => !matches.includes(review));
  return [...matches, ...rest].slice(0, limit);
}
