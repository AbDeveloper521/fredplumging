import "server-only";
import { resolvePhoto } from "@/sanity/lib/image";
import { logSectionDropped } from "@/sanity/lib/fallbackLog";
import {
  explainServiceSectionDrop,
  toServiceSection,
} from "@/sanity/lib/sections";
import type { CmsPhoto } from "@/data/services";
import type { CitySection } from "@/data/cities";

/**
 * Validates the raw `cityPage.sections` array into the typed union in
 * `data/cities.ts`. City stacks are mostly shared library sections, so those
 * delegate to the one library mapper (`toServiceSection`) — same render
 * gates, same degradation. Unlike the singleton stacks there is NO per-field
 * default fill here: two city documents carry deliberately distinct copy
 * (doorway-page rule), so an emptied field must degrade or drop, never
 * resurrect as some other city's words.
 *
 * `hidden: true` skips silently (the owner's toggle); drops are logged
 * loudly with the Studio fields the owner must fill to bring them back.
 */

type Raw = Record<string, unknown>;

/** The shared library types the city stack accepts — mirror the schema. */
const CITY_LIBRARY_TYPES = new Set([
  "serviceHero",
  "propertyTypes",
  "serviceAbout",
  "serviceTestimonials",
  "iconCardSection",
  "serviceFaq",
  "finalCta",
]);

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function key(item: Raw, index: number): string {
  return str(item._key) ?? `section-${index}`;
}

function photoOf(
  raw: Raw,
  field: string,
  context: string,
  aspect: number,
): CmsPhoto | undefined {
  const value = raw[field];
  return value && typeof value === "object"
    ? resolvePhoto(
        value as { asset?: unknown; alt?: string | null },
        1600,
        `${context} → ${field}`,
        aspect,
      )
    : undefined;
}

/**
 * A CTA button renders only when BOTH label and href exist — a labelled
 * button going nowhere is worse than no button.
 */
function ctaPair(
  label: unknown,
  href: unknown,
): { label: string; href: string } | undefined {
  const l = str(label);
  const h = str(href);
  return l && h ? { label: l, href: h } : undefined;
}

/**
 * The communities band. Minimum to render: heading + paragraph (the copy IS
 * the band). Chips, photos, and the CTA all degrade to absent.
 */
function toCityCommunities(
  raw: Raw,
  index: number,
  context: string,
): CitySection | null {
  const heading = str(raw.heading);
  const body = str(raw.body);
  if (!heading || !body) return null;
  const communities = Array.isArray(raw.communities)
    ? raw.communities.filter((entry): entry is string => Boolean(str(entry)))
    : [];
  const cta = ctaPair(raw.ctaLabel, raw.ctaHref);
  return {
    _type: "cityCommunities",
    _key: key(raw, index),
    heading,
    body,
    communities,
    // The pair shares one wide frame — cropped 16:10 server-side so the CDN
    // honours each photo's hotspot.
    photoPrimary: photoOf(raw, "photoPrimary", context, 16 / 10),
    photoSubjectPrimary: str(raw.photoSubjectPrimary),
    photoSecondary: photoOf(raw, "photoSecondary", context, 16 / 10),
    photoSubjectSecondary: str(raw.photoSubjectSecondary),
    ctaLabel: cta?.label,
    ctaHref: cta?.href,
  };
}

/**
 * Maps a raw sections array; undefined when absent or nothing survives.
 * `context` names the parent document in drop warnings, e.g. `cityPage "dallas"`.
 */
export function toCitySections(
  value: unknown,
  context: string,
): CitySection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections: CitySection[] = [];
  value.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as Raw;
    if (item.hidden === true) return;

    if (item._type === "cityCommunities") {
      const section = toCityCommunities(item, index, context);
      if (section) {
        sections.push(section);
      } else {
        logSectionDropped({
          context,
          sectionType: "cityCommunities",
          sectionKey: key(item, index),
          index,
          studioFields: [
            ...(str(item.heading) ? [] : ["Heading"]),
            ...(str(item.body) ? [] : ["Paragraph"]),
          ],
        });
      }
      return;
    }

    if (CITY_LIBRARY_TYPES.has(String(item._type))) {
      const section = toServiceSection(item, index);
      if (section) {
        // Safe: toServiceSection preserves _type, and the gate above admits
        // only the library types that are members of the CitySection union.
        sections.push(section as CitySection);
      } else {
        const drop = explainServiceSectionDrop(item, index);
        logSectionDropped({
          context,
          sectionType: drop._type,
          sectionKey: drop._key,
          index,
          studioFields: drop.studioFields,
        });
      }
      return;
    }

    logSectionDropped({
      context,
      sectionType: String(item._type ?? "unknown"),
      sectionKey: key(item, index),
      index,
      studioFields: [`unknown section type "${String(item._type)}"`],
    });
  });
  return sections.length > 0 ? sections : undefined;
}
