/**
 * Business facts. As of Sanity phase 1 these constants are the FALLBACK:
 * server components should read via `getSite()` in `sanity/lib/getSite.ts`,
 * which sources the `siteSettings` singleton from Sanity and falls back to
 * these values if the fetch fails or returns incomplete data.
 */
export interface Site {
  name: string;
  legalName: string;
  tagline: string;
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  serviceArea: string;
  foundedYear: number;
  /**
   * OPTIONAL manual override for the displayed years-in-business. When
   * unset (the default), the value is DERIVED from `foundedYear` at render
   * time in `getSite()` so it can never quietly age the way the old
   * hardcoded "27+" did.
   */
  yearsInBusiness?: string;
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
  foundedYear: 1996,
  // yearsInBusiness deliberately unset — derived from foundedYear.
  /** Placeholder — replace with the production domain before launch. */
  url: "https://www.fredsplumbingdfw.com",
  licenseNumber: "RMP 44890",
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
