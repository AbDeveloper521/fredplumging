import type { NavIconName } from "./navigation";
import type { CmsPhoto } from "./services";
import type { BadgeStripSection } from "./serviceSections";

/**
 * Homepage section stack — FALLBACK for the `homePage` Sanity singleton (see
 * `sanity/lib/getHomePage.ts`). The homepage is an ordered array of typed
 * sections, mirroring the service-page section-stack pattern: the owner can
 * reorder, hide, duplicate, add and remove sections natively in Studio.
 *
 * `defaultHomeSections` below is the shipped page: the client's reference
 * homepage (their old WordPress site), transcribed — hero with the emergency
 * form, red emergency band, heritage band, certification badges, services
 * grid, vendor compliance, property types, reviews, map, closing form.
 * Types absent from the reference (trust bar, why-choose-us, process, case
 * study, service area, FAQ) keep their defaults below so Studio can re-add
 * any of them with one click.
 *
 * Business facts (phone, cities, years) stay in `data/site.ts` — copy here
 * may reference them via tokens replaced at render time:
 *   {phone}           → siteSettings phone (becomes a link where noted)
 *   {foundedYear}     → siteSettings founded year
 *   {yearsInBusiness} → the derived "30+" years figure
 */

export interface HomeIconLabel {
  icon: NavIconName;
  label: string;
}

export interface HomeIconItem {
  icon: NavIconName;
  title: string;
  description: string;
}

export interface HomeHeroContent {
  eyebrow: string;
  /** The H1 renders headingBefore, then headingHighlight in red, then headingAfter. */
  headingBefore: string;
  headingHighlight?: string;
  headingAfter?: string;
  subcopy: string;
  /** Labels may use the {foundedYear} token. */
  trustIndicators: HomeIconLabel[];
  /** Line under the derived "{years} Years" figure in the hero badge. */
  experienceBadgeLabel: string;
  /**
   * The boxed "{years} Years" badge. Absent means true — only an explicit
   * Studio opt-out hides it, so banners published before the toggle existed
   * keep it.
   */
  showExperienceBadge?: boolean;
  /** Editable background photo behind the banner; navy wash when unset. */
  photo?: CmsPhoto;
  /**
   * Dark gradient over the background photo for text contrast. Absent means
   * true — only an explicit Studio opt-out turns it off.
   */
  darkOverlay?: boolean;
}

/** Collection band: logos come from Trust Logos — only the tagline is copy. */
export interface HomeTrustBarContent {
  tagline: string;
}

export interface HomeAboutMetric {
  icon: NavIconName;
  /** Empty → the years-in-business figure from Site Settings (derived, never stale). */
  value?: string;
  label: string;
}

export interface HomeAboutContent {
  eyebrow: string;
  heading: string;
  description: string;
  highlights: string[];
  /** Badge title is derived ("Since {foundedYear}"); only the subtitle is copy. */
  badgeSubtitle: string;
  metrics: HomeAboutMetric[];
  primaryPhoto?: CmsPhoto;
  primaryPhotoSubject: string;
  secondaryPhoto?: CmsPhoto;
  secondaryPhotoSubject: string;
}

/** Collection band: cards come from Services — only the heading block is copy. */
export interface HomeServicesContent {
  eyebrow: string;
  heading: string;
  description: string;
}

export interface HomeEmergencyContent {
  eyebrow: string;
  heading: string;
  body: string;
  benefits: HomeIconLabel[];
  photo?: CmsPhoto;
  photoSubject: string;
  photoCaption: string;
}

/** Collection band: the cards come from Property Types — copy + photo here. */
export interface HomeIndustriesContent {
  eyebrow: string;
  heading: string;
  description: string;
  photo?: CmsPhoto;
  photoSubject: string;
}

export interface HomeWhyChooseUsContent {
  eyebrow: string;
  heading: string;
  description: string;
  features: HomeIconItem[];
  photo?: CmsPhoto;
  photoSubject: string;
  /** May use the {yearsInBusiness} token. */
  photoCaption: string;
}

export interface HomeProcessStep {
  icon: NavIconName;
  title: string;
  description: string;
}

export interface HomeProcessContent {
  eyebrow: string;
  heading: string;
  /** Step numbers ("01", "02", …) derive from position. */
  steps: HomeProcessStep[];
}

export interface HomeComplianceContent {
  eyebrow: string;
  heading: string;
  description: string;
  items: string[];
}

/** Collection band: reviews come from Testimonials — only the heading is copy. */
export interface HomeTestimonialsContent {
  heading: string;
}

export interface HomeStoryBlock {
  icon: NavIconName;
  label: string;
  copy: string;
}

export interface HomeCaseStudyContent {
  badgeLabel: string;
  eyebrow: string;
  heading: string;
  storyBlocks: HomeStoryBlock[];
  photo?: CmsPhoto;
  photoSubject: string;
  photoCardTitle: string;
  photoCardSubtitle: string;
}

export interface HomeServiceAreaContent {
  eyebrow: string;
  heading: string;
  description: string;
  calloutBody: string;
}

/** Collection band: questions come from FAQs — only the heading block is copy. */
export interface HomeFaqContent {
  eyebrow: string;
  heading: string;
}

/** Copy and embed URL live in Site Settings — the item is just placement. */
export type HomeLocationMapContent = Record<never, never>;

export interface HomeFinalCtaContent {
  eyebrow: string;
  heading: string;
  description: string;
  /** The {phone} token becomes a clickable phone link. */
  reassurance: string;
}

/** Per-type default copy — also the prop defaults inside the components. */
export interface HomePageDefaults {
  hero: HomeHeroContent;
  trustBar: HomeTrustBarContent;
  about: HomeAboutContent;
  services: HomeServicesContent;
  emergency: HomeEmergencyContent;
  industries: HomeIndustriesContent;
  whyChooseUs: HomeWhyChooseUsContent;
  process: HomeProcessContent;
  compliance: HomeComplianceContent;
  testimonials: HomeTestimonialsContent;
  caseStudy: HomeCaseStudyContent;
  serviceArea: HomeServiceAreaContent;
  faq: HomeFaqContent;
  finalCta: HomeFinalCtaContent;
}

export const homePageDefaults: HomePageDefaults = {
  hero: {
    eyebrow: "Commercial & Multi-Family Plumbing Experts",
    headingBefore: "Expert Plumbing Services in the",
    headingHighlight: "Dallas–Fort Worth",
    headingAfter: "Metroplex",
    subcopy:
      "Fred's Plumbing provides 24/7 plumbing and specialty services for multi-family and commercial buildings throughout the Dallas–Fort Worth Metroplex. From emergency repairs to large-scale installations, our licensed team delivers fast, efficient, and long-lasting results for apartments, condos, assisted living facilities, and more.",
    trustIndicators: [
      { icon: "clock", label: "24/7 Emergency Response" },
      { icon: "shield-check", label: "Licensed & Insured" },
      { icon: "map-pin", label: "Serving DFW Since {foundedYear}" },
    ],
    experienceBadgeLabel: "Serving DFW property teams",
  },
  trustBar: {
    tagline: "Trusted by property managers and commercial facilities across DFW",
  },
  about: {
    eyebrow: "Fred’s Plumbing",
    heading: "Trusted Commercial Plumbers Serving the DFW Metroplex Since 1996",
    // Blank-line breaks render as separate paragraphs (the reference band
    // carries two). The reference shows no checkmark list and no metrics
    // row, so both default empty — Studio can still add them back.
    description:
      "Founded in 1996, Fred’s Plumbing has proudly served the Dallas–Fort Worth Metroplex (DFW) with a long-standing reputation for professionalism, reliability, and high-quality workmanship. Our team specializes in providing commercial and multi-family plumbing services for property management companies, facility owners, and real estate investors across Dallas, Fort Worth, and surrounding North Texas communities.\n\nFrom large-scale installations to ongoing maintenance and emergency repairs, we deliver efficient, safety-focused solutions that minimize downtime and protect your investment. Every project we complete reflects our dedication to precision, code compliance, and lasting performance, making Fred’s Plumbing one of the most trusted names in DFW commercial plumbing for nearly three decades.",
    highlights: [],
    badgeSubtitle: "Family-owned & operated",
    metrics: [],
    primaryPhotoSubject:
      "Fred's Plumbing commercial service team on site — /images/commercial-plumber-team.webp",
    secondaryPhotoSubject:
      "Technician at a DFW multi-family property — /images/technician-working.webp",
  },
  services: {
    eyebrow: "What We Do",
    heading: "Reliable Plumbing Services in Dallas & Fort Worth",
    description:
      "From emergency repairs to planned maintenance, our team provides dependable plumbing services tailored to the demands of commercial and multi-family environments.",
  },
  emergency: {
    eyebrow: "Available Day and Night",
    heading: "24/7 Emergency Plumbing Services in Dallas & Fort Worth",
    body: "Plumbing problems don't wait, and neither do we. Fred's Plumbing offers around-the-clock emergency plumbing services across the Dallas–Fort Worth Metroplex.",
    benefits: [
      { icon: "truck", label: "Fast dispatch" },
      { icon: "message-square", label: "Clear communication" },
      { icon: "wrench", label: "Commercial-ready service" },
      { icon: "map-pin", label: "DFW-wide coverage" },
    ],
    photoSubject:
      "Emergency technician and service vehicle at night — /images/service-emergency.webp",
    photoCaption: "Crews on call across DFW right now",
  },
  industries: {
    eyebrow: "Who We Serve",
    heading: "Plumbing Solutions Tailored to Multi-Family and Commercial Needs",
    description:
      "Our team understands the challenges of multi-family and commercial maintenance, providing fast, professional service that minimizes downtime and keeps your operations running smoothly.",
    photoSubject:
      "Fred's Plumbing technician at a multi-family property — /images/multifamily-property.webp",
  },
  whyChooseUs: {
    eyebrow: "Why Property Managers Choose Fred's",
    heading: "Dependable Service Without the Guesswork",
    description:
      "Our team understands that plumbing problems affect residents, operations, budgets, and property reputation. We provide practical solutions, clear updates, and responsive support at every stage.",
    features: [
      {
        icon: "clock",
        title: "24/7 Emergency Availability",
        description:
          "Around-the-clock response for urgent issues, with crews dispatched across the entire Metroplex.",
      },
      {
        icon: "building-2",
        title: "Commercial and Multi-Family Experience",
        description:
          "Decades of work in occupied communities and operating facilities — we know how to work around residents and tenants.",
      },
      {
        icon: "shield-check",
        title: "Licensed and Insured Professionals",
        description:
          "Fully credentialed technicians with documentation ready for your vendor files at any time.",
      },
      {
        icon: "message-square",
        title: "Transparent Communication",
        description:
          "Clear scopes, honest timelines, and proactive updates from dispatch through completion.",
      },
      {
        icon: "clipboard-check",
        title: "Vendor Compliance Support",
        description:
          "Registered with major vendor platforms and ready to meet your management company's onboarding requirements.",
      },
      {
        icon: "calendar-check",
        title: "Preventive Maintenance Expertise",
        description:
          "Planned programs that catch problems early, reduce emergencies, and protect your budget.",
      },
    ],
    photoSubject:
      "Property manager and technician reviewing work order — /images/vendor-compliance.webp",
    // Derived so it can never quietly age the way the old hardcoded "27+" did.
    photoCaption: "{yearsInBusiness} years of repeat commercial clients",
  },
  process: {
    eyebrow: "How It Works",
    heading: "A Straightforward Service Process",
    steps: [
      {
        icon: "phone-call",
        title: "Tell Us What You Need",
        description:
          "Call or send a request — we gather the details and prioritize urgent issues immediately.",
      },
      {
        icon: "search-check",
        title: "We Assess the Situation",
        description:
          "A technician evaluates the problem on site and walks you through the recommended fix.",
      },
      {
        icon: "wrench",
        title: "Our Team Completes the Work",
        description:
          "Licensed professionals complete the repair or project with minimal disruption to your property.",
      },
      {
        icon: "file-check-2",
        title: "You Receive Clear Follow-Up",
        description:
          "You get documentation of the completed work plus any recommendations for prevention.",
      },
    ],
  },
  compliance: {
    eyebrow: "Vendor-Ready and Fully Compliant",
    heading: "Fully Compliant and Approved Across Leading Vendor Systems",
    description:
      "Property managers throughout the Dallas–Fort Worth Metroplex trust Fred's Plumbing because we are verified and active within the platforms they use every day. Our team maintains complete vendor compliance with background checks, insurance verification, safety certifications, and documentation updates so you can schedule and manage service with confidence.",
    items: [
      "Licensing documentation",
      "Insurance verification",
      "Background requirements",
      "Vendor portal compliance",
      "Service documentation",
      "Property-specific coordination",
    ],
  },
  testimonials: {
    heading: "Trusted by Property Managers Across DFW",
  },
  caseStudy: {
    badgeLabel: "Representative service scenario",
    eyebrow: "Proven in the Field",
    heading: "Responsive Plumbing Support That Protects Your Property",
    storyBlocks: [
      {
        icon: "alert-triangle",
        label: "Problem",
        copy: "Recurring sewer backups were disrupting residents and creating repeated emergency calls.",
      },
      {
        icon: "lightbulb",
        label: "Solution",
        copy: "Our team inspected the system, identified the source, completed the required repair, and created a preventive maintenance schedule.",
      },
      {
        icon: "trending-up",
        label: "Outcome",
        copy: "Reduced repeat issues, improved response planning, and clearer maintenance visibility for the property team.",
      },
    ],
    photoSubject:
      "Multi-family property served by Fred's Plumbing — /images/multifamily-property.webp",
    photoCardTitle: "240-unit apartment community",
    photoCardSubtitle: "Dallas, TX",
  },
  serviceArea: {
    eyebrow: "Where We Work",
    heading: "Proudly Serving the Dallas–Fort Worth Metroplex",
    description:
      "Our commercial plumbing team supports properties across Dallas, Fort Worth, and surrounding communities.",
    calloutBody:
      "Not sure whether we serve your area? We cover the entire Metroplex and take on properties in surrounding communities case by case.",
  },
  faq: {
    eyebrow: "Good to Know",
    heading: "Common Questions",
  },
  finalCta: {
    eyebrow: "Let's Solve the Problem",
    heading: "Schedule Plumbing Service in Dallas–Fort Worth Today!",
    description:
      "Tell us about your property and the plumbing support you need. Our team will contact you to discuss the next steps.",
    reassurance:
      "Prefer to talk it through? Our office answers around the clock — {phone}, 24 hours a day, 7 days a week.",
  },
};

interface SectionMeta<T extends string> {
  _type: T;
  _key: string;
  /** Hidden in Studio: content kept, section skipped at render. */
  hidden?: boolean;
}

export type HomeSection =
  | (SectionMeta<"homeHero"> & HomeHeroContent)
  | (SectionMeta<"homeTrustBar"> & HomeTrustBarContent)
  | (SectionMeta<"homeAbout"> & HomeAboutContent)
  | (SectionMeta<"homeServices"> & HomeServicesContent)
  | (SectionMeta<"homeEmergency"> & HomeEmergencyContent)
  | (SectionMeta<"homeIndustries"> & HomeIndustriesContent)
  | (SectionMeta<"homeWhyChooseUs"> & HomeWhyChooseUsContent)
  | (SectionMeta<"homeProcess"> & HomeProcessContent)
  | (SectionMeta<"homeCompliance"> & HomeComplianceContent)
  | (SectionMeta<"homeTestimonials"> & HomeTestimonialsContent)
  | (SectionMeta<"homeCaseStudy"> & HomeCaseStudyContent)
  | (SectionMeta<"homeServiceArea"> & HomeServiceAreaContent)
  | (SectionMeta<"homeFaq"> & HomeFaqContent)
  | (SectionMeta<"homeLocationMap"> & HomeLocationMapContent)
  | (SectionMeta<"homeFinalCta"> & HomeFinalCtaContent);

export type HomeSectionType = HomeSection["_type"];

/**
 * The shipped homepage: the client's reference page, top to bottom. The
 * certification badge strip is the shared `badgeStrip` library section (its
 * logos come from Trust Logos). The reference has no map band, but the
 * Google-map band keeps its "right before the closing CTA" slot — it exists
 * for local SEO and the owner can remove it in Studio with one click.
 * Types absent here (trust bar, why-choose-us, process, case study, service
 * area, FAQ) stay in the library for re-adding in Studio.
 */
export const defaultHomeSections: (HomeSection | BadgeStripSection)[] = [
  { _type: "homeHero", _key: "hero", ...homePageDefaults.hero },
  { _type: "homeEmergency", _key: "emergency", ...homePageDefaults.emergency },
  { _type: "homeAbout", _key: "about", ...homePageDefaults.about },
  { _type: "badgeStrip", _key: "badgeStrip" },
  { _type: "homeServices", _key: "services", ...homePageDefaults.services },
  { _type: "homeCompliance", _key: "compliance", ...homePageDefaults.compliance },
  { _type: "homeIndustries", _key: "industries", ...homePageDefaults.industries },
  {
    _type: "homeTestimonials",
    _key: "testimonials",
    ...homePageDefaults.testimonials,
  },
  { _type: "homeLocationMap", _key: "locationMap" },
  { _type: "homeFinalCta", _key: "finalCta", ...homePageDefaults.finalCta },
];
