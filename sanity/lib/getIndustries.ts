import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { resolvePhoto } from "@/sanity/lib/image";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { toSections } from "@/sanity/lib/sections";
import { INDUSTRIES_QUERY, INDUSTRY_BY_SLUG_QUERY } from "@/sanity/queries";
import type {
  INDUSTRIES_QUERY_RESULT,
  INDUSTRY_BY_SLUG_QUERY_RESULT,
} from "@/sanity.types";
import { industries as fallbackIndustries, type Industry } from "@/data/industries";
import type { RichBody } from "@/data/services";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const INDUSTRY_TAG = "industry";

type IndustryListItem = INDUSTRIES_QUERY_RESULT[number];
type IndustryDetailItem = NonNullable<INDUSTRY_BY_SLUG_QUERY_RESULT>;

function toIndustry(item: IndustryListItem | IndustryDetailItem): Industry | null {
  if (!item.title || !item.slug || !item.description || !item.bulletPoints?.length) {
    return null;
  }
  return {
    title: item.title,
    slug: item.slug,
    description: item.description,
    body: item.body?.length ? (item.body as RichBody) : undefined,
    sections:
      "sections" in item && item.sections
        ? toSections(item.sections as unknown, `industry "${item.slug}"`)
        : undefined,
    seoTitle: item.seoTitle ?? undefined,
    seoDescription: item.seoDescription ?? undefined,
    image: "",
    imageAlt: `${item.title} property`,
    bulletPoints: item.bulletPoints,
    photo: resolvePhoto(item.photo, 1600, `industry "${item.slug}" → Photo`),
  };
}

/**
 * Property types ordered by the client-controlled `order` field.
 * FAILED fetch → static fallback (loud). Successful EMPTY result → empty
 * array: the homepage section hides and no /multifamily/[slug] pages
 * generate.
 */
export async function getIndustries(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<Industry[]> {
  let result: INDUSTRIES_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      INDUSTRIES_QUERY,
      {},
      INDUSTRY_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getIndustries",
      fallbackFile: "data/industries.ts",
      affects: "homepage industries section + all /multifamily/[slug] pages",
      error,
    });
    return fallbackIndustries;
  }

  const industries = result
    .map(toIndustry)
    .filter((i): i is Industry => i !== null);

  if (industries.length === 0) {
    logEmpty("getIndustries", "the homepage industries section is hidden and no property-type pages are generated.");
  }
  return industries;
}

/** Single property type for /multifamily/[slug]. Null = not found (404). */
export async function getIndustryBySlug(
  slug: string,
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<Industry | null> {
  try {
    const result = await fetchSanityCached(
      INDUSTRY_BY_SLUG_QUERY,
      { slug },
      INDUSTRY_TAG,
      options,
    );
    return result ? toIndustry(result) : null;
  } catch (error) {
    logFallback({
      fetcher: `getIndustryBySlug(${slug})`,
      fallbackFile: "data/industries.ts",
      affects: `/multifamily/${slug}`,
      error,
    });
    return fallbackIndustries.find((i) => i.slug === slug) ?? null;
  }
}
