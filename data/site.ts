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
  yearsInBusiness: string;
  url: string;
}

/** `Site` plus the city list — the full shape of the Sanity singleton. */
export interface SiteContent extends Site {
  serviceAreaCities: readonly string[];
}

export const site: Site = {
  name: "Fred's Plumbing",
  legalName: "Fred's Plumbing Company",
  tagline: "Commercial & Multi-Family Plumbing — Dallas–Fort Worth",
  phone: "972-564-9081",
  phoneHref: "tel:+19725649081",
  email: "service@fredsplumbingdfw.com",
  emailHref: "mailto:service@fredsplumbingdfw.com",
  serviceArea: "Dallas–Fort Worth Metroplex",
  foundedYear: 1996,
  yearsInBusiness: "27+",
  /** Placeholder — replace with the production domain before launch. */
  url: "https://www.fredsplumbingdfw.com",
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
