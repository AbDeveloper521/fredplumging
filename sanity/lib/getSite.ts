import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";
import {
  site as fallbackSite,
  serviceAreaCities as fallbackCities,
  type SiteContent,
} from "@/data/site";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const SITE_SETTINGS_TAG = "siteSettings";

const FALLBACK: SiteContent = {
  ...fallbackSite,
  serviceAreaCities: fallbackCities,
};

/**
 * The single seam between the app and Sanity for site settings.
 *
 * Fetched through the shared `'use cache'` boundary in sanity/lib/live.ts
 * and tagged, so every page reuses one cached result; Sanity Live and the
 * /api/revalidate webhook both revalidate the tag on publish. If Sanity is
 * unreachable or the document is incomplete, each missing field falls back
 * to `data/site.ts` — a broken CMS must never remove the phone number.
 */
export async function getSite(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<SiteContent> {
  let result: SITE_SETTINGS_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      SITE_SETTINGS_QUERY,
      {},
      SITE_SETTINGS_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getSite",
      fallbackFile: "data/site.ts",
      affects: "EVERY page (header, footer, metadata, phone numbers)",
      error,
    });
    return FALLBACK;
  }

  if (!result) {
    console.error(
      "[sanity] siteSettings document not found — serving fallback from data/site.ts. " +
        "Publish the Site Settings document in /studio.",
    );
    return FALLBACK;
  }

  const merged: SiteContent = {
    name: result.name ?? FALLBACK.name,
    legalName: result.legalName ?? FALLBACK.legalName,
    tagline: result.tagline ?? FALLBACK.tagline,
    phone: result.phone ?? FALLBACK.phone,
    phoneHref: result.phoneHref ?? FALLBACK.phoneHref,
    email: result.email ?? FALLBACK.email,
    emailHref: result.emailHref ?? FALLBACK.emailHref,
    serviceArea: result.serviceArea ?? FALLBACK.serviceArea,
    foundedYear: result.foundedYear ?? FALLBACK.foundedYear,
    yearsInBusiness: result.yearsInBusiness ?? FALLBACK.yearsInBusiness,
    url: result.url ?? FALLBACK.url,
    licenseNumber: result.licenseNumber ?? FALLBACK.licenseNumber,
    streetAddress: result.streetAddress ?? FALLBACK.streetAddress,
    addressLocality: result.addressLocality ?? FALLBACK.addressLocality,
    addressRegion: result.addressRegion ?? FALLBACK.addressRegion,
    postalCode: result.postalCode ?? FALLBACK.postalCode,
    serviceAreaCities: result.serviceAreaCities?.length
      ? result.serviceAreaCities
      : FALLBACK.serviceAreaCities,
  };

  // Optional fields (street address) that are ALSO unset in the fallback are
  // legitimately absent — not drift worth warning about.
  const missing = (
    Object.keys(result) as Array<keyof typeof result>
  ).filter(
    (key) =>
      result[key] == null && FALLBACK[key as keyof SiteContent] != null,
  );
  if (missing.length > 0) {
    console.warn(
      `[sanity] siteSettings is missing fields (${missing.join(", ")}) — ` +
        "those fields are served from the data/site.ts fallback.",
    );
  }

  return merged;
}
