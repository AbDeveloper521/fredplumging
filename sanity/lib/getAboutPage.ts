import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { resolvePhoto } from "@/sanity/lib/image";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { ABOUT_PAGE_QUERY } from "@/sanity/queries";
import type { ABOUT_PAGE_QUERY_RESULT } from "@/sanity.types";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import {
  aboutPage as fallbackAboutPage,
  type AboutPageContent,
} from "@/data/aboutPage";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const ABOUT_PAGE_TAG = "aboutPage";

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
 * About-page copy — same singleton seam pattern as `getSite()` and
 * `getContactPage()`: a thrown fetch serves the full fallback (loud); an
 * unpublished singleton serves the fallback quietly (nothing to resurrect —
 * the fallback IS the shipped copy until the document exists); a published
 * document wins field-by-field.
 */
export async function getAboutPage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<AboutPageContent> {
  let result: ABOUT_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(
      ABOUT_PAGE_QUERY,
      {},
      ABOUT_PAGE_TAG,
      options,
    );
  } catch (error) {
    logFallback({
      fetcher: "getAboutPage",
      fallbackFile: "data/aboutPage.ts",
      affects: "/about copy, photos, values, and closing links",
      error,
    });
    return fallbackAboutPage;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] aboutPage document not published yet — /about renders from data/aboutPage.ts.",
    );
    return fallbackAboutPage;
  }

  const fb = fallbackAboutPage;
  return {
    heroEyebrow: result.heroEyebrow ?? fb.heroEyebrow,
    heroHeading: result.heroHeading ?? fb.heroHeading,
    heroParagraphs: strings(result.heroParagraphs) ?? fb.heroParagraphs,
    storyHeading: result.storyHeading ?? fb.storyHeading,
    storyParagraphs: strings(result.storyParagraphs) ?? fb.storyParagraphs,
    storyPhotoPrimary: resolvePhoto(
      result.storyPhotoPrimary,
      1600,
      'aboutPage → "Story — main photo"',
    ),
    storyPhotoSubjectPrimary:
      result.storyPhotoSubjectPrimary ?? fb.storyPhotoSubjectPrimary,
    storyPhotoSecondary: resolvePhoto(
      result.storyPhotoSecondary,
      800,
      'aboutPage → "Story — small overlapping photo"',
    ),
    storyPhotoSubjectSecondary:
      result.storyPhotoSubjectSecondary ?? fb.storyPhotoSubjectSecondary,
    evolutionHeading: result.evolutionHeading ?? fb.evolutionHeading,
    evolutionParagraphs:
      strings(result.evolutionParagraphs) ?? fb.evolutionParagraphs,
    evolutionPhoto: resolvePhoto(
      result.evolutionPhoto,
      1600,
      'aboutPage → "Evolution photo"',
    ),
    evolutionPhotoSubject:
      result.evolutionPhotoSubject ?? fb.evolutionPhotoSubject,
    valuesHeading: result.valuesHeading ?? fb.valuesHeading,
    values:
      result.values
        ?.filter((value) => Boolean(value.title) && Boolean(value.description))
        .map((value) => ({
          icon: toIcon(value.icon),
          title: value.title as string,
          description: value.description as string,
        })) ?? fb.values,
    linksHeading: result.linksHeading ?? fb.linksHeading,
    links:
      result.links
        ?.filter(
          (link) =>
            Boolean(link.title) &&
            Boolean(link.description) &&
            Boolean(link.href),
        )
        .map((link) => ({
          title: link.title as string,
          description: link.description as string,
          href: link.href as string,
        })) ?? fb.links,
  };
}
