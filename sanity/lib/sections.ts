import "server-only";
import { resolvePhoto } from "@/sanity/lib/image";
import type { CmsPhoto } from "@/data/services";
import type { ServiceSection } from "@/data/serviceSections";
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

function photoOf(item: Raw, field: string): CmsPhoto | undefined {
  const value = item[field];
  return value && typeof value === "object"
    ? resolvePhoto(value as { asset?: unknown; alt?: string | null })
    : undefined;
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

function toSection(raw: Raw, index: number): ServiceSection | null {
  const _key = key(raw, index);
  const heading = str(raw.heading);
  if (!heading) return null;

  switch (raw._type) {
    case "serviceHero": {
      const subheading = str(raw.subheading);
      const secondaryCtaLabel = str(raw.secondaryCtaLabel);
      const secondaryCtaHref = str(raw.secondaryCtaHref);
      if (!subheading || !secondaryCtaLabel || !secondaryCtaHref) return null;
      return {
        _type: "serviceHero",
        _key,
        eyebrow: str(raw.eyebrow),
        heading,
        subheading,
        secondaryCtaLabel,
        secondaryCtaHref,
        credentials: children(raw.credentials, (c, i) => {
          const label = str(c.label);
          return label
            ? { _key: key(c, i), icon: toIcon(str(c.icon)), label }
            : null;
        }),
        photo: photoOf(raw, "photo"),
        photoSubject: str(raw.photoSubject),
        phoneCtaLabel: str(raw.phoneCtaLabel),
        showAvailabilityDot: raw.showAvailabilityDot === true,
      };
    }
    case "serviceAbout": {
      const paragraphs = Array.isArray(raw.paragraphs)
        ? raw.paragraphs.filter((p): p is string => typeof p === "string" && p.trim() !== "")
        : [];
      const ctaLabel = str(raw.ctaLabel);
      const ctaHref = str(raw.ctaHref);
      if (paragraphs.length === 0 || !ctaLabel || !ctaHref) return null;
      return {
        _type: "serviceAbout",
        _key,
        heading,
        paragraphs,
        ctaLabel,
        ctaHref,
        photoPrimary: photoOf(raw, "photoPrimary"),
        photoSecondary: photoOf(raw, "photoSecondary"),
        photoSubjectPrimary: str(raw.photoSubjectPrimary),
        photoSubjectSecondary: str(raw.photoSubjectSecondary),
      };
    }
    case "whatsIncluded": {
      const intro = str(raw.intro);
      const items = children(raw.items, iconItem);
      if (!intro || items.length === 0) return null;
      return { _type: "whatsIncluded", _key, heading, intro, items };
    }
    case "signsYouNeed": {
      const ctaLabel = str(raw.ctaLabel);
      const ctaHref = str(raw.ctaHref);
      const cards = children(raw.cards, (c, i) => {
        const question = str(c.question);
        const answer = str(c.answer);
        return question && answer
          ? { _key: key(c, i), icon: toIcon(str(c.icon)), question, answer }
          : null;
      });
      if (!ctaLabel || !ctaHref || cards.length === 0) return null;
      return {
        _type: "signsYouNeed",
        _key,
        heading,
        cards,
        ctaLabel,
        ctaHref,
        background: choice(raw.background, ["white", "dark"] as const),
      };
    }
    case "processSteps": {
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
      const items = children(raw.items, iconItem);
      if (items.length === 0) return null;
      return {
        _type: "serviceTrust",
        _key,
        heading,
        items,
        showLogos: raw.showLogos !== false,
      };
    }
    case "serviceTestimonials": {
      // An untagged section is valid — it shows the most recent reviews.
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
    case "propertyTypes": {
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
              photo: photoOf(c, "photo"),
              photoSubject: str(c.photoSubject),
            }
          : null;
      });
      if (cards.length === 0) return null;
      return {
        _type: "propertyTypes",
        _key,
        heading,
        cards,
        background: choice(raw.background, ["dark", "white", "offwhite"] as const),
        ctaLabel: str(raw.ctaLabel),
        ctaHref: str(raw.ctaHref),
      };
    }
    case "serviceFaq": {
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
      const body = str(raw.body);
      if (!body) return null;
      return {
        _type: "serviceArea",
        _key,
        heading,
        body,
        photo: photoOf(raw, "photo"),
        photoSubject: str(raw.photoSubject),
      };
    }
    case "relatedServices": {
      const serviceSlugs = Array.isArray(raw.serviceSlugs)
        ? raw.serviceSlugs.filter((s): s is string => typeof s === "string" && s.trim() !== "")
        : [];
      if (serviceSlugs.length === 0) return null;
      return { _type: "relatedServices", _key, heading, serviceSlugs };
    }
    case "finalCta": {
      const body = str(raw.body);
      const secondaryCtaLabel = str(raw.secondaryCtaLabel);
      const secondaryCtaHref = str(raw.secondaryCtaHref);
      if (!body || !secondaryCtaLabel || !secondaryCtaHref) return null;
      return {
        _type: "finalCta",
        _key,
        heading,
        body,
        secondaryCtaLabel,
        secondaryCtaHref,
        phoneCtaLabel: str(raw.phoneCtaLabel),
        showAvailabilityDot: raw.showAvailabilityDot === true,
      };
    }
    default:
      return null;
  }
}

/** Maps a raw sections array; undefined when absent or nothing survives. */
export function toSections(value: unknown): ServiceSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections = value
    .map((raw, i) =>
      raw && typeof raw === "object" ? toSection(raw as Raw, i) : null,
    )
    .filter((s): s is ServiceSection => s !== null);
  return sections.length > 0 ? sections : undefined;
}
