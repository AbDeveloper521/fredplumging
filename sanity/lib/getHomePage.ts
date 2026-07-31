import "server-only";
import {
  fetchSanityCached,
  PUBLISHED_FETCH_OPTIONS,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { resolvePhoto } from "@/sanity/lib/image";
import { logFallback } from "@/sanity/lib/fallbackLog";
import { HOME_PAGE_QUERY } from "@/sanity/queries";
import type { HOME_PAGE_QUERY_RESULT } from "@/sanity.types";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import {
  homePage as fallbackHomePage,
  type HomePageContent,
  type HomeIconLabel,
  type HomeIconItem,
} from "@/data/homePage";

/** Cache tag: the document `_type`, matching how /api/revalidate resolves. */
export const HOME_PAGE_TAG = "homePage";

function toIcon(value: string | null | undefined): NavIconName {
  return value && (NAV_ICON_NAMES as readonly string[]).includes(value)
    ? (value as NavIconName)
    : "wrench";
}

function str(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function strings(value: string[] | null | undefined): string[] | undefined {
  const list = value?.filter((entry) => entry.trim() !== "");
  return list?.length ? list : undefined;
}

/** Rows with icon + label; incomplete rows drop, an empty result → fallback. */
function iconLabels(
  value:
    | Array<{ icon?: string | null; label?: string | null }>
    | null
    | undefined,
): HomeIconLabel[] | undefined {
  const list = value
    ?.filter((item) => Boolean(str(item.label)))
    .map((item) => ({ icon: toIcon(item.icon), label: item.label as string }));
  return list?.length ? list : undefined;
}

/** Rows with icon + title + description; incomplete rows drop. */
function iconItems(
  value:
    | Array<{
        icon?: string | null;
        title?: string | null;
        description?: string | null;
      }>
    | null
    | undefined,
): HomeIconItem[] | undefined {
  const list = value
    ?.filter((item) => Boolean(str(item.title)) && Boolean(str(item.description)))
    .map((item) => ({
      icon: toIcon(item.icon),
      title: item.title as string,
      description: item.description as string,
    }));
  return list?.length ? list : undefined;
}

/**
 * Homepage copy — same singleton seam pattern as `getSite()` and
 * `getAboutPage()`: a thrown fetch serves the full fallback (loud); an
 * unpublished singleton serves the fallback quietly (the fallback IS the
 * shipped copy until the document exists); a published document wins
 * field-by-field, so a half-filled document can never blank a band.
 */
export async function getHomePage(
  options: DynamicFetchOptions = PUBLISHED_FETCH_OPTIONS,
): Promise<HomePageContent> {
  let result: HOME_PAGE_QUERY_RESULT;
  try {
    result = await fetchSanityCached(HOME_PAGE_QUERY, {}, HOME_PAGE_TAG, options);
  } catch (error) {
    logFallback({
      fetcher: "getHomePage",
      fallbackFile: "data/homePage.ts",
      affects: "homepage section copy and photos",
      error,
    });
    return fallbackHomePage;
  }

  if (!result) {
    // Expected until the singleton is first published — not an error.
    console.warn(
      "[sanity] homePage document not published yet — the homepage renders from data/homePage.ts.",
    );
    return fallbackHomePage;
  }

  const fb = fallbackHomePage;
  return {
    hero: {
      eyebrow: str(result.hero?.eyebrow) ?? fb.hero.eyebrow,
      headingBefore: str(result.hero?.headingBefore) ?? fb.hero.headingBefore,
      // The highlight/after parts follow the CMS heading as a unit: once a
      // published headingBefore exists, empty parts mean "no red words",
      // not "splice in the fallback's".
      headingHighlight: str(result.hero?.headingBefore)
        ? str(result.hero?.headingHighlight)
        : fb.hero.headingHighlight,
      headingAfter: str(result.hero?.headingBefore)
        ? str(result.hero?.headingAfter)
        : fb.hero.headingAfter,
      subcopy: str(result.hero?.subcopy) ?? fb.hero.subcopy,
      trustIndicators:
        iconLabels(result.hero?.trustIndicators) ?? fb.hero.trustIndicators,
      experienceBadgeLabel:
        str(result.hero?.experienceBadgeLabel) ?? fb.hero.experienceBadgeLabel,
    },
    about: {
      eyebrow: str(result.about?.eyebrow) ?? fb.about.eyebrow,
      heading: str(result.about?.heading) ?? fb.about.heading,
      description: str(result.about?.description) ?? fb.about.description,
      highlights: strings(result.about?.highlights) ?? fb.about.highlights,
      badgeSubtitle: str(result.about?.badgeSubtitle) ?? fb.about.badgeSubtitle,
      metrics:
        result.about?.metrics
          ?.filter((metric) => Boolean(str(metric.label)))
          .map((metric) => ({
            icon: toIcon(metric.icon),
            // Empty → the years-in-business figure, substituted at render.
            value: str(metric.value),
            label: metric.label as string,
          })) ?? fb.about.metrics,
      primaryPhoto: resolvePhoto(
        result.about?.primaryPhoto,
        1600,
        'homePage → about → "Main photo"',
      ),
      primaryPhotoSubject:
        str(result.about?.primaryPhotoSubject) ?? fb.about.primaryPhotoSubject,
      secondaryPhoto: resolvePhoto(
        result.about?.secondaryPhoto,
        800,
        'homePage → about → "Small overlapping photo"',
      ),
      secondaryPhotoSubject:
        str(result.about?.secondaryPhotoSubject) ??
        fb.about.secondaryPhotoSubject,
    },
    emergency: {
      eyebrow: str(result.emergency?.eyebrow) ?? fb.emergency.eyebrow,
      heading: str(result.emergency?.heading) ?? fb.emergency.heading,
      body: str(result.emergency?.body) ?? fb.emergency.body,
      benefits: iconLabels(result.emergency?.benefits) ?? fb.emergency.benefits,
      photo: resolvePhoto(
        result.emergency?.photo,
        1200,
        'homePage → emergency → "Photo"',
      ),
      photoSubject:
        str(result.emergency?.photoSubject) ?? fb.emergency.photoSubject,
      photoCaption:
        str(result.emergency?.photoCaption) ?? fb.emergency.photoCaption,
    },
    whyChooseUs: {
      eyebrow: str(result.whyChooseUs?.eyebrow) ?? fb.whyChooseUs.eyebrow,
      heading: str(result.whyChooseUs?.heading) ?? fb.whyChooseUs.heading,
      description:
        str(result.whyChooseUs?.description) ?? fb.whyChooseUs.description,
      features:
        iconItems(result.whyChooseUs?.features) ?? fb.whyChooseUs.features,
      photo: resolvePhoto(
        result.whyChooseUs?.photo,
        1200,
        'homePage → whyChooseUs → "Photo"',
      ),
      photoSubject:
        str(result.whyChooseUs?.photoSubject) ?? fb.whyChooseUs.photoSubject,
      photoCaption:
        str(result.whyChooseUs?.photoCaption) ?? fb.whyChooseUs.photoCaption,
    },
    process: {
      eyebrow: str(result.process?.eyebrow) ?? fb.process.eyebrow,
      heading: str(result.process?.heading) ?? fb.process.heading,
      steps: iconItems(result.process?.steps) ?? fb.process.steps,
    },
    compliance: {
      eyebrow: str(result.compliance?.eyebrow) ?? fb.compliance.eyebrow,
      heading: str(result.compliance?.heading) ?? fb.compliance.heading,
      description:
        str(result.compliance?.description) ?? fb.compliance.description,
      items: strings(result.compliance?.items) ?? fb.compliance.items,
    },
    caseStudy: {
      badgeLabel: str(result.caseStudy?.badgeLabel) ?? fb.caseStudy.badgeLabel,
      eyebrow: str(result.caseStudy?.eyebrow) ?? fb.caseStudy.eyebrow,
      heading: str(result.caseStudy?.heading) ?? fb.caseStudy.heading,
      storyBlocks:
        result.caseStudy?.storyBlocks
          ?.filter((block) => Boolean(str(block.label)) && Boolean(str(block.copy)))
          .map((block) => ({
            icon: toIcon(block.icon),
            label: block.label as string,
            copy: block.copy as string,
          })) ?? fb.caseStudy.storyBlocks,
      photo: resolvePhoto(
        result.caseStudy?.photo,
        1600,
        'homePage → caseStudy → "Photo"',
      ),
      photoSubject:
        str(result.caseStudy?.photoSubject) ?? fb.caseStudy.photoSubject,
      photoCardTitle:
        str(result.caseStudy?.photoCardTitle) ?? fb.caseStudy.photoCardTitle,
      photoCardSubtitle:
        str(result.caseStudy?.photoCardSubtitle) ??
        fb.caseStudy.photoCardSubtitle,
    },
    serviceArea: {
      eyebrow: str(result.serviceArea?.eyebrow) ?? fb.serviceArea.eyebrow,
      heading: str(result.serviceArea?.heading) ?? fb.serviceArea.heading,
      description:
        str(result.serviceArea?.description) ?? fb.serviceArea.description,
      calloutBody:
        str(result.serviceArea?.calloutBody) ?? fb.serviceArea.calloutBody,
    },
    finalCta: {
      eyebrow: str(result.finalCta?.eyebrow) ?? fb.finalCta.eyebrow,
      heading: str(result.finalCta?.heading) ?? fb.finalCta.heading,
      description:
        str(result.finalCta?.description) ?? fb.finalCta.description,
      reassurance:
        str(result.finalCta?.reassurance) ?? fb.finalCta.reassurance,
    },
  };
}
