import type { NavIconName } from "./navigation";
import type { CmsPhoto } from "./services";

/**
 * The constrained section library for service detail pages.
 *
 * Each service document may carry an ordered `sections` array drawn from this
 * fixed set. Every section is individually omittable — a document that omits
 * one renders without it and without layout artifacts — and a document with
 * no sections at all renders through the legacy body/CmsDetailPage path.
 *
 * Shapes mirror the Sanity object types in `sanity/schemas/serviceSections.ts`
 * exactly; `sanity/lib/getServices.ts` validates and resolves images before
 * anything reaches a component.
 */

interface SectionBase {
  _key: string;
}

export interface IconItem {
  _key: string;
  icon: NavIconName;
  title: string;
  description: string;
  /** Optional link: "/path" for a page, "#id" for an in-page anchor. */
  href?: string;
}

export interface ServiceHeroSection extends SectionBase {
  _type: "serviceHero";
  eyebrow?: string;
  heading: string;
  subheading: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  credentials: Array<{ _key: string; icon: NavIconName; label: string }>;
  photo?: CmsPhoto;
  /** Intended photo subject — placeholder caption until a photo exists. */
  photoSubject?: string;
  /** Call-button text; "{phone}" is replaced with the siteSettings number. */
  phoneCtaLabel?: string;
  /** Pulsing red dot on the first credential (24/7-availability pages). */
  showAvailabilityDot?: boolean;
}

export interface ServiceAboutSection extends SectionBase {
  _type: "serviceAbout";
  heading: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaHref: string;
  photoPrimary?: CmsPhoto;
  photoSecondary?: CmsPhoto;
  /** Intended photo subjects — placeholder captions until photos exist. */
  photoSubjectPrimary?: string;
  photoSubjectSecondary?: string;
}

export interface WhatsIncludedSection extends SectionBase {
  _type: "whatsIncluded";
  heading: string;
  intro: string;
  items: IconItem[];
}

export interface SignsYouNeedSection extends SectionBase {
  _type: "signsYouNeed";
  heading: string;
  cards: Array<{ _key: string; icon: NavIconName; question: string; answer: string }>;
  ctaLabel: string;
  ctaHref: string;
  /** Section background — defaults to white. */
  background?: "white" | "dark";
}

export interface ProcessStepsSection extends SectionBase {
  _type: "processSteps";
  heading: string;
  steps: Array<{ _key: string; title: string; description: string }>;
}

export interface ComparisonTableSection extends SectionBase {
  _type: "comparisonTable";
  heading: string;
  /** Optional framing sentence above the table (e.g. a disclaimer). */
  intro?: string;
  /** Optional column headings — defaults to Situation | Typical Recommendation | Why. */
  columnLabels?: [string, string, string];
  rows: Array<{
    _key: string;
    situation: string;
    recommendation: string;
    why: string;
  }>;
  footnote?: string;
  /** Section background — defaults to white. */
  background?: "white" | "dark";
}

export interface ServiceTrustSection extends SectionBase {
  _type: "serviceTrust";
  heading: string;
  items: Array<{ _key: string; icon: NavIconName; title: string; description: string }>;
  showLogos: boolean;
}

export interface ServiceTestimonialsSection extends SectionBase {
  _type: "serviceTestimonials";
  heading: string;
}

export interface PropertyTypesSection extends SectionBase {
  _type: "propertyTypes";
  heading: string;
  cards: Array<{
    _key: string;
    icon: NavIconName;
    title: string;
    blurb: string;
    /**
     * Industry slug — resolved to /multifamily/[slug] via industryHref().
     * Optional: a card without a slug renders as informational (no link).
     */
    slug?: string;
    /** Optional card image; falls back to a placeholder with photoSubject. */
    photo?: CmsPhoto;
    photoSubject?: string;
  }>;
  /** Section background — defaults to the dark navy band. */
  background?: "dark" | "white" | "offwhite";
  /** Optional single CTA under the grid. */
  ctaLabel?: string;
  ctaHref?: string;
}

export interface ServiceFaqSection extends SectionBase {
  _type: "serviceFaq";
  heading: string;
  faqs: Array<{
    _key: string;
    question: string;
    answer: string;
    /** Optional related-page link rendered after the answer. */
    href?: string;
    linkLabel?: string;
  }>;
  /** Section background — defaults to offwhite. */
  background?: "offwhite" | "white";
}

export interface ServiceAreaSection extends SectionBase {
  _type: "serviceArea";
  heading: string;
  body: string;
  photo?: CmsPhoto;
  /** Intended photo subject — placeholder caption until a photo exists. */
  photoSubject?: string;
}

export interface RelatedServicesSection extends SectionBase {
  _type: "relatedServices";
  heading: string;
  /** Sibling service slugs — resolved via serviceHref() and data from getServices(). */
  serviceSlugs: string[];
}

export interface FinalCtaSection extends SectionBase {
  _type: "finalCta";
  heading: string;
  body: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  /** Call-button text; "{phone}" is replaced with the siteSettings number. */
  phoneCtaLabel?: string;
  /** Pulsing red dot beside the call button (24/7-availability pages). */
  showAvailabilityDot?: boolean;
}

export type ServiceSection =
  | ServiceHeroSection
  | ServiceAboutSection
  | WhatsIncludedSection
  | SignsYouNeedSection
  | ProcessStepsSection
  | ComparisonTableSection
  | ServiceTrustSection
  | ServiceTestimonialsSection
  | PropertyTypesSection
  | ServiceFaqSection
  | ServiceAreaSection
  | RelatedServicesSection
  | FinalCtaSection;
