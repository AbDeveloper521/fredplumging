import "server-only";
import { logSectionDropped } from "@/sanity/lib/fallbackLog";
import { toIconCardSection } from "@/sanity/lib/sections";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import { isReviewTag } from "@/data/googleReviews";
import { homePageDefaults } from "@/data/homePage";
import {
  defaultPartnersSections,
  partnersPageDefaults,
  type PartnersSection,
  type VendorOnboardingContent,
} from "@/data/partnersPage";

/**
 * Validates the raw `partnersPage.sections` array into the typed union in
 * `data/partnersPage.ts` — same semantics as the About/home mappers: each
 * Partners band's missing or emptied field falls back to that TYPE's
 * default copy (a duplicated section with one cleared field must never
 * blank a band), `hidden: true` skips silently (the owner's toggle working
 * as designed), and the only hard drops — unknown types, or an Icon Card
 * section with no complete card — are logged loudly via `logSectionDropped`.
 * The reviews and FAQ items reuse the service-library types so filter tags
 * and inline questions behave exactly as on service pages.
 */

type Raw = Record<string, unknown>;

function toIcon(value: unknown): NavIconName {
  return typeof value === "string" &&
    (NAV_ICON_NAMES as readonly string[]).includes(value)
    ? (value as NavIconName)
    : "wrench";
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function strings(value: unknown, fallback: string[]): string[] {
  const list = Array.isArray(value)
    ? value.filter((entry): entry is string => Boolean(str(entry)))
    : [];
  return list.length ? list : fallback;
}

function choice<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

function key(item: Raw, index: number): string {
  return str(item._key) ?? `section-${index}`;
}

function onboardingItems(
  value: unknown,
  fallback: VendorOnboardingContent["items"],
): VendorOnboardingContent["items"] {
  const list = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const title = str((item as Raw).title);
        const description = str((item as Raw).description);
        return title && description
          ? [{ icon: toIcon((item as Raw).icon), title, description }]
          : [];
      })
    : [];
  return list.length ? list : fallback;
}

/** The shipped FAQ list — the fallback when a published FAQ item set is empty. */
const DEFAULT_FAQ_SECTION = defaultPartnersSections.find(
  (section) => section._type === "serviceFaq",
);

function toSection(raw: Raw, index: number): PartnersSection | null {
  const _key = key(raw, index);

  switch (raw._type) {
    case "partnersHero": {
      const fb = partnersPageDefaults.hero;
      return {
        _type: "partnersHero",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        paragraphs: strings(raw.paragraphs, fb.paragraphs),
        // Absent means on — only an explicit Studio opt-out hides the chips.
        showCredentials: raw.showCredentials !== false,
      };
    }
    case "vendorOnboarding": {
      const fb = partnersPageDefaults.onboarding;
      return {
        _type: "vendorOnboarding",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        items: onboardingItems(raw.items, fb.items),
      };
    }
    case "partnerPlatforms": {
      const fb = partnersPageDefaults.platforms;
      return {
        _type: "partnerPlatforms",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
      };
    }
    case "partnerCredentials": {
      const fb = partnersPageDefaults.credentials;
      return {
        _type: "partnerCredentials",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        ctaLabel: str(raw.ctaLabel) ?? fb.ctaLabel,
        ctaHref: str(raw.ctaHref) ?? fb.ctaHref,
      };
    }
    // Shared library types — same behaviour as their home stacks.
    case "iconCardSection":
      return toIconCardSection(raw, index);
    case "serviceTestimonials": {
      const filterTags = Array.isArray(raw.filterTags)
        ? raw.filterTags.filter(isReviewTag)
        : [];
      const limit =
        typeof raw.limit === "number"
          ? Math.min(6, Math.max(1, Math.round(raw.limit)))
          : undefined;
      return {
        _type: "serviceTestimonials",
        _key,
        heading: str(raw.heading) ?? homePageDefaults.testimonials.heading,
        filterTags: filterTags.length > 0 ? filterTags : undefined,
        limit,
      };
    }
    case "serviceFaq": {
      const fallbackFaqs =
        DEFAULT_FAQ_SECTION?._type === "serviceFaq" ? DEFAULT_FAQ_SECTION : undefined;
      const faqs = Array.isArray(raw.faqs)
        ? raw.faqs.flatMap((item, i) => {
            if (!item || typeof item !== "object") return [];
            const question = str((item as Raw).question);
            const answer = str((item as Raw).answer);
            return question && answer
              ? [
                  {
                    _key: key(item as Raw, i),
                    question,
                    answer,
                    href: str((item as Raw).href),
                    linkLabel: str((item as Raw).linkLabel),
                  },
                ]
              : [];
          })
        : [];
      return {
        _type: "serviceFaq",
        _key,
        heading: str(raw.heading) ?? fallbackFaqs?.heading ?? "Vendor Onboarding, Answered",
        faqs: faqs.length ? faqs : (fallbackFaqs?.faqs ?? []),
        background: choice(raw.background, ["offwhite", "white"] as const),
      };
    }
    case "homeLocationMap":
      return { _type: "homeLocationMap", _key };
    case "homeFinalCta": {
      const fb = homePageDefaults.finalCta;
      return {
        _type: "homeFinalCta",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        reassurance: str(raw.reassurance) ?? fb.reassurance,
      };
    }
    default:
      return null;
  }
}

/**
 * Maps a raw sections array; undefined when absent or nothing survives.
 * Hidden sections are skipped silently (the owner's toggle); drops are
 * logged loudly with the fields the owner must fill to bring them back.
 */
export function toPartnersSections(value: unknown): PartnersSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections: PartnersSection[] = [];
  value.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as Raw;
    if (item.hidden === true) return;
    const section = toSection(item, index);
    if (section) {
      sections.push(section);
    } else {
      logSectionDropped({
        context: "partnersPage",
        sectionType: String(item._type ?? "unknown"),
        sectionKey: key(item, index),
        index,
        studioFields:
          item._type === "iconCardSection"
            ? ["Cards (needs at least one card with its title and description)"]
            : [`unknown section type "${String(item._type)}"`],
      });
    }
  });
  return sections.length > 0 ? sections : undefined;
}
