import "server-only";
import { serverClient } from "@/sanity/lib/serverClient";
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
 * Cached statically (`force-cache`) and tagged, so every page reuses one
 * fetch per build; the webhook revalidates the tag on publish. If Sanity is
 * unreachable or the document is incomplete, each missing field falls back
 * to `data/site.ts` — a broken CMS must never remove the phone number.
 */
export async function getSite(): Promise<SiteContent> {
  let result: SITE_SETTINGS_QUERY_RESULT;
  try {
    result = await serverClient.fetch(
      SITE_SETTINGS_QUERY,
      {},
      // Tag invalidation (webhook) is primary; the 24h revalidate is a
      // backstop so a silently broken webhook can't freeze content forever.
      { next: { revalidate: 86400, tags: [SITE_SETTINGS_TAG] } },
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
    serviceAreaCities: result.serviceAreaCities?.length
      ? result.serviceAreaCities
      : FALLBACK.serviceAreaCities,
  };

  const missing = (
    Object.keys(result) as Array<keyof typeof result>
  ).filter((key) => result[key] == null);
  if (missing.length > 0) {
    console.warn(
      `[sanity] siteSettings is missing fields (${missing.join(", ")}) — ` +
        "those fields are served from the data/site.ts fallback.",
    );
  }

  return merged;
}
