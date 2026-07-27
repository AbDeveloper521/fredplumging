import type { CmsPhoto, RichBody } from "./services";

/**
 * As of Sanity phase 3 these constants are the FALLBACK: read via
 * `getIndustries()` in `sanity/lib/getIndustries.ts`. Slugs drive live URLs
 * at /multifamily/[slug] — every fallback slug matches a real route, so the
 * homepage industry cards can never point at a page that doesn't exist.
 */
export interface Industry {
  title: string;
  slug: string;
  description: string;
  /** Expected photography subject — placeholder caption until a photo exists. */
  image: string;
  imageAlt: string;
  bulletPoints: string[];
  /** Real photo uploaded in the Studio, resolved to a URL server-side. */
  photo?: CmsPhoto;
  /** Optional rich detail-page content (Portable Text). */
  body?: RichBody;
  /** Optional per-page SEO overrides. */
  seoTitle?: string;
  seoDescription?: string;
}

/** The one place an industry's URL is derived from its slug. */
export function industryHref(slug: string): string {
  return `/multifamily/${slug}`;
}

export const industries: Industry[] = [
  {
    title: "Apartment Communities",
    slug: "apartments",
    description:
      "Responsive plumbing support for occupied apartment communities, including emergencies, unit repairs, common-area systems, preventive maintenance, and capital improvement projects.",
    image: "/images/multifamily-property.webp",
    imageAlt: "Modern multi-family apartment community in Dallas–Fort Worth",
    bulletPoints: [
      "Unit-level service",
      "Common-area plumbing",
      "Emergency response",
      "Turnover repairs",
      "Preventive maintenance",
    ],
  },
  {
    title: "Condominiums",
    slug: "condos",
    description:
      "Plumbing service designed for condominium associations and management companies — shared systems, individual units, and clear coordination with boards and residents.",
    image: "/images/dallas-property.webp",
    imageAlt: "Mid-rise condominium building with landscaped entrance",
    bulletPoints: [
      "HOA and board coordination",
      "Shared-system expertise",
      "Unit and common-area repairs",
      "Scheduled maintenance",
      "Documented service records",
    ],
  },
  {
    title: "Assisted Living",
    slug: "assisted-living",
    description:
      "Careful, low-disruption plumbing service for assisted living communities, where resident comfort, safety, and reliability come first.",
    image: "/images/technician-working.webp",
    imageAlt: "Technician working quietly in an occupied senior living facility",
    bulletPoints: [
      "Low-disruption scheduling",
      "Background-checked technicians",
      "Water temperature and safety systems",
      "Rapid emergency response",
      "Ongoing maintenance programs",
    ],
  },
  {
    title: "Nursing Homes",
    slug: "nursing-homes",
    description:
      "Code-compliant plumbing for 24/7 care settings — planned around care schedules, documented for compliance, and backed by around-the-clock emergency coverage.",
    image: "/images/technician-working.webp",
    imageAlt: "Technician coordinating scheduled work with nursing home staff",
    bulletPoints: [
      "Code-compliant workmanship",
      "Care-schedule coordination",
      "Water temperature and safety systems",
      "24/7 emergency coverage",
      "Compliance documentation",
    ],
  },
];
