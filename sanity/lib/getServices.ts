import "server-only";
import { serverClient } from "@/sanity/lib/serverClient";
import { resolvePhoto } from "@/sanity/lib/image";
import { logEmpty, logFallback } from "@/sanity/lib/fallbackLog";
import { SERVICES_QUERY, SERVICE_BY_SLUG_QUERY } from "@/sanity/queries";
import type {
  SERVICES_QUERY_RESULT,
  SERVICE_BY_SLUG_QUERY_RESULT,
} from "@/sanity.types";
import {
  services as fallbackServices,
  type CmsPhoto,
  type RichBody,
  type Service,
} from "@/data/services";
import type { ServiceSection } from "@/data/serviceSections";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";

/** Cache tag invalidated by the /api/revalidate webhook. */
export const SERVICE_TAG = "service";

const FETCH_OPTIONS = {
  next: { revalidate: 86400, tags: [SERVICE_TAG] },
};

function toIcon(value: string | null | undefined): NavIconName {
  return value && (NAV_ICON_NAMES as readonly string[]).includes(value)
    ? (value as NavIconName)
    : "wrench";
}

/* ------------------------------------------------------------------ */
/* Section mapping — validates raw CMS sections into the typed union.  */
/* Malformed or incomplete sections are dropped (a broken section must */
/* never crash the page); each mapper mirrors data/serviceSections.ts. */
/* ------------------------------------------------------------------ */

type Raw = Record<string, unknown>;

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
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
      return { _type: "signsYouNeed", _key, heading, cards, ctaLabel, ctaHref };
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
      return { _type: "processSteps", _key, heading, steps };
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
    case "serviceTestimonials":
      return { _type: "serviceTestimonials", _key, heading };
    case "propertyTypes": {
      const cards = children(raw.cards, (c, i) => {
        const title = str(c.title);
        const blurb = str(c.blurb);
        const slug = str(c.slug);
        return title && blurb && slug
          ? { _key: key(c, i), icon: toIcon(str(c.icon)), title, blurb, slug }
          : null;
      });
      if (cards.length === 0) return null;
      return { _type: "propertyTypes", _key, heading, cards };
    }
    case "serviceFaq": {
      const faqs = children(raw.faqs, (c, i) => {
        const question = str(c.question);
        const answer = str(c.answer);
        return question && answer ? { _key: key(c, i), question, answer } : null;
      });
      if (faqs.length === 0) return null;
      return { _type: "serviceFaq", _key, heading, faqs };
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
      };
    }
    default:
      return null;
  }
}

function toSections(value: unknown): ServiceSection[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections = value
    .map((raw, i) =>
      raw && typeof raw === "object" ? toSection(raw as Raw, i) : null,
    )
    .filter((s): s is ServiceSection => s !== null);
  return sections.length > 0 ? sections : undefined;
}

type ServiceListItem = SERVICES_QUERY_RESULT[number];
type ServiceDetailItem = NonNullable<SERVICE_BY_SLUG_QUERY_RESULT>;

function toService(item: ServiceListItem | ServiceDetailItem): Service | null {
  if (!item.title || !item.slug || !item.shortDescription) return null;
  return {
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    body: item.body?.length ? (item.body as RichBody) : undefined,
    sections:
      "sections" in item && item.sections
        ? toSections(item.sections as unknown)
        : undefined,
    seoTitle: item.seoTitle ?? undefined,
    seoDescription: item.seoDescription ?? undefined,
    image: "",
    imageAlt: `${item.title} at a commercial property`,
    icon: toIcon(item.icon),
    featured: item.featured ?? undefined,
    photo: resolvePhoto(item.photo),
  };
}

/**
 * Services ordered by the client-controlled `order` field.
 * FAILED fetch → static fallback (loud). Successful EMPTY result → empty
 * array: the homepage grid hides and no /services/[slug] pages generate —
 * deleted services must not resurrect from the static file.
 */
export async function getServices(): Promise<Service[]> {
  let result: SERVICES_QUERY_RESULT;
  try {
    result = await serverClient.fetch(SERVICES_QUERY, {}, FETCH_OPTIONS);
  } catch (error) {
    logFallback({
      fetcher: "getServices",
      fallbackFile: "data/services.ts",
      affects: "homepage services grid + all /services/[slug] pages",
      error,
    });
    return fallbackServices;
  }

  const services = result
    .map(toService)
    .filter((s): s is Service => s !== null);

  if (services.length === 0) {
    logEmpty("getServices", "the homepage services grid is hidden and no service pages are generated.");
  }
  return services;
}

/** Single service for /services/[slug]. Null = genuinely not found (404). */
export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const result = await serverClient.fetch(
      SERVICE_BY_SLUG_QUERY,
      { slug },
      FETCH_OPTIONS,
    );
    return result ? toService(result) : null;
  } catch (error) {
    logFallback({
      fetcher: `getServiceBySlug(${slug})`,
      fallbackFile: "data/services.ts",
      affects: `/services/${slug}`,
      error,
    });
    return fallbackServices.find((s) => s.slug === slug) ?? null;
  }
}
