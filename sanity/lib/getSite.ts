import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { cacheLife } from "next/cache";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { SITE_URL } from "@/lib/siteUrl";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";
import {
  site as fallbackSite,
  serviceAreaCities as fallbackCities,
  type SiteContent,
} from "@/data/site";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const SITE_SETTINGS_TAG = "siteSettings";

/**
 * "30+" derived from the founding year, so the display value can never
 * quietly age the way the old hardcoded "27+" did. Reading the current
 * year is only allowed inside a cache scope under Cache Components; the
 * "days" profile re-derives daily, which is plenty for a value that
 * changes once a year.
 */
async function derivedYears(foundedYear: number): Promise<string> {
  "use cache";
  cacheLife("days");
  return `${new Date().getFullYear() - foundedYear}+`;
}

async function resolveFallback(): Promise<SiteContent> {
  return {
    ...fallbackSite,
    serviceAreaCities: fallbackCities,
    yearsInBusiness:
      fallbackSite.yearsInBusiness ??
      (await derivedYears(fallbackSite.foundedYear)),
  };
}

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
  const FALLBACK = await resolveFallback();
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

  const publishedHours =
    result.hours
      ?.filter(
        (row): row is { days: string; hours: string } =>
          Boolean(row.days) && Boolean(row.hours),
      )
      .map((row) => ({ days: row.days, hours: row.hours })) ?? [];

  const merged: SiteContent = {
    name: result.name ?? FALLBACK.name,
    legalName: result.legalName ?? FALLBACK.legalName,
    tagline: result.tagline ?? FALLBACK.tagline,
    phone: result.phone ?? FALLBACK.phone,
    phoneHref: result.phoneHref ?? FALLBACK.phoneHref,
    email: result.email ?? FALLBACK.email,
    emailHref: result.emailHref ?? FALLBACK.emailHref,
    serviceArea: result.serviceArea ?? FALLBACK.serviceArea,
    // Rows missing either half are dropped rather than rendered half-blank;
    // nothing usable left falls back, so the details column is never
    // hours-less.
    hours: publishedHours.length > 0 ? publishedHours : FALLBACK.hours,
    foundedYear: result.foundedYear ?? FALLBACK.foundedYear,
    // Sanity is a manual OVERRIDE; when empty the value derives from the
    // founding year (see derivedYears above).
    yearsInBusiness:
      result.yearsInBusiness ??
      (await derivedYears(result.foundedYear ?? FALLBACK.foundedYear)),
    // NOT from Sanity: the public origin is a deployment fact (see
    // lib/siteUrl.ts). A stale CMS value here would silently publish
    // canonicals and sitemap entries pointing at the wrong host.
    url: SITE_URL,
    licenseNumber: result.licenseNumber ?? FALLBACK.licenseNumber,
    streetAddress: result.streetAddress ?? FALLBACK.streetAddress,
    addressLocality: result.addressLocality ?? FALLBACK.addressLocality,
    addressRegion: result.addressRegion ?? FALLBACK.addressRegion,
    postalCode: result.postalCode ?? FALLBACK.postalCode,
    mapHeading: result.mapHeading ?? FALLBACK.mapHeading,
    mapDescription: result.mapDescription ?? FALLBACK.mapDescription,
    mapEmbedUrl: result.mapEmbedUrl ?? FALLBACK.mapEmbedUrl,
    serviceAreaCities: result.serviceAreaCities?.length
      ? result.serviceAreaCities
      : FALLBACK.serviceAreaCities,
  };

  // Optional fields (street address) that are ALSO unset in the fallback are
  // legitimately absent — not drift worth warning about. The map-band fields
  // carry built-in defaults and are optional overrides: unset is normal.
  const OPTIONAL_OVERRIDES: ReadonlySet<string> = new Set([
    "mapHeading",
    "mapDescription",
    "mapEmbedUrl",
    // Same deal: the shipped rows in data/site.ts ARE the real hours until
    // the owner edits them in Studio, so unset is normal, not a gap.
    "hours",
  ]);
  const missing = (
    Object.keys(result) as Array<keyof typeof result>
  ).filter(
    (key) =>
      !OPTIONAL_OVERRIDES.has(key) &&
      result[key] == null &&
      FALLBACK[key as keyof SiteContent] != null,
  );
  if (missing.length > 0) {
    console.warn(
      `[sanity] siteSettings is missing fields (${missing.join(", ")}) — ` +
        "those fields are served from the data/site.ts fallback.",
    );
  }

  return merged;
}
