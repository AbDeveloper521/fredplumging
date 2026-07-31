import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { resolvePhoto } from "@/sanity/lib/image";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { CITY_PAGE_QUERY } from "@/sanity/queries";
import type { CITY_PAGE_QUERY_RESULT } from "@/sanity.types";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import {
  cities,
  cityHref,
  type CityPageContent,
  type CityServiceCard,
} from "@/data/cities";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const CITY_PAGE_TAG = "cityPage";

function toIcon(value: string | null | undefined): NavIconName {
  return value && (NAV_ICON_NAMES as readonly string[]).includes(value)
    ? (value as NavIconName)
    : "wrench";
}

function strings(value: string[] | null | undefined): string[] | undefined {
  const list = value?.filter((entry) => entry.trim() !== "");
  return list?.length ? list : undefined;
}

/**
 * One city page by slug — same seam pattern as `getContactPage()`, extended
 * to a slug-keyed collection:
 *
 * - Thrown fetch → the static entry from `data/cities.ts` (loud).
 * - Successful fetch, document not published yet → the static entry with a
 *   quieter note (nothing to resurrect — the fallback IS the shipped copy
 *   until the document exists). A slug with no document AND no static entry
 *   → null, and the route 404s.
 * - Published document → its values win field-by-field.
 */
export async function getCityPage(
  slug: string,
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<CityPageContent | null> {
  const fb = cities.find((city) => city.slug === slug);

  let result: CITY_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      CITY_PAGE_QUERY,
      { slug },
      CITY_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: `getCityPage(${slug})`,
      fallbackFile: "data/cities.ts",
      affects: `${cityHref(slug)} copy, cards, and photo`,
      error,
    });
    return fb ?? null;
  }

  if (!result) {
    if (fb) {
      // Expected until the document is first published — not an error.
      console.warn(
        `[sanity] cityPage "${slug}" not published yet — ${cityHref(slug)} renders from data/cities.ts.`,
      );
      return fb;
    }
    logEmpty(`getCityPage(${slug})`, `${cityHref(slug)} has no content and 404s.`);
    return null;
  }

  const serviceCards: CityServiceCard[] =
    result.serviceCards
      ?.filter(
        (card) =>
          Boolean(card.title) &&
          Boolean(card.description) &&
          Boolean(card.href?.startsWith("/")),
      )
      .map((card) => ({
        _key: card._key,
        title: card.title as string,
        description: card.description as string,
        href: card.href as string,
        icon: toIcon(card.icon),
      })) ??
    fb?.serviceCards ??
    [];

  return {
    city: result.city ?? fb?.city ?? slug,
    slug,
    heroHeading: result.heroHeading ?? fb?.heroHeading ?? "",
    heroIntro: result.heroIntro ?? fb?.heroIntro ?? "",
    servicesHeading: result.servicesHeading ?? fb?.servicesHeading,
    serviceCards,
    whyChooseHeading: result.whyChooseHeading ?? fb?.whyChooseHeading,
    whyChooseBody: result.whyChooseBody ?? fb?.whyChooseBody,
    reviewsHeading:
      result.reviewsHeading ?? fb?.reviewsHeading ?? "What Our Clients Say",
    heritageHeading: result.heritageHeading ?? fb?.heritageHeading,
    heritageParagraphs:
      strings(result.heritageParagraphs) ?? fb?.heritageParagraphs ?? [],
    // Renders through ServiceAboutSection's square frame — same design
    // ratio as the serviceAbout main photo.
    heritagePhoto: resolvePhoto(
      result.heritagePhoto,
      1600,
      `cityPage "${slug}" → "Heritage photo"`,
      1,
    ),
    heritagePhotoSubject:
      result.heritagePhotoSubject ?? fb?.heritagePhotoSubject,
    communitiesHeading: result.communitiesHeading ?? fb?.communitiesHeading,
    communitiesBody: result.communitiesBody ?? fb?.communitiesBody,
    communities: strings(result.communities) ?? fb?.communities ?? [],
    showLogoStrip: result.showLogoStrip ?? fb?.showLogoStrip ?? true,
    seoTitle: result.seoTitle ?? fb?.seoTitle,
    seoDescription: result.seoDescription ?? fb?.seoDescription,
  };
}
