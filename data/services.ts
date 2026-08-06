import type { NavIconName } from "./navigation";
import type { LibrarySection } from "./sectionLibrary";

/** A resolved Sanity image: URL built server-side, alt from the CMS. */
export interface CmsPhoto {
  url: string;
  alt: string;
  /**
   * Width/height ratio the URL was cropped to (design ratio or the editor's
   * "Frame shape" override) — components size the frame from it via CSS
   * `aspect-ratio`. Absent when the URL is uncropped (`fit=max`).
   */
  ratio?: number;
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
  /**
   * Optional ordered section stack from the constrained section library.
   * When present the detail page renders these instead of `body`.
   */
  sections?: LibrarySection[];
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
    // The owner's reference layout, band for band, copy verbatim — the
    // template that scripts/apply-simple-service-template.ts writes to the
    // live `service-plumbing` document (carrying its uploaded photos).
    sections: [
      {
        _type: "serviceHero",
        _key: "tpl-hero",
        eyebrow: "FRED'S PLUMBING",
        heading: "Plumbing Services in the Dallas–Fort Worth Metroplex",
        subheading:
          "Fred's Plumbing provides high-quality plumbing solutions for multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex. From complex system installations to routine repairs, our licensed plumbers deliver precise, reliable work that keeps your property running smoothly.",
        credentials: [],
        photoSubject:
          "A Fred's Plumbing technician at work in a commercial mechanical room",
      },
      {
        _type: "serviceAbout",
        _key: "tpl-about",
        heading: "About Our Plumbing Services",
        paragraphs: [
          "Since 1996, Fred's Plumbing has been trusted by property managers, facility owners, and investors throughout the Dallas–Fort Worth Metroplex. Our technicians are fully licensed, insured, and trained to meet the highest safety and quality standards.",
          "We handle every aspect of plumbing repair and installation for large-scale residential and commercial buildings. Whether replacing pipes, repairing leaks, or upgrading outdated systems, we use advanced tools and proven methods to deliver long-lasting performance.",
        ],
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
        photoSubjectPrimary: "A Fred's Plumbing technician on the job",
      },
      {
        _type: "propertyTypes",
        _key: "tpl-cards",
        background: "offwhite",
        cards: [
          {
            _key: "tpl-card-slab",
            icon: "droplets",
            title: "Slab Leak Repair",
            blurb:
              "Our advanced leak detection and repair techniques prevent structural damage and save you from costly water loss beneath concrete foundations.",
            // No slab-leak page exists — flagged in the migration report.
            href: "/contact",
            linkLabel: "Get Started",
            photoSubject:
              "Leak-detection equipment in use over a concrete slab foundation",
          },
          {
            _key: "tpl-card-piping",
            icon: "wrench",
            title: "Piping Services",
            blurb:
              "From copper to PEX systems, our team repairs, replaces and installs plumbing pipes for projects across DFW.",
            // No piping-services page exists — flagged in the migration report.
            href: "/contact",
            linkLabel: "Get Started",
            photoSubject:
              "New copper and PEX supply lines installed in a commercial building",
          },
          {
            _key: "tpl-card-installs",
            icon: "building-2",
            title: "Commercial Installs & Replacements",
            blurb:
              "We handle plumbing equipment installations and replacements for multi-unit buildings, offices, and commercial properties, providing efficient, code-compliant service every time.",
            href: "/services/commercial-plumbing",
            linkLabel: "Get Started",
            photoSubject:
              "Technicians installing commercial plumbing equipment in a mechanical room",
          },
        ],
      },
      {
        _type: "serviceTrust",
        _key: "tpl-trust",
        heading: "Trusted Plumbing Professionals Across the DFW Metroplex",
        items: [
          {
            _key: "tpl-trust-experience",
            icon: "award",
            title: "Proven Experience",
            description:
              "Over 30 years of delivering reliable plumbing solutions to commercial and multi-family properties across Dallas and Fort Worth.",
          },
          {
            _key: "tpl-trust-response",
            icon: "clock",
            title: "Fast Response Times",
            description:
              "Our 24/7 emergency service ensures you get immediate help whenever you need it.",
          },
          {
            _key: "tpl-trust-technology",
            icon: "cog",
            title: "Advanced Technology",
            description:
              "We use modern equipment for diagnostics, leak detection, and repairs to ensure precision and minimize disruption.",
          },
        ],
      },
      {
        _type: "serviceTestimonials",
        _key: "tpl-reviews",
        heading: "What Our Clients Say",
        filterTags: ["plumbing"],
        limit: 4,
      },
      {
        _type: "serviceAbout",
        _key: "tpl-heritage",
        heading:
          "Trusted Commercial Plumbers Serving the DFW Metroplex Since 1996",
        paragraphs: [
          "Founded in 1996, Fred's Plumbing has built a reputation for professionalism, reliability, and precision workmanship. We specialize in providing plumbing services for property management companies, facility owners, and real estate investors who value fast, dependable results.",
          "By combining advanced techniques with top-quality materials, we deliver plumbing systems that meet the demands of high-occupancy properties and complex infrastructure. Every project reflects our dedication to safety, efficiency, and lasting performance.",
        ],
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
        background: "dark",
        photoSubjectPrimary:
          "The Fred's Plumbing crew wrapping up a commercial project",
      },
      {
        _type: "serviceArea",
        _key: "tpl-area",
        heading: "Proudly Serving the Entire Dallas–Fort Worth Metroplex",
        body: "Fred's Plumbing serves commercial and multi-family clients across Dallas, Fort Worth, Arlington, Irving, Plano, Garland, Grand Prairie, and surrounding areas. Wherever you manage property in North Texas, our experienced team is ready to help.",
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
        photoSubject: "Dallas or Fort Worth skyline at dusk",
      },
      {
        _type: "trustLogoStrip",
        _key: "tpl-badges",
      },
    ],
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
