import { SITE_URL } from "@/lib/siteUrl";

/**
 * Business facts. As of Sanity phase 1 these constants are the FALLBACK:
 * server components should read via `getSite()` in `sanity/lib/getSite.ts`,
 * which sources the `siteSettings` singleton from Sanity and falls back to
 * these values if the fetch fails or returns incomplete data.
 */
/** One line of the opening-hours list, e.g. "Monday – Friday" / "7 AM – 6 PM". */
export interface BusinessHoursRow {
  days: string;
  hours: string;
}

export interface Site {
  name: string;
  legalName: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  serviceArea: string;
  /**
   * Opening hours, shown wherever the site lists contact details (today: the
   * details column beside the /contact form). A business fact, so it lives
   * HERE with the phone and email rather than on a page section — the site
   * has already had one three-way email/domain inconsistency, and hours
   * retyped per page would be the next one.
   */
  hours: BusinessHoursRow[];
  foundedYear: number;
  /**
   * OPTIONAL manual override for the displayed years-in-business. When
   * unset (the default), the value is DERIVED from `foundedYear` at render
   * time in `getSite()` so it can never quietly age the way the old
   * hardcoded "27+" did.
   */
  yearsInBusiness?: string;
  /**
   * The public origin, from `SITE_URL` (lib/siteUrl.ts) — environment-driven
   * and NOT sourced from Sanity: which domain serves the site is a deployment
   * fact, not editorial copy.
   */
  url: string;
  /** State plumbing licence as shown on the client's own site footer. */
  licenseNumber: string;
  /**
   * Business street address — UNSET until the client supplies one. Required
   * (with per-role dates) before JobPosting structured data can be emitted.
   */
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  /**
   * Public social profiles. Optional: an unset URL hides that icon in the
   * footer rather than linking somewhere dead — the placeholder hrefs these
   * replaced pointed at facebook.com / linkedin.com themselves, so every
   * click left the site for a platform homepage. Also emitted as schema.org
   * `sameAs` (components/seo/JsonLd.tsx), which is how search engines tie
   * these profiles to the business entity.
   */
  facebookUrl?: string;
  linkedinUrl?: string;
  /** Heading for the shared Google-map band (homepage + service pages). */
  mapHeading: string;
  /** One supporting line under the map-band heading. */
  mapDescription: string;
  /**
   * Google Maps embed URL (https://www.google.com/maps/embed?pb=…). No API
   * key, nothing billed. Empty → the map band hides site-wide.
   */
  mapEmbedUrl: string;
}

/**
 * `Site` plus the city list — the full shape of the Sanity singleton, with
 * `yearsInBusiness` always resolved (override or derived) by `getSite()`.
 */
export interface SiteContent extends Site {
  serviceAreaCities: readonly string[];
  yearsInBusiness: string;
}

export const site: Site = {
  name: "Fred's Plumbing",
  legalName: "Fred's Plumbing Company",
  tagline: "Commercial & Multi-Family Plumbing — Dallas–Fort Worth",
  phone: "972-564-9081",
  phoneHref: "tel:+19725649081",
  email: "contact@fredsplumbing.com",
  emailHref: "mailto:contact@fredsplumbing.com",
  serviceArea: "Dallas–Fort Worth Metroplex",
  // Verbatim from the hand-built /contact details column this replaces.
  hours: [
    { days: "Monday – Friday", hours: "7:00 AM – 6:00 PM" },
    { days: "Emergencies", hours: "24/7, every day of the year" },
  ],
  foundedYear: 1996,
  // yearsInBusiness deliberately unset — derived from foundedYear.
  url: SITE_URL,
  licenseNumber: "RMP 44890",
  facebookUrl: "https://www.facebook.com/fredsplumbingtx/",
  linkedinUrl: "https://www.linkedin.com/company/fred-s-plumbing1996/",
  mapHeading: "Serving the Dallas–Fort Worth Metroplex",
  mapDescription:
    "Commercial and multi-family plumbing teams dispatched across DFW, 24/7.",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1718285.9085962924!2d-98.28338183041127!3d32.738469352465685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d28a9a9242e61cb%3A0x10c8773cb4095848!2sFred's%20Plumbing!5e0!3m2!1sen!2s!4v1785511031920!5m2!1sen!2s",
};

export const serviceAreaCities: readonly string[] = [
  "Dallas",
  "Fort Worth",
  "Arlington",
  "Irving",
  "Plano",
  "Frisco",
  "Grapevine",
  "Grand Prairie",
  "McKinney",
  "Richardson",
];
