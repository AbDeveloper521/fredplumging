import "server-only";
import { resolvePhoto } from "@/sanity/lib/image";
import { logSectionDropped } from "@/sanity/lib/fallbackLog";
import { toIconCardSection } from "@/sanity/lib/sections";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import { isReviewTag } from "@/data/googleReviews";
import type { CmsPhoto } from "@/data/services";
import { homePageDefaults } from "@/data/homePage";
import {
  careersPageDefaults,
  type CareerTraitsContent,
  type CareerValuesContent,
  type CareersSection,
  type HiringProcessContent,
} from "@/data/careersPage";

/**
 * Validates the raw `careersPage.sections` array into the typed union in
 * `data/careersPage.ts` — same semantics as the other page-stack mappers:
 * each band's missing or emptied field falls back to that TYPE's default
 * copy, `hidden: true` skips silently, and the only hard drops — unknown
 * types, or an Icon Card section with no complete card — are logged loudly
 * via `logSectionDropped`.
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

function photoOf(
  raw: Raw,
  field: string,
  width: number,
  context: string,
  aspect?: number,
): CmsPhoto | undefined {
  const value = raw[field];
  return value && typeof value === "object"
    ? resolvePhoto(
        value as { asset?: unknown; alt?: string | null },
        width,
        `careersPage → ${context} → ${field}`,
        aspect,
      )
    : undefined;
}

function valueItems(
  value: unknown,
  fallback: CareerValuesContent["items"],
): CareerValuesContent["items"] {
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

function traitItems(
  value: unknown,
  fallback: CareerTraitsContent["traits"],
): CareerTraitsContent["traits"] {
  const list = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const name = str((item as Raw).name);
        const gloss = str((item as Raw).gloss);
        return name && gloss ? [{ name, gloss }] : [];
      })
    : [];
  return list.length ? list : fallback;
}

function stepItems(
  value: unknown,
  fallback: HiringProcessContent["steps"],
): HiringProcessContent["steps"] {
  const list = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const title = str((item as Raw).title);
        const description = str((item as Raw).description);
        return title && description ? [{ title, description }] : [];
      })
    : [];
  return list.length ? list : fallback;
}

function toSection(raw: Raw, index: number): CareersSection | null {
  const _key = key(raw, index);

  switch (raw._type) {
    case "careersHero": {
      const fb = careersPageDefaults.hero;
      return {
        _type: "careersHero",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        paragraphs: strings(raw.paragraphs, fb.paragraphs),
        // Full-width banner background — same hotspot-aware wide crop as the
        // service hero.
        photo: photoOf(raw, "photo", 2400, "Top banner", 16 / 9),
        // Missing/absent → true: the overlay only turns off on an explicit
        // Studio opt-out.
        darkOverlay: raw.darkOverlay !== false,
      };
    }
    case "careerValues": {
      const fb = careersPageDefaults.values;
      return {
        _type: "careerValues",
        _key,
        eyebrow: str(raw.eyebrow),
        heading: str(raw.heading) ?? fb.heading,
        items: valueItems(raw.items, fb.items),
      };
    }
    case "jobOpenings": {
      const fb = careersPageDefaults.jobs;
      return {
        _type: "jobOpenings",
        _key,
        heading: str(raw.heading) ?? fb.heading,
        applyLabel: str(raw.applyLabel) ?? fb.applyLabel,
      };
    }
    case "careerTraits": {
      const fb = careersPageDefaults.traits;
      return {
        _type: "careerTraits",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        traits: traitItems(raw.traits, fb.traits),
        quote: str(raw.quote),
      };
    }
    case "hiringProcess": {
      const fb = careersPageDefaults.hiringProcess;
      return {
        _type: "hiringProcess",
        _key,
        heading: str(raw.heading) ?? fb.heading,
        steps: stepItems(raw.steps, fb.steps),
      };
    }
    case "careersCta": {
      const fb = careersPageDefaults.cta;
      return {
        _type: "careersCta",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
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
export function toCareersSections(value: unknown): CareersSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections: CareersSection[] = [];
  value.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as Raw;
    if (item.hidden === true) return;
    const section = toSection(item, index);
    if (section) {
      sections.push(section);
    } else {
      logSectionDropped({
        context: "careersPage",
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
