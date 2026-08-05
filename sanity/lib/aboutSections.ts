import "server-only";
import { resolvePhoto } from "@/sanity/lib/image";
import { logSectionDropped } from "@/sanity/lib/fallbackLog";
import { toIconCardSection } from "@/sanity/lib/sections";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import type { CmsPhoto } from "@/data/services";
import { homePageDefaults } from "@/data/homePage";
import {
  aboutPageDefaults,
  type AboutLinkCard,
  type AboutSection,
  type AboutValue,
} from "@/data/aboutPage";

/**
 * Validates the raw `aboutPage.sections` array into the typed union in
 * `data/aboutPage.ts` — the About twin of `sanity/lib/homeSections.ts`,
 * with the same semantics: each About band's missing or emptied field falls
 * back to that TYPE's default copy (a duplicated section with one cleared
 * field must never blank a band), `hidden: true` skips silently (the
 * owner's toggle working as designed), and the only hard drops — unknown
 * types, or an Icon Card section with no complete card — are logged loudly
 * via `logSectionDropped`. The shared library types (Icon Card, reviews,
 * map, closing CTA) map through the same code paths the other stacks use.
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
        `aboutPage → ${context} → ${field}`,
        aspect,
      )
    : undefined;
}

function values(value: unknown, fallback: AboutValue[]): AboutValue[] {
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

function links(value: unknown, fallback: AboutLinkCard[]): AboutLinkCard[] {
  const list = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const title = str((item as Raw).title);
        const description = str((item as Raw).description);
        const href = str((item as Raw).href);
        return title && description && href
          ? [{ title, description, href }]
          : [];
      })
    : [];
  return list.length ? list : fallback;
}

function toSection(raw: Raw, index: number): AboutSection | null {
  const _key = key(raw, index);

  switch (raw._type) {
    case "aboutHero": {
      const fb = aboutPageDefaults.hero;
      return {
        _type: "aboutHero",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        paragraphs: strings(raw.paragraphs, fb.paragraphs),
        // Absent means on — only an explicit Studio opt-out hides the chips.
        showCredentials: raw.showCredentials !== false,
      };
    }
    case "aboutStory": {
      const fb = aboutPageDefaults.story;
      return {
        _type: "aboutStory",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        paragraphs: strings(raw.paragraphs, fb.paragraphs),
        badgeSubtitle: str(raw.badgeSubtitle) ?? fb.badgeSubtitle,
        // Design ratios match each AboutCollage frame: 4:3 both, cropped
        // server-side so the CDN honours the editor's hotspot.
        photoPrimary: photoOf(raw, "photoPrimary", 1600, "Story band", 4 / 3),
        photoSubjectPrimary:
          str(raw.photoSubjectPrimary) ?? fb.photoSubjectPrimary,
        photoSecondary: photoOf(raw, "photoSecondary", 800, "Story band", 4 / 3),
        photoSubjectSecondary:
          str(raw.photoSubjectSecondary) ?? fb.photoSubjectSecondary,
      };
    }
    case "aboutEvolution": {
      const fb = aboutPageDefaults.evolution;
      return {
        _type: "aboutEvolution",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        paragraphs: strings(raw.paragraphs, fb.paragraphs),
        photo: photoOf(raw, "photo", 1600, "Evolution band", 4 / 3),
        photoSubject: str(raw.photoSubject) ?? fb.photoSubject,
      };
    }
    case "valuesGrid": {
      const fb = aboutPageDefaults.values;
      return {
        _type: "valuesGrid",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        values: values(raw.values, fb.values),
      };
    }
    case "pageLinks": {
      const fb = aboutPageDefaults.links;
      return {
        _type: "pageLinks",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        links: links(raw.links, fb.links),
      };
    }
    // Shared library types — same validation/defaults as their home stacks.
    case "iconCardSection":
      return toIconCardSection(raw, index);
    case "homeTestimonials": {
      const fb = homePageDefaults.testimonials;
      return {
        _type: "homeTestimonials",
        _key,
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
 * Hidden sections are skipped silently (the owner's toggle); drops are
 * logged loudly with the fields the owner must fill to bring them back.
 */
export function toAboutSections(value: unknown): AboutSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections: AboutSection[] = [];
  value.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as Raw;
    if (item.hidden === true) return;
    const section = toSection(item, index);
    if (section) {
      sections.push(section);
    } else {
      logSectionDropped({
        context: "aboutPage",
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
