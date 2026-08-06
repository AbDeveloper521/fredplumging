import "server-only";
import { resolvePhoto } from "@/sanity/lib/image";
import { logSectionDropped } from "@/sanity/lib/fallbackLog";
import type { CmsPhoto } from "@/data/services";
import {
  ICON_CARD_COLORS,
  type IconCardSection,
  type ServiceSection,
} from "@/data/serviceSections";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import { isReviewTag } from "@/data/googleReviews";

/**
 * Section mapping shared by every document type that carries a `sections`
 * array (services and industries). Validates raw CMS sections into the
 * typed union in `data/serviceSections.ts`; malformed or incomplete
 * sections are dropped — a broken section must never crash a page.
 */

type Raw = Record<string, unknown>;

function toIcon(value: string | null | undefined): NavIconName {
  return value && (NAV_ICON_NAMES as readonly string[]).includes(value)
    ? (value as NavIconName)
    : "wrench";
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
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

function photoOf(
  item: Raw,
  field: string,
  aspect?: number,
  options?: {
    /** Rendered wider than default (full-bleed backgrounds). */
    width?: number;
    /**
     * Drop the editor's "Frame shape" override — for slots whose crop is
     * load-bearing (the hero background) where a stale portrait/square
     * override from an earlier design would break the composition.
     */
    ignoreFrameRatio?: boolean;
  },
): CmsPhoto | undefined {
  const value = item[field];
  if (!value || typeof value !== "object") return undefined;
  const image = options?.ignoreFrameRatio
    ? { ...(value as Raw), frameRatio: undefined }
    : value;
  // Sections don't know their parent document here, so the skipped-image
  // warning names the section type + field and falls back to the asset ref.
  return resolvePhoto(
    image as { asset?: unknown; alt?: string | null },
    options?.width ?? 1600,
    `a "${String(item._type ?? "section")}" section → ${field}`,
    aspect,
  );
}

/** Maps an array of raw child objects, dropping entries missing required strings. */
function children<T>(
  value: unknown,
  build: (child: Raw, i: number) => T | null,
): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((child, i) => (child && typeof child === "object" ? build(child as Raw, i) : null))
    .filter((c): c is T => c !== null);
}

function iconItem(child: Raw, i: number) {
  const title = str(child.title);
  const description = str(child.description);
  if (!title || !description) return null;
  return {
    _key: key(child, i),
    icon: toIcon(str(child.icon)),
    title,
    description,
    href: str(child.href),
  };
}

/**
 * A CTA button renders only when BOTH label and href exist — a labelled
 * button going nowhere is worse than no button. Returns the pair or nothing.
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
 * Icon Card is the same object type on every stack (service, industry,
 * About), so it validates in exactly one place — the About mapper
 * (`sanity/lib/aboutSections.ts`) calls this too. Minimum to render: at
 * least one complete card — the cards ARE the section; eyebrow and heading
 * are optional dressing. Malformed cards are dropped individually and the
 * section survives; null only when no card survives.
 */
export function toIconCardSection(raw: Raw, index: number): IconCardSection | null {
  const _key = key(raw, index);
  const cards = children(raw.cards, (c, i) => {
    const title = str(c.title);
    const description = str(c.description);
    if (!title || !description) return null;
    const cta = ctaPair(c.ctaLabel, c.ctaHref);
    return {
      _key: key(c, i),
      icon: toIcon(str(c.icon)),
      title,
      description,
      ctaLabel: cta?.label,
      ctaHref: cta?.href,
      cardColor: choice(c.cardColor, ICON_CARD_COLORS),
    };
  });
  if (cards.length === 0) return null;
  return {
    _type: "iconCardSection",
    _key,
    eyebrow: str(raw.eyebrow),
    heading: str(raw.heading),
    background: choice(raw.background, ["default", "dark"] as const),
    // Full-bleed band background — same hotspot-aware wide crop as the
    // hero; any stale frame-shape override would fight it.
    photo: photoOf(raw, "photo", 16 / 9, { width: 2400, ignoreFrameRatio: true }),
    defaultCardColor: choice(raw.defaultCardColor, ICON_CARD_COLORS),
    cards,
  };
}

/**
 * Maps ONE raw library section; null when it fails its type's render gate.
 * Exported for the page stacks that mix library types with their own
 * (`sanity/lib/citySections.ts`) — the array entry points below stay the
 * logging seam.
 */
export function toServiceSection(raw: Raw, index: number): ServiceSection | null {
  const _key = key(raw, index);

  // Two types render without a heading, so they sit ahead of the blanket
  // heading gate: the (retired, render-nothing) strip carries no copy at
  // all, and the card band may show its cards alone (reference-style
  // layout). trustLogoStrip stays mapped rather than dropped so published
  // stacks that still contain it don't raise dropped-section warnings.
  if (raw._type === "trustLogoStrip") {
    return {
      _type: "trustLogoStrip",
      _key,
      background: choice(raw.background, ["offwhite", "white"] as const),
    };
  }
  if (raw._type === "propertyTypes") {
    // Minimum to render: at least one valid card — the cards ARE the
    // section. The optional CTA already renders only when both label+href
    // exist.
    const cards = children(raw.cards, (c, i) => {
      const title = str(c.title);
      const blurb = str(c.blurb);
      return title && blurb
        ? {
            _key: key(c, i),
            icon: toIcon(str(c.icon)),
            title,
            blurb,
            slug: str(c.slug),
            href: str(c.href),
            linkLabel: str(c.linkLabel),
            // Uniform 16:10 card strip — every card crops the same so
            // grid rows stay aligned (no Studio override on this slot).
            photo: photoOf(c, "photo", 16 / 10),
            photoSubject: str(c.photoSubject),
          }
        : null;
    });
    if (cards.length === 0) return null;
    return {
      _type: "propertyTypes",
      _key,
      heading: str(raw.heading),
      cards,
      background: choice(raw.background, ["dark", "white", "offwhite"] as const),
      ctaLabel: str(raw.ctaLabel),
      ctaHref: str(raw.ctaHref),
    };
  }

  if (raw._type === "iconCardSection") return toIconCardSection(raw, index);

  const heading = str(raw.heading);
  // Every remaining type's minimum: the heading. It is the section's h2
  // (the hero's h1) and its aria-label — a section with no heading cannot
  // render.
  if (!heading) return null;

  switch (raw._type) {
    case "serviceHero": {
      // Minimum to render: heading (the page H1). Subheading, secondary CTA
      // and credentials all degrade to absent.
      const secondaryCta = ctaPair(raw.secondaryCtaLabel, raw.secondaryCtaHref);
      return {
        _type: "serviceHero",
        _key,
        eyebrow: str(raw.eyebrow),
        heading,
        subheading: str(raw.subheading),
        secondaryCtaLabel: secondaryCta?.label,
        secondaryCtaHref: secondaryCta?.href,
        credentials: children(raw.credentials, (c, i) => {
          const label = str(c.label);
          return label
            ? { _key: key(c, i), icon: toIcon(str(c.icon)), label }
            : null;
        }),
        // Full-width banner background — cropped wide server-side so the CDN
        // honours the editor's hotspot (a background is the worst case for
        // blind cropping). Frame-shape overrides from the old tall-banner
        // design are ignored: the crop here is load-bearing.
        photo: photoOf(raw, "photo", 16 / 9, {
          width: 2400,
          ignoreFrameRatio: true,
        }),
        // Missing/absent → true: every page published before the toggle
        // existed keeps its overlay pixel-identical.
        darkOverlay: raw.darkOverlay !== false,
        photoSubject: str(raw.photoSubject),
        phoneCtaLabel: str(raw.phoneCtaLabel),
        showAvailabilityDot: raw.showAvailabilityDot === true,
      };
    }
    case "serviceAbout": {
      // Minimum to render: heading + at least one paragraph (the copy IS the
      // section). The CTA button degrades to absent.
      const paragraphs = Array.isArray(raw.paragraphs)
        ? raw.paragraphs.filter((p): p is string => typeof p === "string" && p.trim() !== "")
        : [];
      if (paragraphs.length === 0) return null;
      const cta = ctaPair(raw.ctaLabel, raw.ctaHref);
      return {
        _type: "serviceAbout",
        _key,
        heading,
        paragraphs,
        ctaLabel: cta?.label,
        ctaHref: cta?.href,
        // Cropped square server-side so the CDN honours the editor's hotspot;
        // the About band shows this photo in a square frame.
        photoPrimary: photoOf(raw, "photoPrimary", 1),
        photoSubjectPrimary: str(raw.photoSubjectPrimary),
        background: choice(raw.background, ["white", "dark"] as const),
      };
    }
    case "whatsIncluded": {
      // Minimum to render: heading + at least one valid item (a scope list
      // with zero rows is nothing). The intro line degrades to absent.
      const items = children(raw.items, iconItem);
      if (items.length === 0) return null;
      return { _type: "whatsIncluded", _key, heading, intro: str(raw.intro), items };
    }
    case "signsYouNeed": {
      // Minimum to render: heading + at least one valid card. The CTA button
      // under the cards degrades to absent.
      const cards = children(raw.cards, (c, i) => {
        const question = str(c.question);
        const answer = str(c.answer);
        return question && answer
          ? { _key: key(c, i), icon: toIcon(str(c.icon)), question, answer }
          : null;
      });
      if (cards.length === 0) return null;
      const cta = ctaPair(raw.ctaLabel, raw.ctaHref);
      return {
        _type: "signsYouNeed",
        _key,
        heading,
        cards,
        ctaLabel: cta?.label,
        ctaHref: cta?.href,
        background: choice(raw.background, ["white", "dark"] as const),
      };
    }
    case "processSteps": {
      // Minimum to render: heading + at least one valid step — a timeline
      // with zero steps is genuinely un-renderable.
      const steps = children(raw.steps, (c, i) => {
        const title = str(c.title);
        const description = str(c.description);
        return title && description
          ? { _key: key(c, i), title, description }
          : null;
      });
      if (steps.length === 0) return null;
      return {
        _type: "processSteps",
        _key,
        heading,
        steps,
        background: choice(raw.background, ["dark", "white"] as const),
      };
    }
    case "comparisonTable": {
      // Minimum to render: heading + at least one complete row — an empty
      // table is genuinely un-renderable. Intro/labels/footnote are optional.
      const rows = children(raw.rows, (c, i) => {
        const situation = str(c.situation);
        const recommendation = str(c.recommendation);
        const why = str(c.why);
        return situation && recommendation && why
          ? { _key: key(c, i), situation, recommendation, why }
          : null;
      });
      if (rows.length === 0) return null;
      const labels = Array.isArray(raw.columnLabels)
        ? raw.columnLabels.filter(
            (l): l is string => typeof l === "string" && l.trim() !== "",
          )
        : [];
      return {
        _type: "comparisonTable",
        _key,
        heading,
        intro: str(raw.intro),
        background: choice(raw.background, ["white", "dark"] as const),
        columnLabels:
          labels.length === 3
            ? (labels as [string, string, string])
            : undefined,
        rows,
        footnote: str(raw.footnote),
      };
    }
    case "serviceTrust": {
      // Minimum to render: heading + at least one valid proof point.
      const items = children(raw.items, iconItem);
      if (items.length === 0) return null;
      return {
        _type: "serviceTrust",
        _key,
        heading,
        items,
      };
    }
    case "serviceTestimonials": {
      // Minimum to render: heading only — reviews come from the site-wide
      // Testimonials collection. An untagged section shows the most recent.
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
        heading,
        filterTags: filterTags.length > 0 ? filterTags : undefined,
        limit,
      };
    }
    case "serviceFaq": {
      // Minimum to render: heading + at least one complete Q&A pair.
      const faqs = children(raw.faqs, (c, i) => {
        const question = str(c.question);
        const answer = str(c.answer);
        return question && answer
          ? {
              _key: key(c, i),
              question,
              answer,
              href: str(c.href),
              linkLabel: str(c.linkLabel),
            }
          : null;
      });
      if (faqs.length === 0) return null;
      return {
        _type: "serviceFaq",
        _key,
        heading,
        faqs,
        background: choice(raw.background, ["offwhite", "white"] as const),
      };
    }
    case "serviceArea": {
      // Minimum to render: heading only — the city chips come from Site
      // Settings, so the section is meaningful even without its paragraph.
      const cta = ctaPair(raw.ctaLabel, raw.ctaHref);
      return {
        _type: "serviceArea",
        _key,
        heading,
        body: str(raw.body),
        ctaLabel: cta?.label,
        ctaHref: cta?.href,
        photo: photoOf(raw, "photo", 4 / 3),
        photoSubject: str(raw.photoSubject),
      };
    }
    case "relatedServices": {
      // Minimum to render: heading + at least one slug — cards are the section.
      const serviceSlugs = Array.isArray(raw.serviceSlugs)
        ? raw.serviceSlugs.filter((s): s is string => typeof s === "string" && s.trim() !== "")
        : [];
      if (serviceSlugs.length === 0) return null;
      return { _type: "relatedServices", _key, heading, serviceSlugs };
    }
    case "finalCta": {
      // Minimum to render: heading — the phone button always renders from
      // Site Settings. Body and the secondary CTA degrade to absent.
      const secondaryCta = ctaPair(raw.secondaryCtaLabel, raw.secondaryCtaHref);
      return {
        _type: "finalCta",
        _key,
        heading,
        body: str(raw.body),
        secondaryCtaLabel: secondaryCta?.label,
        secondaryCtaHref: secondaryCta?.href,
        phoneCtaLabel: str(raw.phoneCtaLabel),
        showAvailabilityDot: raw.showAvailabilityDot === true,
      };
    }
    default:
      return null;
  }
}

/**
 * The load-bearing fields per section type — the render gates in
 * `toServiceSection()` above, expressed as data so drops can be EXPLAINED, not just
 * detected. `title` is the field's Studio title (what the owner sees on
 * screen); keep both in sync with `sanity/schemas/serviceSections.ts`.
 * The reconciliation table in SERVICE-SECTIONS-AUDIT.md is generated from
 * this map.
 */
const nonEmptyString = (entry: unknown) =>
  typeof entry === "string" && entry.trim() !== "";

const childWith = (...fields: string[]) => (entry: unknown) =>
  Boolean(
    entry &&
      typeof entry === "object" &&
      fields.every((f) => str((entry as Raw)[f])),
  );

export const SECTION_REQUIREMENTS: Record<
  string,
  {
    strings: Array<{ field: string; title: string }>;
    /** Arrays that need ≥1 entry passing `valid` for the section to render. */
    arrays: Array<{ field: string; title: string; valid: (entry: unknown) => boolean }>;
  }
> = {
  serviceHero: { strings: [{ field: "heading", title: "Big heading" }], arrays: [] },
  serviceAbout: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [{ field: "paragraphs", title: "Paragraphs", valid: nonEmptyString }],
  },
  whatsIncluded: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [{ field: "items", title: "Covered work", valid: childWith("title", "description") }],
  },
  signsYouNeed: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [{ field: "cards", title: "Symptom cards", valid: childWith("question", "answer") }],
  },
  processSteps: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [{ field: "steps", title: "Steps", valid: childWith("title", "description") }],
  },
  comparisonTable: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [
      { field: "rows", title: "Table rows", valid: childWith("situation", "recommendation", "why") },
    ],
  },
  serviceTrust: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [{ field: "items", title: "Proof points", valid: childWith("title", "description") }],
  },
  serviceTestimonials: { strings: [{ field: "heading", title: "Heading" }], arrays: [] },
  propertyTypes: {
    // Heading is optional — the reference-style card band has none.
    strings: [],
    arrays: [{ field: "cards", title: "Property cards", valid: childWith("title", "blurb") }],
  },
  iconCardSection: {
    // Heading and eyebrow are optional — the cards are the section.
    strings: [],
    arrays: [{ field: "cards", title: "Cards", valid: childWith("title", "description") }],
  },
  serviceFaq: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [{ field: "faqs", title: "Questions", valid: childWith("question", "answer") }],
  },
  serviceArea: { strings: [{ field: "heading", title: "Heading" }], arrays: [] },
  // Never drops — retired type kept mapped so existing stacks stay warning-free.
  trustLogoStrip: { strings: [], arrays: [] },
  relatedServices: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [{ field: "serviceSlugs", title: "Which services", valid: nonEmptyString }],
  },
  finalCta: { strings: [{ field: "heading", title: "Heading" }], arrays: [] },
};

export interface DroppedSection {
  _type: string;
  _key: string;
  index: number;
  /** Schema field names that failed the gate. */
  emptyFields: string[];
  /** The same fields by their Studio titles — what the owner sees. */
  studioFields: string[];
}

/** Names the fields that made `toServiceSection()` return null for this item. */
export function explainServiceSectionDrop(raw: Raw, index: number): DroppedSection {
  const _type = String(raw._type ?? "unknown");
  const _key = str(raw._key) ?? `(no _key, index ${index})`;
  const requirements = SECTION_REQUIREMENTS[_type];
  if (!requirements) {
    return {
      _type,
      _key,
      index,
      emptyFields: ["_type"],
      studioFields: [`unknown section type "${_type}"`],
    };
  }
  const emptyFields: string[] = [];
  const studioFields: string[] = [];
  for (const { field, title } of requirements.strings) {
    if (!str(raw[field])) {
      emptyFields.push(field);
      studioFields.push(title);
    }
  }
  for (const { field, title, valid } of requirements.arrays) {
    const value = raw[field];
    if (!Array.isArray(value) || value.length === 0) {
      emptyFields.push(field);
      studioFields.push(title);
    } else if (!value.some(valid)) {
      // Entries exist but every one is missing its own required fields.
      emptyFields.push(`${field} (no complete entry)`);
      studioFields.push(`${title} (entries exist but none is complete)`);
    }
  }
  return { _type, _key, index, emptyFields, studioFields };
}

/** Identifies the parent document in drop warnings, e.g. `service "plumbing"`. */
export type SectionsContext = string;

/**
 * Maps a raw sections array and reports every drop with the fields that
 * caused it. Used by /api/health/sanity and scripts/audit-sections.ts;
 * does not log — `toSections()` is the logging entry point.
 */
export function toSectionsWithReport(
  value: unknown,
): { sections: ServiceSection[] | undefined; dropped: DroppedSection[] } {
  if (!Array.isArray(value)) return { sections: undefined, dropped: [] };
  const dropped: DroppedSection[] = [];
  const sections: ServiceSection[] = [];
  value.forEach((raw, i) => {
    if (!raw || typeof raw !== "object") {
      dropped.push({
        _type: "unknown",
        _key: `(not an object, index ${i})`,
        index: i,
        emptyFields: [],
        studioFields: [],
      });
      return;
    }
    const section = toServiceSection(raw as Raw, i);
    if (section) sections.push(section);
    else dropped.push(explainServiceSectionDrop(raw as Raw, i));
  });
  return { sections: sections.length > 0 ? sections : undefined, dropped };
}

/**
 * Maps a raw sections array; undefined when absent or nothing survives.
 * Every dropped section is logged loudly with the document context and the
 * Studio field titles the owner must fill to bring it back.
 */
export function toSections(
  value: unknown,
  context: SectionsContext = "a document",
): ServiceSection[] | undefined {
  const { sections, dropped } = toSectionsWithReport(value);
  for (const drop of dropped) {
    logSectionDropped({
      context,
      sectionType: drop._type,
      sectionKey: drop._key,
      index: drop.index,
      studioFields: drop.studioFields,
    });
  }
  return sections;
}
