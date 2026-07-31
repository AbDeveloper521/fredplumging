import "server-only";
import { resolvePhoto } from "@/sanity/lib/image";
import { logSectionDropped } from "@/sanity/lib/fallbackLog";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import type { CmsPhoto } from "@/data/services";
import {
  homePageDefaults,
  type HomeIconItem,
  type HomeIconLabel,
  type HomeSection,
} from "@/data/homePage";

/**
 * Validates the raw `homePage.sections` array into the typed union in
 * `data/homePage.ts` — the homepage twin of `sanity/lib/sections.ts`.
 *
 * Semantics differ from the service mapper on purpose: each item's missing
 * or emptied field falls back to that TYPE's default copy (a duplicated
 * section with one cleared field must never blank a band), so the only
 * hard drops are unknown types — logged loudly via `logSectionDropped`.
 * `hidden: true` skips the section silently: that is the owner's toggle
 * working as designed, not an error.
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

function key(item: Raw, index: number): string {
  return str(item._key) ?? `section-${index}`;
}

function photoOf(raw: Raw, field: string, width: number, context: string): CmsPhoto | undefined {
  const value = raw[field];
  return value && typeof value === "object"
    ? resolvePhoto(
        value as { asset?: unknown; alt?: string | null },
        width,
        `homePage → ${context} → ${field}`,
      )
    : undefined;
}

function iconLabels(value: unknown, fallback: HomeIconLabel[]): HomeIconLabel[] {
  const list = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const label = str((item as Raw).label);
        return label ? [{ icon: toIcon((item as Raw).icon), label }] : [];
      })
    : [];
  return list.length ? list : fallback;
}

function iconItems(value: unknown, fallback: HomeIconItem[]): HomeIconItem[] {
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

function toSection(raw: Raw, index: number): HomeSection | null {
  const _key = key(raw, index);

  switch (raw._type) {
    case "homeHero": {
      const fb = homePageDefaults.hero;
      const headingBefore = str(raw.headingBefore);
      return {
        _type: "homeHero",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        headingBefore: headingBefore ?? fb.headingBefore,
        // The highlight/after parts follow the CMS headline as a unit: once
        // a published first part exists, empty parts mean "no red words",
        // not "splice in the default's".
        headingHighlight: headingBefore
          ? str(raw.headingHighlight)
          : fb.headingHighlight,
        headingAfter: headingBefore ? str(raw.headingAfter) : fb.headingAfter,
        subcopy: str(raw.subcopy) ?? fb.subcopy,
        trustIndicators: iconLabels(raw.trustIndicators, fb.trustIndicators),
        experienceBadgeLabel:
          str(raw.experienceBadgeLabel) ?? fb.experienceBadgeLabel,
      };
    }
    case "homeTrustBar": {
      const fb = homePageDefaults.trustBar;
      return {
        _type: "homeTrustBar",
        _key,
        tagline: str(raw.tagline) ?? fb.tagline,
      };
    }
    case "homeAbout": {
      const fb = homePageDefaults.about;
      const metrics = Array.isArray(raw.metrics)
        ? raw.metrics.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const label = str((item as Raw).label);
            return label
              ? [
                  {
                    icon: toIcon((item as Raw).icon),
                    // Empty → the derived years figure, substituted at render.
                    value: str((item as Raw).value),
                    label,
                  },
                ]
              : [];
          })
        : [];
      return {
        _type: "homeAbout",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        highlights: strings(raw.highlights, fb.highlights),
        badgeSubtitle: str(raw.badgeSubtitle) ?? fb.badgeSubtitle,
        metrics: metrics.length ? metrics : fb.metrics,
        primaryPhoto: photoOf(raw, "primaryPhoto", 1600, "About band"),
        primaryPhotoSubject:
          str(raw.primaryPhotoSubject) ?? fb.primaryPhotoSubject,
        secondaryPhoto: photoOf(raw, "secondaryPhoto", 800, "About band"),
        secondaryPhotoSubject:
          str(raw.secondaryPhotoSubject) ?? fb.secondaryPhotoSubject,
      };
    }
    case "homeServices": {
      const fb = homePageDefaults.services;
      return {
        _type: "homeServices",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
      };
    }
    case "homeEmergency": {
      const fb = homePageDefaults.emergency;
      return {
        _type: "homeEmergency",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        body: str(raw.body) ?? fb.body,
        benefits: iconLabels(raw.benefits, fb.benefits),
        photo: photoOf(raw, "photo", 1200, "Emergency band"),
        photoSubject: str(raw.photoSubject) ?? fb.photoSubject,
        photoCaption: str(raw.photoCaption) ?? fb.photoCaption,
      };
    }
    case "homeIndustries": {
      const fb = homePageDefaults.industries;
      return {
        _type: "homeIndustries",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
      };
    }
    case "homeWhyChooseUs": {
      const fb = homePageDefaults.whyChooseUs;
      return {
        _type: "homeWhyChooseUs",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        features: iconItems(raw.features, fb.features),
        photo: photoOf(raw, "photo", 1200, "Why choose us"),
        photoSubject: str(raw.photoSubject) ?? fb.photoSubject,
        photoCaption: str(raw.photoCaption) ?? fb.photoCaption,
      };
    }
    case "homeProcess": {
      const fb = homePageDefaults.process;
      return {
        _type: "homeProcess",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        steps: iconItems(raw.steps, fb.steps),
      };
    }
    case "homeCompliance": {
      const fb = homePageDefaults.compliance;
      return {
        _type: "homeCompliance",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        items: strings(raw.items, fb.items),
      };
    }
    case "homeTestimonials": {
      const fb = homePageDefaults.testimonials;
      return {
        _type: "homeTestimonials",
        _key,
        heading: str(raw.heading) ?? fb.heading,
      };
    }
    case "homeCaseStudy": {
      const fb = homePageDefaults.caseStudy;
      const storyBlocks = Array.isArray(raw.storyBlocks)
        ? raw.storyBlocks.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const label = str((item as Raw).label);
            const copy = str((item as Raw).copy);
            return label && copy
              ? [{ icon: toIcon((item as Raw).icon), label, copy }]
              : [];
          })
        : [];
      return {
        _type: "homeCaseStudy",
        _key,
        badgeLabel: str(raw.badgeLabel) ?? fb.badgeLabel,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        storyBlocks: storyBlocks.length ? storyBlocks : fb.storyBlocks,
        photo: photoOf(raw, "photo", 1600, "Service scenario"),
        photoSubject: str(raw.photoSubject) ?? fb.photoSubject,
        photoCardTitle: str(raw.photoCardTitle) ?? fb.photoCardTitle,
        photoCardSubtitle:
          str(raw.photoCardSubtitle) ?? fb.photoCardSubtitle,
      };
    }
    case "homeServiceArea": {
      const fb = homePageDefaults.serviceArea;
      return {
        _type: "homeServiceArea",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        calloutBody: str(raw.calloutBody) ?? fb.calloutBody,
      };
    }
    case "homeFaq": {
      const fb = homePageDefaults.faq;
      return {
        _type: "homeFaq",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
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
 * Hidden sections are skipped silently (the owner's toggle); unknown types
 * are dropped loudly.
 */
export function toHomeSections(value: unknown): HomeSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections: HomeSection[] = [];
  value.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as Raw;
    if (item.hidden === true) return;
    const section = toSection(item, index);
    if (section) {
      sections.push(section);
    } else {
      logSectionDropped({
        context: "homePage",
        sectionType: String(item._type ?? "unknown"),
        sectionKey: key(item, index),
        index,
        studioFields: [`unknown section type "${String(item._type)}"`],
      });
    }
  });
  return sections.length > 0 ? sections : undefined;
}
