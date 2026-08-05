import type { NavIconName } from "./navigation";
import { vendorFaqs } from "./faqs";
import type {
  IconCardSection,
  ServiceFaqSection,
  ServiceTestimonialsSection,
} from "./serviceSections";
import {
  homePageDefaults,
  type HomeFinalCtaContent,
  type HomeLocationMapContent,
} from "./homePage";

/**
 * Partners-page section stack — FALLBACK for the `partnersPage` Sanity
 * singleton (see `sanity/lib/getPartnersPage.ts`). Same architecture as the
 * homepage and About page: an ordered array of typed sections the owner can
 * reorder, hide, duplicate, add and remove natively in Studio.
 *
 * Copy rules that still bind (do not reword without the owner): platform
 * claims never upgrade — "approved vendor" / "registered and in good
 * standing" never becomes "certified"; the per-platform card copy itself is
 * COLLECTION-driven (trustLogo documents with a blurb), not stored here; no
 * vendor logos are ever fetched from vendor sites; review quotes stay
 * verbatim in the Testimonials collection.
 *
 * Derived, never stored: the hero credential chips (licence number, years)
 * come from `data/site.ts` / Site Settings.
 */

export interface PartnersHeroContent {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  /** The chips derive from siteSettings; this only controls their presence. */
  showCredentials: boolean;
}

export interface VendorOnboardingContent {
  eyebrow: string;
  heading: string;
  description: string;
  items: Array<{ icon: NavIconName; title: string; description: string }>;
}

/** Heading block only — the platform cards come from the Trust Logos collection. */
export interface PartnerPlatformsContent {
  eyebrow: string;
  heading: string;
  description: string;
}

export interface PartnerCredentialsContent {
  eyebrow: string;
  heading: string;
  description: string;
  /** The button under the copy — the dashboard panel itself is design-owned. */
  ctaLabel: string;
  ctaHref: string;
}

/** Per-type default copy — also the render-time fill for emptied fields. */
export interface PartnersPageDefaults {
  hero: PartnersHeroContent;
  onboarding: VendorOnboardingContent;
  platforms: PartnerPlatformsContent;
  credentials: PartnerCredentialsContent;
}

export const partnersPageDefaults: PartnersPageDefaults = {
  hero: {
    eyebrow: "About Us",
    heading: "Fully Compliant and Approved Across Leading Vendor Systems",
    paragraphs: [
      "Fred’s Plumbing is registered and in good standing on the vendor-compliance platforms property management companies rely on — VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, and RealPage. Insurance, licensing, and documentation stay current in every system, so onboarding us is a lookup, not a paperwork chase.",
    ],
    showCredentials: true,
  },
  onboarding: {
    eyebrow: "Why It Matters",
    heading: "What Vendor Approval Buys You On Day One",
    description:
      "Being registered in your compliance system isn't a badge for our website — it's the difference between a same-day dispatch and a week of document requests.",
    // The claims here deliberately track ComplianceDashboardPanel's line
    // items (general liability, TX Master Plumber license, workers' comp,
    // W-9 and onboarding docs, background checks) — must not contradict.
    items: [
      {
        icon: "file-check-2",
        title: "Onboarding without the paperwork chase",
        description:
          "Our insurance certificates, licensing, and W-9 are already filed in the portals you use, so approval is a lookup rather than a request.",
      },
      {
        icon: "shield-check",
        title: "Coverage that stays current",
        description:
          "General liability, workers' compensation, and our Texas Master Plumber license are renewed and re-uploaded before they lapse, not after a system flags them.",
      },
      {
        icon: "clock-4",
        title: "Dispatch that starts the same day",
        description:
          "An approved vendor record means an emergency call becomes a truck rolling, not a compliance ticket.",
      },
      {
        icon: "clipboard-list",
        title: "Documentation that closes the work order",
        description:
          "Invoices, photos, and service notes land in your system in the format it expects.",
      },
    ],
  },
  platforms: {
    eyebrow: "Vendor Compliance",
    heading: "Approved Across the Systems Property Managers Already Use",
    description:
      "Each registration below is active and maintained — documentation, insurance, and certifications are already on file, so approving Fred's Plumbing is a lookup in the system you use today, not a new onboarding project.",
  },
  credentials: {
    eyebrow: "The Paper Trail",
    heading: "The Documents Behind the Approvals",
    description:
      "These are the records each platform verifies against — kept current year-round, and available for your vendor file directly whenever your system isn't one we're already in.",
    ctaLabel: "Request Compliance Documents",
    ctaHref: "/contact",
  },
};

interface SectionMeta<T extends string> {
  _type: T;
  _key: string;
  /** Hidden in Studio: content kept, section skipped at render. */
  hidden?: boolean;
}

/**
 * The Partners stack's accepted types: the four Partners bands plus the
 * shared library types — reviews and FAQ from the service library (they
 * carry filter/limit and inline questions), Icon Card, the map band and the
 * closing CTA from the home library. Reused, not forked.
 */
export type PartnersSection =
  | (SectionMeta<"partnersHero"> & PartnersHeroContent)
  | (SectionMeta<"vendorOnboarding"> & VendorOnboardingContent)
  | (SectionMeta<"partnerPlatforms"> & PartnerPlatformsContent)
  | (SectionMeta<"partnerCredentials"> & PartnerCredentialsContent)
  | (IconCardSection & { hidden?: boolean })
  | (ServiceTestimonialsSection & { hidden?: boolean })
  | (ServiceFaqSection & { hidden?: boolean })
  | (SectionMeta<"homeLocationMap"> & HomeLocationMapContent)
  | (SectionMeta<"homeFinalCta"> & HomeFinalCtaContent);

export type PartnersSectionType = PartnersSection["_type"];

/**
 * The shipped /about/partners page, in order — identical to the hand-built
 * page it replaces: hero, onboarding value points, platform cards,
 * credentials/dashboard, filtered reviews, vendor FAQ (inline copies of
 * `vendorFaqs`, so FAQPage JSON-LD keeps using the exact rendered strings),
 * and the same closing CTA (previously appended by the route).
 */
export const defaultPartnersSections: PartnersSection[] = [
  { _type: "partnersHero", _key: "hero", ...partnersPageDefaults.hero },
  { _type: "vendorOnboarding", _key: "onboarding", ...partnersPageDefaults.onboarding },
  { _type: "partnerPlatforms", _key: "platforms", ...partnersPageDefaults.platforms },
  { _type: "partnerCredentials", _key: "credentials", ...partnersPageDefaults.credentials },
  {
    _type: "serviceTestimonials",
    _key: "reviews",
    heading: "What Property Managers Say About Working With Us",
    filterTags: ["commercial-plumbing", "apartments"],
    limit: 4,
  },
  {
    _type: "serviceFaq",
    _key: "faq",
    heading: "Vendor Onboarding, Answered",
    background: "offwhite",
    faqs: vendorFaqs.map((faq, i) => ({
      _key: `partner-faq-${i + 1}`,
      question: faq.question,
      answer: faq.answer,
    })),
  },
  { _type: "homeFinalCta", _key: "finalCta", ...homePageDefaults.finalCta },
];
