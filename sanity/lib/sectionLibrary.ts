import "server-only";
import { resolvePhoto } from "@/sanity/lib/image";
import { logSectionDropped } from "@/sanity/lib/fallbackLog";
import { NAV_ICON_NAMES, type NavIconName } from "@/data/navigation";
import { isReviewTag } from "@/data/googleReviews";
import type { CmsPhoto } from "@/data/services";
import {
  ICON_CARD_COLORS,
  type IconCardSection,
} from "@/data/serviceSections";
import { homePageDefaults } from "@/data/homePage";
import { aboutPageDefaults } from "@/data/aboutPage";
import { partnersPageDefaults } from "@/data/partnersPage";
import { careersPageDefaults } from "@/data/careersPage";
import { contactPageDefaults } from "@/data/contactPage";
import { DEFAULT_FAQ_HEADING } from "@/data/faqSets";
import type { LibrarySection } from "@/data/sectionLibrary";

/**
 * Cache tag for the shared `faqSet` documents.
 *
 * It lives here, not in a fetcher, because no page fetches a set on its own:
 * `SECTIONS_PROJECTION` dereferences it inside the page query. That means the
 * page's cache entry contains content from a document whose `_type` is NOT the
 * page's — so every fetcher that maps a section stack passes this tag
 * alongside its own, and `revalidateTag("faqSet")` from /api/revalidate
 * reaches the pages that show the set rather than only the set itself.
 * (Sanity Live's syncTags already cover dereferenced documents; this is the
 * webhook path, which does not.)
 */
export const FAQ_SET_TAG = "faqSet";

/**
 * THE shared section-library mapper: validates a raw `sections` array from
 * ANY page document (service, industry, homePage, aboutPage, partnersPage,
 * careersPage, cityPage) into the `LibrarySection` union — the merge of the
 * six per-page mappers this file replaces, each type's case kept verbatim.
 *
 * Two semantics coexist by type, exactly as before the merge:
 *  - The service-library types keep their render GATES: a section below its
 *    minimum (no heading, no complete card, …) drops — and is logged with
 *    the Studio fields that bring it back.
 *  - The page-band types (home/About/Partners/Careers) keep their per-field
 *    DEFAULT FILL: a duplicated section with one cleared field falls back to
 *    that type's default copy and never blanks a band.
 *
 * `hidden: true` skips silently on every page (the owner's toggle working
 * as designed). Unknown types drop loudly. Two shared types had divergent
 * per-page behaviour before the merge and now have one:
 *  - serviceTestimonials: an emptied heading falls back to the default
 *    reviews heading (the Partners/Careers behaviour) instead of dropping.
 *  - serviceFaq: keeps the service gate (heading + ≥1 complete Q&A, else
 *    drop). The old Partners mapper resurrected the Partners default FAQ
 *    list — page-specific content no other page may inherit, and FAQPage
 *    JSON-LD must never carry silently substituted copy.
 */

type Raw = Record<string, unknown>;

/** A picked icon, or the caller's own fallback for that slot. */
function iconOr(value: unknown, fallback: NavIconName): NavIconName {
  return typeof value === "string" &&
    (NAV_ICON_NAMES as readonly string[]).includes(value)
    ? (value as NavIconName)
    : fallback;
}

function toIcon(value: unknown): NavIconName {
  return iconOr(value, "wrench");
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

/** Non-empty strings, or the type's fallback list (default-fill semantics). */
function stringsOr(value: unknown, fallback: string[]): string[] {
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

/**
 * Service-library photo resolution — context names the section type + field
 * (these sections don't know their parent document).
 */
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
  return resolvePhoto(
    image as { asset?: unknown; alt?: string | null },
    options?.width ?? 1600,
    `a "${String(item._type ?? "section")}" section → ${field}`,
    aspect,
  );
}

/** Page-band photo resolution — context names the document and band. */
function bandPhotoOf(
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
        `${context} → ${field}`,
        aspect,
      )
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

/** The valid { icon, label } rows of an array field, in order. */
function iconLabels<T extends { icon: NavIconName; label: string }>(
  value: unknown,
): T[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const label = str((item as Raw).label);
        return label ? [{ icon: toIcon((item as Raw).icon), label } as T] : [];
      })
    : [];
}

/** { icon, label } rows with default fill (emergency benefits). */
function iconLabelsOr<T extends { icon: NavIconName; label: string }>(
  value: unknown,
  fallback: T[],
): T[] {
  const list = iconLabels<T>(value);
  return list.length ? list : fallback;
}

/** { icon, title, description } rows with default fill (features, values, cards). */
function iconItemsOr<T extends { icon: NavIconName; title: string; description: string }>(
  value: unknown,
  fallback: T[],
): T[] {
  const list = Array.isArray(value)
    ? value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const title = str((item as Raw).title);
        const description = str((item as Raw).description);
        return title && description
          ? [{ icon: toIcon((item as Raw).icon), title, description } as T]
          : [];
      })
    : [];
  return list.length ? list : fallback;
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
 * Icon Card is the same object type on every stack, so it validates in
 * exactly one place. Minimum to render: at least one complete card — the
 * cards ARE the section; eyebrow and heading are optional dressing.
 * Malformed cards are dropped individually and the section survives; null
 * only when no card survives.
 */
function toIconCardSection(raw: Raw, index: number): IconCardSection | null {
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
 * Maps ONE raw section of any library type; null when it fails its type's
 * render gate. `context` identifies the parent document in image warnings,
 * e.g. `service "plumbing"` or `homePage`.
 */
export function toLibrarySection(
  raw: Raw,
  index: number,
  context: string,
): LibrarySection | null {
  const _key = key(raw, index);

  switch (raw._type) {
    // ————— Service library (render gates, no default fill) —————
    case "trustLogoStrip":
      // Retired: renders nothing, but stays mapped so published stacks that
      // still contain it don't raise dropped-section warnings.
      return {
        _type: "trustLogoStrip",
        _key,
        background: choice(raw.background, ["offwhite", "white"] as const),
      };
    case "badgeStrip":
      // Collection-driven (Trust Logos, association/credential categories):
      // never drops — an empty heading falls back in the component, and an
      // empty collection hides the band at render like every logo strip.
      return {
        _type: "badgeStrip",
        _key,
        heading: str(raw.heading),
      };
    case "propertyTypes": {
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
              photo: bandPhotoOf(c, "photo", 1600, `${context} → card "${str(c.title)}"`, 16 / 10),
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
    case "iconCardSection":
      return toIconCardSection(raw, index);
    case "serviceHero": {
      // Minimum to render: heading (the page H1). Subheading, secondary CTA
      // and credentials all degrade to absent.
      const heading = str(raw.heading);
      if (!heading) return null;
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
      const heading = str(raw.heading);
      if (!heading) return null;
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
      const heading = str(raw.heading);
      if (!heading) return null;
      const items = children(raw.items, iconItem);
      if (items.length === 0) return null;
      return { _type: "whatsIncluded", _key, heading, intro: str(raw.intro), items };
    }
    case "signsYouNeed": {
      // Minimum to render: heading + at least one valid card. The CTA button
      // under the cards degrades to absent.
      const heading = str(raw.heading);
      if (!heading) return null;
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
      const heading = str(raw.heading);
      if (!heading) return null;
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
      const heading = str(raw.heading);
      if (!heading) return null;
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
      const heading = str(raw.heading);
      if (!heading) return null;
      const items = children(raw.items, iconItem);
      if (items.length === 0) return null;
      return { _type: "serviceTrust", _key, heading, items };
    }
    case "serviceTestimonials": {
      // Reviews come from the site-wide Testimonials collection; an emptied
      // heading falls back to the default reviews heading (unified from the
      // Partners/Careers behaviour — a cleared field never blanks the band).
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
      // Minimum to render: heading + at least one complete Q&A pair. No
      // default fill on purpose: this section feeds FAQPage JSON-LD, which
      // must never carry silently substituted content.
      const heading = str(raw.heading);
      if (!heading) return null;
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
      const heading = str(raw.heading);
      if (!heading) return null;
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
      const heading = str(raw.heading);
      if (!heading) return null;
      const serviceSlugs = Array.isArray(raw.serviceSlugs)
        ? raw.serviceSlugs.filter((s): s is string => typeof s === "string" && s.trim() !== "")
        : [];
      if (serviceSlugs.length === 0) return null;
      return { _type: "relatedServices", _key, heading, serviceSlugs };
    }
    case "finalCta": {
      // Minimum to render: heading — the phone button always renders from
      // Site Settings. Body and the secondary CTA degrade to absent.
      const heading = str(raw.heading);
      if (!heading) return null;
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

    // ————— Homepage bands (per-field default fill) —————
    case "homeHero": {
      const fb = homePageDefaults.hero;
      const headingBefore = str(raw.headingBefore);
      const primaryCta =
        ctaPair(raw.ctaLabel, raw.ctaHref) ?? ctaPair(fb.ctaLabel, fb.ctaHref);
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
        // The button's text and link travel as a unit (the Studio refuses a
        // half-filled pair), so the pair default-fills as a unit too —
        // banners published before these fields existed keep their button.
        // Removal is the toggle below, never a cleared field.
        ctaLabel: primaryCta?.label,
        ctaHref: primaryCta?.href,
        showPrimaryButton: raw.showPrimaryButton !== false,
        phoneCtaLabel: str(raw.phoneCtaLabel) ?? fb.phoneCtaLabel,
        showPhoneButton: raw.showPhoneButton !== false,
        // Absent (never edited) → the reference chips, so banners published
        // before this band was touched are unchanged. A list the owner has
        // actually emptied is honoured as empty — default-fill must not
        // resurrect chips they deleted.
        trustIndicators: Array.isArray(raw.trustIndicators)
          ? iconLabels(raw.trustIndicators)
          : fb.trustIndicators,
        experienceBadgeLabel:
          str(raw.experienceBadgeLabel) ?? fb.experienceBadgeLabel,
        experienceBadgeIcon: iconOr(raw.experienceBadgeIcon, fb.experienceBadgeIcon),
        // Missing/absent → true: every banner published before the toggle
        // existed keeps its badge.
        showExperienceBadge: raw.showExperienceBadge !== false,
        formHeading: str(raw.formHeading) ?? fb.formHeading,
        formIntro: str(raw.formIntro) ?? fb.formIntro,
        formSubmitLabel: str(raw.formSubmitLabel) ?? fb.formSubmitLabel,
        // Full-width banner background — same hotspot-aware wide crop as the
        // service/careers heroes; the frame here is load-bearing.
        photo: photoOf(raw, "photo", 16 / 9, {
          width: 2400,
          ignoreFrameRatio: true,
        }),
        // Missing/absent → true: the overlay only turns off on an explicit
        // Studio opt-out.
        darkOverlay: raw.darkOverlay !== false,
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
        highlights: stringsOr(raw.highlights, fb.highlights),
        badgeSubtitle: str(raw.badgeSubtitle) ?? fb.badgeSubtitle,
        metrics: metrics.length ? metrics : fb.metrics,
        // Design ratios match each frame in AboutCollage: 4:3 both, cropped
        // server-side so the CDN honours the editor's hotspot.
        primaryPhoto: bandPhotoOf(raw, "primaryPhoto", 1600, `${context} → About band`, 4 / 3),
        primaryPhotoSubject:
          str(raw.primaryPhotoSubject) ?? fb.primaryPhotoSubject,
        secondaryPhoto: bandPhotoOf(raw, "secondaryPhoto", 800, `${context} → About band`, 4 / 3),
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
        benefits: iconLabelsOr(raw.benefits, fb.benefits),
        photo: bandPhotoOf(raw, "photo", 1200, `${context} → Emergency band`, 4 / 5),
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
        photo: bandPhotoOf(raw, "photo", 1600, `${context} → Property types band`, 16 / 10),
        photoSubject: str(raw.photoSubject) ?? fb.photoSubject,
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
        features: iconItemsOr(raw.features, fb.features),
        photo: bandPhotoOf(raw, "photo", 1200, `${context} → Why choose us`, 16 / 10),
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
        steps: iconItemsOr(raw.steps, fb.steps),
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
        items: stringsOr(raw.items, fb.items),
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
        photo: bandPhotoOf(raw, "photo", 1600, `${context} → Service scenario`, 4 / 3),
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
    case "faqBand": {
      // Two modes collapse to one rendered shape here, so the component and
      // the fallback never have to know which was used.
      //
      // Minimum to render: at least one complete Q&A, from the referenced set
      // or from this section's own list. The heading has a default fill, so a
      // band never drops for wanting a title — but an empty or deleted set is
      // a drop, not a blank band.
      const inline = raw.source === "inline";
      // Already dereferenced by SECTIONS_PROJECTION (`faqSet->`); a deleted
      // or unpublished target arrives as null.
      const set =
        !inline && raw.faqSet && typeof raw.faqSet === "object"
          ? (raw.faqSet as Raw)
          : undefined;
      const items = children(inline ? raw.items : set?.items, (c, i) => {
        const question = str(c.question);
        const answer = str(c.answer);
        return question && answer
          ? { _key: key(c, i), question, answer }
          : null;
      });
      if (items.length === 0) return null;
      return {
        _type: "faqBand",
        _key,
        heading: inline
          ? (str(raw.heading) ?? DEFAULT_FAQ_HEADING)
          : (str(raw.headingOverride) ??
            str(set?.heading) ??
            DEFAULT_FAQ_HEADING),
        intro: inline ? str(raw.intro) : str(set?.intro),
        items,
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

    // ————— About bands (per-field default fill) —————
    case "aboutHero": {
      const fb = aboutPageDefaults.hero;
      return {
        _type: "aboutHero",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        paragraphs: stringsOr(raw.paragraphs, fb.paragraphs),
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
        paragraphs: stringsOr(raw.paragraphs, fb.paragraphs),
        badgeSubtitle: str(raw.badgeSubtitle) ?? fb.badgeSubtitle,
        // Design ratios match each AboutCollage frame: 4:3 both, cropped
        // server-side so the CDN honours the editor's hotspot.
        photoPrimary: bandPhotoOf(raw, "photoPrimary", 1600, `${context} → Story band`, 4 / 3),
        photoSubjectPrimary:
          str(raw.photoSubjectPrimary) ?? fb.photoSubjectPrimary,
        photoSecondary: bandPhotoOf(raw, "photoSecondary", 800, `${context} → Story band`, 4 / 3),
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
        paragraphs: stringsOr(raw.paragraphs, fb.paragraphs),
        photo: bandPhotoOf(raw, "photo", 1600, `${context} → Evolution band`, 4 / 3),
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
        values: iconItemsOr(raw.values, fb.values),
      };
    }
    case "pageLinks": {
      const fb = aboutPageDefaults.links;
      const links = Array.isArray(raw.links)
        ? raw.links.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const title = str((item as Raw).title);
            const description = str((item as Raw).description);
            const href = str((item as Raw).href);
            return title && description && href
              ? [{ title, description, href }]
              : [];
          })
        : [];
      return {
        _type: "pageLinks",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        links: links.length ? links : fb.links,
      };
    }

    // ————— Partners bands (per-field default fill) —————
    case "partnersHero": {
      const fb = partnersPageDefaults.hero;
      return {
        _type: "partnersHero",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        paragraphs: stringsOr(raw.paragraphs, fb.paragraphs),
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
        items: iconItemsOr(raw.items, fb.items),
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

    // ————— Careers bands (per-field default fill) —————
    case "careersHero": {
      const fb = careersPageDefaults.hero;
      return {
        _type: "careersHero",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        paragraphs: stringsOr(raw.paragraphs, fb.paragraphs),
        // Full-width banner background — same hotspot-aware wide crop as the
        // service hero.
        photo: bandPhotoOf(raw, "photo", 2400, `${context} → Top banner`, 16 / 9),
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
        items: iconItemsOr(raw.items, fb.items),
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
      const traits = Array.isArray(raw.traits)
        ? raw.traits.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const name = str((item as Raw).name);
            const gloss = str((item as Raw).gloss);
            return name && gloss ? [{ name, gloss }] : [];
          })
        : [];
      return {
        _type: "careerTraits",
        _key,
        eyebrow: str(raw.eyebrow) ?? fb.eyebrow,
        heading: str(raw.heading) ?? fb.heading,
        description: str(raw.description) ?? fb.description,
        traits: traits.length ? traits : fb.traits,
        quote: str(raw.quote),
      };
    }
    case "hiringProcess": {
      const fb = careersPageDefaults.hiringProcess;
      const steps = Array.isArray(raw.steps)
        ? raw.steps.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const title = str((item as Raw).title);
            const description = str((item as Raw).description);
            return title && description ? [{ title, description }] : [];
          })
        : [];
      return {
        _type: "hiringProcess",
        _key,
        heading: str(raw.heading) ?? fb.heading,
        steps: steps.length ? steps : fb.steps,
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

    // ————— City bands (render gate, no cross-city default fill) —————
    case "cityCommunities": {
      // Minimum to render: heading + paragraph (the copy IS the band).
      // Chips, photos, and the CTA all degrade to absent. No default fill on
      // purpose: two city documents carry deliberately distinct copy
      // (doorway-page rule) — an emptied field must never resurrect as some
      // other city's words.
      const heading = str(raw.heading);
      const body = str(raw.body);
      if (!heading || !body) return null;
      const communities = Array.isArray(raw.communities)
        ? raw.communities.filter((entry): entry is string => Boolean(str(entry)))
        : [];
      const cta = ctaPair(raw.ctaLabel, raw.ctaHref);
      return {
        _type: "cityCommunities",
        _key,
        heading,
        body,
        communities,
        // The pair shares one wide frame — cropped 16:10 server-side so the
        // CDN honours each photo's hotspot.
        photoPrimary: bandPhotoOf(raw, "photoPrimary", 1600, context, 16 / 10),
        photoSubjectPrimary: str(raw.photoSubjectPrimary),
        photoSecondary: bandPhotoOf(raw, "photoSecondary", 1600, context, 16 / 10),
        photoSubjectSecondary: str(raw.photoSubjectSecondary),
        ctaLabel: cta?.label,
        ctaHref: cta?.href,
      };
    }

    // ————— Contact bands (default fill — these must never drop) —————
    case "contactChannels": {
      const fb = contactPageDefaults.channels;
      const cta = ctaPair(raw.quoteCtaLabel, raw.quoteCtaHref);
      return {
        _type: "contactChannels",
        _key,
        emergencyHeading: str(raw.emergencyHeading) ?? fb.emergencyHeading,
        emergencyBody: str(raw.emergencyBody) ?? fb.emergencyBody,
        emergencyNote: str(raw.emergencyNote) ?? fb.emergencyNote,
        quoteHeading: str(raw.quoteHeading) ?? fb.quoteHeading,
        quoteBody: str(raw.quoteBody) ?? fb.quoteBody,
        quoteCtaLabel: cta?.label,
        quoteCtaHref: cta?.href,
      };
    }
    case "contactForm": {
      // Default fill on EVERY field, and deliberately no render gate: this
      // band is the site's lead capture. An owner who clears one label must
      // get that label's shipped wording back, never a blank control and
      // never a vanished form. Removing the form is a separate, explicit act
      // (delete or hide the section) — and the document schema warns on it.
      const fb = contactPageDefaults.form;
      return {
        _type: "contactForm",
        _key,
        heading: str(raw.heading) ?? fb.heading,
        intro: str(raw.intro) ?? fb.intro,
        workLegend: str(raw.workLegend) ?? fb.workLegend,
        contactLegend: str(raw.contactLegend) ?? fb.contactLegend,
        serviceLabel: str(raw.serviceLabel) ?? fb.serviceLabel,
        servicePlaceholder: str(raw.servicePlaceholder) ?? fb.servicePlaceholder,
        propertyTypeLabel: str(raw.propertyTypeLabel) ?? fb.propertyTypeLabel,
        locationLabel: str(raw.locationLabel) ?? fb.locationLabel,
        urgencyLabel: str(raw.urgencyLabel) ?? fb.urgencyLabel,
        messageLabel: str(raw.messageLabel) ?? fb.messageLabel,
        messagePlaceholder:
          str(raw.messagePlaceholder) ?? fb.messagePlaceholder,
        nameLabel: str(raw.nameLabel) ?? fb.nameLabel,
        companyLabel: str(raw.companyLabel) ?? fb.companyLabel,
        phoneLabel: str(raw.phoneLabel) ?? fb.phoneLabel,
        emailLabel: str(raw.emailLabel) ?? fb.emailLabel,
        contactMethodLabel: str(raw.contactMethodLabel) ?? fb.contactMethodLabel,
        referralLabel: str(raw.referralLabel) ?? fb.referralLabel,
        submitLabel: str(raw.submitLabel) ?? fb.submitLabel,
        submittingLabel: str(raw.submittingLabel) ?? fb.submittingLabel,
        submitNote: str(raw.submitNote) ?? fb.submitNote,
        // The ONE field with no default fill: the shipped page carries no
        // consent line, so "empty" is the real value, not a gap to patch.
        consentLine: str(raw.consentLine),
        emergencyNotice: str(raw.emergencyNotice) ?? fb.emergencyNotice,
        successHeading: str(raw.successHeading) ?? fb.successHeading,
        successBody: str(raw.successBody) ?? fb.successBody,
        successAgainLabel: str(raw.successAgainLabel) ?? fb.successAgainLabel,
        errorMessage: str(raw.errorMessage) ?? fb.errorMessage,
        detailsHeading: str(raw.detailsHeading) ?? fb.detailsHeading,
        phoneRowLabel: str(raw.phoneRowLabel) ?? fb.phoneRowLabel,
        emailRowLabel: str(raw.emailRowLabel) ?? fb.emailRowLabel,
        serviceAreaRowLabel:
          str(raw.serviceAreaRowLabel) ?? fb.serviceAreaRowLabel,
        hoursRowLabel: str(raw.hoursRowLabel) ?? fb.hoursRowLabel,
        licenseRowLabel: str(raw.licenseRowLabel) ?? fb.licenseRowLabel,
      };
    }

    default:
      return null;
  }
}

/**
 * The load-bearing fields per DROPPABLE section type — the render gates in
 * `toLibrarySection()` above, expressed as data so drops can be EXPLAINED,
 * not just detected. `title` is the field's Studio title (what the owner
 * sees on screen). Default-fill types never drop, so they need no entry:
 * `explainDrop` is only reached for a type that actually returned null.
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
    /**
     * For types whose gate depends on the section's own settings (a mode
     * switch, a reference), where a fixed field list would name the wrong
     * thing. Returns the Studio field titles to report.
     */
    explain?: (raw: Raw) => string[];
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
  // Never drops since the heading gained its default fill.
  serviceTestimonials: { strings: [], arrays: [] },
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
  faqBand: {
    // Which field is at fault depends on the mode, so `explain` decides.
    strings: [],
    arrays: [],
    explain: (raw) => {
      if (raw.source === "inline") {
        return ["Questions (none complete — each needs a question AND an answer)"];
      }
      const set = raw.faqSet;
      if (!set || typeof set !== "object") {
        return [
          "Which FAQ set (none chosen, or the chosen set was deleted/unpublished)",
        ];
      }
      return [
        "the chosen FAQ set has no complete question (each needs a question AND an answer)",
      ];
    },
  },
  serviceArea: { strings: [{ field: "heading", title: "Heading" }], arrays: [] },
  // Never drops — retired type kept mapped so existing stacks stay warning-free.
  trustLogoStrip: { strings: [], arrays: [] },
  // Never drops — collection-driven, heading falls back in the component.
  badgeStrip: { strings: [], arrays: [] },
  relatedServices: {
    strings: [{ field: "heading", title: "Heading" }],
    arrays: [{ field: "serviceSlugs", title: "Which services", valid: nonEmptyString }],
  },
  finalCta: { strings: [{ field: "heading", title: "Heading" }], arrays: [] },
  cityCommunities: {
    strings: [
      { field: "heading", title: "Heading" },
      { field: "body", title: "Paragraph" },
    ],
    arrays: [],
  },
  // Never drop — every field default-fills. Listed so an unknown-type report
  // can never mistake them for unregistered sections.
  contactChannels: { strings: [], arrays: [] },
  contactForm: { strings: [], arrays: [] },
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

/** Names the fields that made `toLibrarySection()` return null for this item. */
export function explainDrop(raw: Raw, index: number): DroppedSection {
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
  if (requirements.explain) {
    const studioFields = requirements.explain(raw);
    return { _type, _key, index, emptyFields: studioFields, studioFields };
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

/**
 * Maps a raw sections array and reports every drop with the fields that
 * caused it. Used by /api/health/sanity and scripts/audit-sections.ts;
 * does not log — `toLibrarySections()` is the logging entry point.
 */
export function toSectionsWithReport(
  value: unknown,
  context = "a document",
): { sections: LibrarySection[] | undefined; dropped: DroppedSection[] } {
  if (!Array.isArray(value)) return { sections: undefined, dropped: [] };
  const dropped: DroppedSection[] = [];
  const sections: LibrarySection[] = [];
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
    const item = raw as Raw;
    // The owner's toggle working as designed — skipped, never a drop.
    if (item.hidden === true) return;
    const section = toLibrarySection(item, i, context);
    if (section) sections.push(section);
    else dropped.push(explainDrop(item, i));
  });
  return { sections: sections.length > 0 ? sections : undefined, dropped };
}

/**
 * Maps a raw sections array; undefined when absent or nothing survives.
 * Hidden sections are skipped silently; every dropped section is logged
 * loudly with the document context and the Studio field titles the owner
 * must fill to bring it back. `context` identifies the parent document,
 * e.g. `service "plumbing"`, `homePage`, `cityPage "dallas"`.
 */
export function toLibrarySections(
  value: unknown,
  context: string,
): LibrarySection[] | undefined {
  const { sections, dropped } = toSectionsWithReport(value, context);
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
