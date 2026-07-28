import type { NavIconName } from "./navigation";
import type { CmsPhoto } from "./services";

/**
 * About-page copy — the client's own text, transcribed from their WordPress
 * About page. FALLBACK for the `aboutPage` Sanity singleton (see
 * `sanity/lib/getAboutPage.ts`); the page renders identically against an
 * empty dataset. Typography normalised (en dashes, curly apostrophes,
 * hyphenated compounds); claims unchanged.
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

export interface AboutPageContent {
  heroEyebrow: string;
  heroHeading: string;
  heroParagraphs: string[];
  storyHeading: string;
  storyParagraphs: string[];
  storyPhotoPrimary?: CmsPhoto;
  storyPhotoSubjectPrimary: string;
  storyPhotoSecondary?: CmsPhoto;
  storyPhotoSubjectSecondary: string;
  evolutionHeading: string;
  evolutionParagraphs: string[];
  evolutionPhoto?: CmsPhoto;
  evolutionPhotoSubject: string;
  valuesHeading: string;
  values: AboutValue[];
  linksHeading: string;
  links: AboutLinkCard[];
}

export const aboutPage: AboutPageContent = {
  heroEyebrow: "Fred's Plumbing",
  heroHeading: "About Fred's Plumbing",
  heroParagraphs: [
    "Fred’s Plumbing is a trusted leader in multi-family and commercial emergency plumbing services across the DFW area. Family and employee owned for nearly 30 years, we operate 24/7, 365 days a year to keep properties running safely and efficiently. We are a one-stop shop offering a comprehensive suite of services, including traditional plumbing, drain and sewer solutions, hydrojetting, boilers, backflow prevention, and natural gas systems.",
    "Our licensed, credentialed team is experienced with all major vendor portals and property management requirements. Known for our professionalism, integrity, reliability, and strong safety culture, Fred’s Plumbing is highly reviewed and trusted by property owners and managers throughout DFW.",
  ],
  storyHeading: "Committed to Quality and Service Since 1996",
  storyParagraphs: [
    "Fred’s Plumbing was founded in 1996 by Fredrick Lee Press, a master plumber who built his reputation on integrity, reliable craftsmanship, and doing the job right the first time. Fred passed away in 2023, but the values he instilled — hard work, honest service, and a genuine commitment to his customers — continue to guide everything we do. Over the years, our company has grown through those same principles, earning the trust of property managers and owners across the DFW Metroplex.",
  ],
  storyPhotoSubjectPrimary:
    "A hydrojetting hose run at a DFW apartment property (ask the owner for their real photo)",
  storyPhotoSubjectSecondary:
    "A Fred's Plumbing technician at work in a mechanical room",
  evolutionHeading: "Evolving to Meet the Needs of a Growing Region",
  evolutionParagraphs: [
    // "Over time," is a reconstruction — the opening words were obscured by
    // an overlay in the source page. The owner must confirm the wording.
    "Over time, Fred’s Plumbing became known for providing dependable solutions to multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex. We developed expertise in complex plumbing systems, expanded our service offerings, and built long-lasting partnerships with property managers, facility owners, and residential communities.",
    "Today, our company continues to move forward with the same dedication that shaped our beginning. We embrace new technology, train our team to the highest standards, and work tirelessly to maintain the level of service that has defined us for nearly three decades. Our history reflects resilience, growth, and a commitment to excellence that guides everything we do.",
  ],
  evolutionPhotoSubject:
    "Commercial boiler and pipework at a multi-family property",
  valuesHeading: "What We Stand For",
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
  linksHeading: "Where to Next",
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
};
