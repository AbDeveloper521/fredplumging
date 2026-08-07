import type { MetadataRoute } from "next";
import { getSite } from "@/sanity/lib/getSite";
import { getServices } from "@/sanity/lib/getServices";
import { getIndustries } from "@/sanity/lib/getIndustries";
import { serviceHref } from "@/data/services";
import { industryHref } from "@/data/industries";

/** Static marketing routes (everything not driven by a CMS slug). */
const STATIC_PATHS = [
  "/",
  "/about",
  "/about/careers",
  "/about/partners",
  "/about/testimonials",
  "/areas-we-serve",
  "/areas-we-serve/dallas",
  "/areas-we-serve/fort-worth",
  "/contact",
  "/multifamily",
  "/services",
];

/**
 * Indexable but not competing for attention — listed so the legal pages are
 * discoverable, at a priority that says "boilerplate, not a landing page".
 */
const LEGAL_PATHS = ["/privacy-policy", "/terms-of-service"];

/**
 * Sitemap sourced from the same fetchers the pages render from, so every
 * published CMS slug (services + property types) is always listed — a page
 * not in the sitemap is not finished.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, services, industries] = await Promise.all([
    getSite(),
    getServices(),
    getIndustries(),
  ]);

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.6,
  }));

  const serviceEntries = services.map((service) => ({
    url: `${site.url}${serviceHref(service.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const industryEntries = industries.map((industry) => ({
    url: `${site.url}${industryHref(industry.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const legalEntries = LEGAL_PATHS.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "yearly" as const,
    priority: 0.2,
  }));

  return [
    ...staticEntries,
    ...serviceEntries,
    ...industryEntries,
    ...legalEntries,
  ];
}
