import type { NavIconName } from "./navigation";

/** A resolved Sanity image: URL built server-side, alt from the CMS. */
export interface CmsPhoto {
  url: string;
  alt: string;
}

/**
 * Portable Text content as plain serializable JSON — rendered by
 * `components/ui/PortableBody.tsx`. Loosely typed on purpose: the schema in
 * `sanity/schemas/fields.ts` constrains what can actually appear.
 */
export type RichBody = Array<{ _type: string; _key: string } & Record<string, unknown>>;

/**
 * As of Sanity phase 3 these constants are the FALLBACK: read via
 * `getServices()` in `sanity/lib/getServices.ts`. Slugs drive live URLs at
 * /services/[slug] — every fallback slug matches a real route.
 */
export interface Service {
  title: string;
  slug: string;
  shortDescription: string;
  /** Optional rich detail-page content (Portable Text). */
  body?: RichBody;
  /** Optional per-page SEO overrides. */
  seoTitle?: string;
  seoDescription?: string;
  /** Expected photography subject — placeholder caption until a photo exists. */
  image: string;
  imageAlt: string;
  icon: NavIconName;
  featured?: boolean;
  /** Real photo uploaded in the Studio, resolved to a URL server-side. */
  photo?: CmsPhoto;
}

/** The one place a service's URL is derived from its slug. */
export function serviceHref(slug: string): string {
  return `/services/${slug}`;
}

export const services: Service[] = [
  {
    title: "Commercial Plumbing",
    slug: "commercial-plumbing",
    shortDescription:
      "Property-wide plumbing solutions for offices, apartments, facilities, and commercial buildings.",
    image: "/images/service-commercial-plumbing.webp",
    imageAlt:
      "Plumbing technician servicing a commercial mechanical room with large supply lines",
    icon: "building-2",
    featured: true,
  },
  {
    title: "Emergency Plumbing",
    slug: "emergency-plumbing",
    shortDescription:
      "Rapid response for leaks, clogs, backups, pipe failures, and urgent plumbing problems.",
    image: "/images/service-emergency.webp",
    imageAlt:
      "Technician responding to an urgent plumbing repair at a multi-family property",
    icon: "siren",
    featured: true,
  },
  {
    title: "Drain & Sewer",
    slug: "drain-sewer",
    shortDescription:
      "Professional cleaning, inspection, repair, and maintenance for drains and sewer systems.",
    image: "/images/service-drain-sewer.webp",
    imageAlt: "Sewer camera inspection equipment in use at a commercial property",
    icon: "waves",
  },
  {
    title: "Preventive Maintenance",
    slug: "maintenance",
    shortDescription:
      "Planned service programs that reduce downtime and help prevent expensive failures.",
    image: "/images/service-maintenance.webp",
    imageAlt:
      "Technician performing scheduled maintenance on a commercial water heater system",
    icon: "calendar-check",
  },
  {
    title: "Specialty Services",
    slug: "specialty-services",
    shortDescription:
      "Backflow testing, gas lines, hydro jetting, and facility-specific plumbing support.",
    image: "/images/service-specialty.webp",
    imageAlt: "Specialized commercial plumbing installation in a mechanical room",
    icon: "cog",
  },
  {
    title: "Plumbing Repairs",
    slug: "plumbing",
    shortDescription:
      "Repairs, replacements, and fixture work handled quickly and documented properly.",
    image: "/images/service-backflow.webp",
    imageAlt: "Certified technician repairing commercial plumbing fixtures",
    icon: "wrench",
  },
  {
    title: "Senior Care Facilities",
    slug: "senior-care-facilities",
    shortDescription:
      "Low-disruption plumbing work in occupied assisted living and senior care settings.",
    image: "/images/technician-working.webp",
    imageAlt: "Technician working quietly in an occupied senior living facility",
    icon: "heart-pulse",
  },
  {
    title: "Student Housing",
    slug: "student-housing",
    shortDescription:
      "Turn-season capacity, fast turnarounds, and dependable emergency coverage.",
    image: "/images/multifamily-property.webp",
    imageAlt: "Student housing community near a university campus",
    icon: "graduation-cap",
  },
];
