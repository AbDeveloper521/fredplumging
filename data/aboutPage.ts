import type { NavIconName } from "./navigation";
import type { CmsPhoto } from "./services";
import type { IconCardSection } from "./serviceSections";
import {
  homePageDefaults,
  type HomeFinalCtaContent,
  type HomeLocationMapContent,
  type HomeTestimonialsContent,
} from "./homePage";

/**
 * About-page section stack — FALLBACK for the `aboutPage` Sanity singleton
 * (see `sanity/lib/getAboutPage.ts`). Same architecture as the homepage:
 * an ordered array of typed sections the owner can reorder, hide, duplicate,
 * add and remove natively in Studio.
 *
 * The copy is the client's own text, transcribed from their WordPress About
 * page. Typography normalised (en dashes, curly apostrophes, hyphenated
 * compounds); claims unchanged — do not reword without the owner.
 *
 * Business facts (licence, years, cities) stay derived from `data/site.ts`:
 * the hero credential chips and the story badge's "Since {year}" title are
 * computed at render time, never stored here.
 */

export interface AboutValue {
  icon: NavIconName;
  title: string;
  description: string;
}

export interface AboutLinkCard {
  title: string;
  description: string;
  href: string;
}

export interface AboutHeroContent {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  /** The chips derive from siteSettings; this only controls their presence. */
  showCredentials: boolean;
}

export interface AboutStoryContent {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  /** Line under the derived "Since {foundedYear}" badge title. */
  badgeSubtitle: string;
  photoPrimary?: CmsPhoto;
  photoSubjectPrimary: string;
  photoSecondary?: CmsPhoto;
  photoSubjectSecondary: string;
}

export interface AboutEvolutionContent {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  photo?: CmsPhoto;
  photoSubject: string;
}

export interface ValuesGridContent {
  eyebrow: string;
  heading: string;
  values: AboutValue[];
}

export interface PageLinksContent {
  eyebrow: string;
  heading: string;
  links: AboutLinkCard[];
}

/** Per-type default copy — also the render-time fill for emptied fields. */
export interface AboutPageDefaults {
  hero: AboutHeroContent;
  story: AboutStoryContent;
  evolution: AboutEvolutionContent;
  values: ValuesGridContent;
  links: PageLinksContent;
}

export const aboutPageDefaults: AboutPageDefaults = {
  hero: {
    eyebrow: "Fred's Plumbing",
    heading: "About Fred's Plumbing",
    paragraphs: [
      "Fred's Plumbing is a trusted leader in multi-family and commercial emergency plumbing services across the DFW area. Family and employee owned for nearly 30 years, we operate 24/7, 365 days a year to keep properties running safely and efficiently. We are a one-stop shop offering a comprehensive suite of services, including traditional plumbing, drain and sewer solutions, hydrojetting, boilers, backflow prevention, and natural gas systems.",
      "Our licensed, credentialed team is experienced with all major vendor portals and property management requirements. Known for our professionalism, integrity, reliability, and strong safety culture, Fred's Plumbing is highly reviewed and trusted by property owners and managers throughout DFW.",
    ],
    showCredentials: true,
  },
  story: {
    eyebrow: "Our Story",
    heading: "Committed to Quality and Service Since 1996",
    paragraphs: [
      "Fred's Plumbing was founded in 1996 by Fredrick Lee Press, a master plumber who built his reputation on integrity, reliable craftsmanship, and doing the job right the first time. Fred passed away in 2023, but the values he instilled — hard work, honest service, and a genuine commitment to his customers — continue to guide everything we do. Over the years, our company has grown through those same principles, earning the trust of property managers and owners across the DFW Metroplex.",
    ],
    badgeSubtitle: "Family and employee owned",
    photoSubjectPrimary:
      "A hydrojetting hose run at a DFW apartment property (ask the owner for their real photo)",
    photoSubjectSecondary:
      "A Fred's Plumbing technician at work in a mechanical room",
  },
  evolution: {
    eyebrow: "Then and Now",
    heading: "Evolving to Meet the Needs of a Growing Region",
    paragraphs: [
      // "Over time," is a reconstruction — the opening words were obscured by
      // an overlay in the source page. The owner must confirm the wording.
      "Over time, Fred's Plumbing became known for providing dependable solutions to multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex. We developed expertise in complex plumbing systems, expanded our service offerings, and built long-lasting partnerships with property managers, facility owners, and residential communities.",
      "Today, our company continues to move forward with the same dedication that shaped our beginning. We embrace new technology, train our team to the highest standards, and work tirelessly to maintain the level of service that has defined us for nearly three decades. Our history reflects resilience, growth, and a commitment to excellence that guides everything we do.",
    ],
    photoSubject: "Commercial boiler and pipework at a multi-family property",
  },
  values: {
    eyebrow: "How We Work",
    heading: "What We Stand For",
    // Only qualities already stated in the copy above — nothing invented.
    values: [
      {
        icon: "award",
        title: "Professionalism",
        description: "Courteous, uniformed technicians who treat your property and residents with respect.",
      },
      {
        icon: "shield-check",
        title: "Integrity",
        description: "Honest service and doing the job right the first time — the standard Fred set in 1996.",
      },
      {
        icon: "clock",
        title: "Reliability",
        description: "24/7, 365 days a year — properties across DFW count on us to show up.",
      },
      {
        icon: "siren",
        title: "Strong Safety Culture",
        description: "Safety practices built into every job, from routine calls to emergency dispatch.",
      },
      {
        icon: "wrench",
        title: "Licensed & Credentialed",
        description: "A licensed, credentialed team trained to the highest standards.",
      },
      {
        icon: "building-2",
        title: "Vendor-Portal Ready",
        description: "Experienced with all major vendor portals and property management requirements.",
      },
    ],
  },
  links: {
    eyebrow: "Keep Exploring",
    heading: "Where to Next",
    links: [
      {
        title: "Partners & Vendor Compliance",
        description: "Approved and in good standing on the vendor platforms property managers already use.",
        href: "/about/partners",
      },
      {
        title: "Careers",
        description: "Open roles and what it's like to work on the Fred's Plumbing team.",
        href: "/about/careers",
      },
      {
        title: "Testimonials",
        description: "What property owners and managers across DFW say about working with us.",
        href: "/about/testimonials",
      },
    ],
  },
};

interface SectionMeta<T extends string> {
  _type: T;
  _key: string;
  /** Hidden in Studio: content kept, section skipped at render. */
  hidden?: boolean;
}

/**
 * The About stack's accepted types: the five About bands plus the shared
 * library types that are page-agnostic — Icon Card, the reviews band, the
 * map band, and the closing CTA (all reusing the homepage/service object
 * types, not forks).
 */
export type AboutSection =
  | (SectionMeta<"aboutHero"> & AboutHeroContent)
  | (SectionMeta<"aboutStory"> & AboutStoryContent)
  | (SectionMeta<"aboutEvolution"> & AboutEvolutionContent)
  | (SectionMeta<"valuesGrid"> & ValuesGridContent)
  | (SectionMeta<"pageLinks"> & PageLinksContent)
  | (IconCardSection & { hidden?: boolean })
  | (SectionMeta<"homeTestimonials"> & HomeTestimonialsContent)
  | (SectionMeta<"homeLocationMap"> & HomeLocationMapContent)
  | (SectionMeta<"homeFinalCta"> & HomeFinalCtaContent);

export type AboutSectionType = AboutSection["_type"];

/**
 * The shipped /about page, in order — identical to the fixed-field page it
 * replaces: hero, story, evolution, values, links, and the same closing CTA
 * (previously appended by the route, now a stack item the owner can move,
 * swap or hide).
 */
export const defaultAboutSections: AboutSection[] = [
  { _type: "aboutHero", _key: "hero", ...aboutPageDefaults.hero },
  { _type: "aboutStory", _key: "story", ...aboutPageDefaults.story },
  { _type: "aboutEvolution", _key: "evolution", ...aboutPageDefaults.evolution },
  { _type: "valuesGrid", _key: "values", ...aboutPageDefaults.values },
  { _type: "pageLinks", _key: "links", ...aboutPageDefaults.links },
  { _type: "homeFinalCta", _key: "finalCta", ...homePageDefaults.finalCta },
];
