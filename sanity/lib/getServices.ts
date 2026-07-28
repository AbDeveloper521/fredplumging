import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { resolvePhoto } from "@/sanity/lib/image";
import { toSections } from "@/sanity/lib/sections";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { SERVICES_QUERY, SERVICE_BY_SLUG_QUERY } from "@/sanity/queries";
import type {
  SERVICES_QUERY_RESULT,
  SERVICE_BY_SLUG_QUERY_RESULT,
} from "@/sanity.types";
import {
  services as fallbackServices,
  type RichBody,
  type Service,
} from "@/data/services";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const SERVICE_TAG = "service";

function toIcon(value: string | null | undefined): NavIconName {
  return value && (NAV_ICON_NAMES as readonly string[]).includes(value)
    ? (value as NavIconName)
    : "wrench";
}

type ServiceListItem = SERVICES_QUERY_RESULT[number];
type ServiceDetailItem = NonNullable<SERVICE_BY_SLUG_QUERY_RESULT>;

function toService(item: ServiceListItem | ServiceDetailItem): Service | null {
  if (!item.title || !item.slug || !item.shortDescription) return null;
  return {
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    body: item.body?.length ? (item.body as RichBody) : undefined,
    sections:
      "sections" in item && item.sections
        ? toSections(item.sections as unknown, `service "${item.slug}"`)
        : undefined,
    seoTitle: item.seoTitle ?? undefined,
    seoDescription: item.seoDescription ?? undefined,
    image: "",
    imageAlt: `${item.title} at a commercial property`,
    icon: toIcon(item.icon),
    featured: item.featured ?? undefined,
    photo: resolvePhoto(item.photo, 1600, `service "${item.slug}" → Photo`),
  };
}

/**
 * Services ordered by the client-controlled `order` field.
 * FAILED fetch → static fallback (loud). Successful EMPTY result → empty
 * array: the homepage grid hides and no /services/[slug] pages generate —
 * deleted services must not resurrect from the static file.
 */
export async function getServices(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<Service[]> {
  let result: SERVICES_QUERY_RESULT;
  try {
    result = await fetchSanityCached(SERVICES_QUERY, {}, SERVICE_TAG, options);
  } catch (error) {
    logFallback({
      fetcher: "getServices",
      fallbackFile: "data/services.ts",
      affects: "homepage services grid + all /services/[slug] pages",
      error,
    });
    return fallbackServices;
  }

  const services = result
    .map(toService)
    .filter((s): s is Service => s !== null);

  if (services.length === 0) {
    logEmpty("getServices", "the homepage services grid is hidden and no service pages are generated.");
  }
  return services;
}

/** Single service for /services/[slug]. Null = genuinely not found (404). */
export async function getServiceBySlug(
  slug: string,
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<Service | null> {
  try {
    const result = await fetchSanityCached(
      SERVICE_BY_SLUG_QUERY,
      { slug },
      SERVICE_TAG,
      options,
    );
    return result ? toService(result) : null;
  } catch (error) {
    logFallback({
      fetcher: `getServiceBySlug(${slug})`,
      fallbackFile: "data/services.ts",
      affects: `/services/${slug}`,
      error,
    });
    return fallbackServices.find((s) => s.slug === slug) ?? null;
  }
}
