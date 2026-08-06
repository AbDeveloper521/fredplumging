import type { CmsPhoto } from "./services";
import type {
  FinalCtaSection,
  IconCardSection,
  PropertyTypesSection,
  ServiceAboutSection,
  ServiceFaqSection,
  ServiceHeroSection,
  ServiceTestimonialsSection,
} from "./serviceSections";

/**
 * City ("Areas We Serve") page content as ordered section stacks — FALLBACK
 * for the slug-keyed `cityPage` documents (see `sanity/lib/getCityPage.ts`).
 * Same architecture as the service/About/Partners/Careers stacks: most bands
 * reuse the shared section library; only the communities band is
 * city-specific. Copy is transcribed from the owner's reference site —
 * typography normalized, claims untouched.
 *
 * Adding a city = one entry here + one route file that calls
 * `getCityPage("<slug>")`. Each city's copy must be written for that city —
 * never another city's text with the name swapped (search engines treat
 * near-duplicate city pages as doorway pages).
 *
 * The association badge strip and the Google-map band are NOT stack items:
 * the city template renders them after the stack, exactly as the service
 * pages do.
 */

interface SectionMeta<T extends string> {
  _type: T;
  _key: string;
  /** Hidden in Studio: content kept, section skipped at render. */
  hidden?: boolean;
}

/** "Proudly Serving …" band: copy, community pin chips, photo pair, CTA. */
export interface CityCommunitiesContent {
  heading: string;
  body: string;
  /** The client's own list of nearby communities — exactly as provided. */
  communities: string[];
  photoPrimary?: CmsPhoto;
  /** Intended photo subject — placeholder caption until a photo exists. */
  photoSubjectPrimary?: string;
  photoSecondary?: CmsPhoto;
  photoSubjectSecondary?: string;
  /** CTA button — set together or not at all (both-or-none). */
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * The city stack's accepted types: the shared service-library bands the
 * reference maps onto, the city-specific communities band, and the generic
 * library extras (Icon Card, FAQ, closing CTA) the owner may add in Studio.
 */
export type CitySection =
  | (ServiceHeroSection & { hidden?: boolean })
  | (ServiceAboutSection & { hidden?: boolean })
  | (PropertyTypesSection & { hidden?: boolean })
  | (ServiceTestimonialsSection & { hidden?: boolean })
  | (IconCardSection & { hidden?: boolean })
  | (ServiceFaqSection & { hidden?: boolean })
  | (FinalCtaSection & { hidden?: boolean })
  | (SectionMeta<"cityCommunities"> & CityCommunitiesContent);

export type CitySectionType = CitySection["_type"];

export interface CityPageContent {
  /** City name, e.g. "Dallas" — used in headings and metadata fallbacks. */
  city: string;
  /** URL slug under /areas-we-serve. */
  slug: string;
  /** The page, top to bottom — hero through communities. */
  sections: CitySection[];
  /** Optional per-page SEO overrides. */
  seoTitle?: string;
  seoDescription?: string;
}

/** The one place a city page's URL is derived from its slug. */
export function cityHref(slug: string): string {
  return `/areas-we-serve/${slug}`;
}

/** The hero intro paragraph — the metadata description fallback. */
export function cityHeroIntro(content: CityPageContent): string | undefined {
  const hero = content.sections.find(
    (section): section is Extract<CitySection, { _type: "serviceHero" }> =>
      section._type === "serviceHero",
  );
  return hero?.subheading;
}

export const cities: CityPageContent[] = [
  {
    city: "Dallas",
    slug: "dallas",
    sections: [
      {
        _type: "serviceHero",
        _key: "dallas-hero",
        eyebrow: "FRED'S PLUMBING",
        heading: "Plumbing Services in Dallas, Texas",
        subheading:
          "Fred's Plumbing provides dependable multi-family and commercial plumbing solutions throughout Dallas. Our team is known for fast response, professional service, and long-lasting results that support the needs of property managers and facility owners across the city.",
        credentials: [],
        photoSubject:
          "A Fred's Plumbing service truck with the Dallas skyline behind it",
      },
      {
        _type: "propertyTypes",
        _key: "dallas-services",
        heading: "Reliable Plumbing Services in Dallas",
        background: "offwhite",
        cards: [
          {
            _key: "dallas-plumbing",
            icon: "wrench",
            title: "Plumbing",
            blurb:
              "Full-service plumbing solutions for multi-family and commercial properties across Dallas–Fort Worth. We handle repairs, installations, replacements, and system upgrades with a focus on reliability, safety, and long-term performance.",
            href: "/services/plumbing",
            linkLabel: "Get Started",
            photoSubject:
              "A technician servicing plumbing in a Dallas multi-family building",
          },
          {
            _key: "dallas-drain-sewer",
            icon: "waves",
            title: "Drain & Sewer",
            blurb:
              "Professional drain cleaning, sewer inspections, and repairs using advanced hydro jetting and camera technology. Our team resolves blockages, backups, and damaged lines quickly to prevent disruptions and costly damage.",
            href: "/services/drain-sewer",
            linkLabel: "Get Started",
            photoSubject: "Hydro jetting a commercial drain line",
          },
          {
            _key: "dallas-specialty",
            icon: "cog",
            title: "Specialty Services",
            blurb:
              "Expert support for complex plumbing systems including boilers, backflow, and gas. Our technicians are trained to handle high-demand systems while maintaining compliance and efficiency.",
            href: "/services/specialty-services",
            linkLabel: "Get Started",
            photoSubject:
              "Boiler and backflow equipment in a commercial mechanical room",
          },
          {
            _key: "dallas-maintenance",
            icon: "calendar-check",
            title: "Maintenance",
            blurb:
              "Preventive maintenance programs designed to protect your plumbing systems, reduce emergency calls, and extend equipment life. Our preferred customer plans provide routine inspections, priority service, and consistent system care.",
            href: "/services/maintenance",
            linkLabel: "Get Started",
            photoSubject:
              "A technician on a scheduled maintenance inspection",
          },
          {
            _key: "dallas-emergency",
            icon: "siren",
            title: "Emergency Repairs",
            blurb:
              "Available 24/7 for burst pipes, leaks, and urgent repairs, we deliver immediate response when your tenants or facilities need it most.",
            href: "/services/emergency-plumbing",
            linkLabel: "Get Started",
            photoSubject:
              "A Fred's Plumbing truck responding to an emergency call",
          },
        ],
      },
      {
        _type: "serviceAbout",
        _key: "dallas-why",
        heading: "Why Choose Us in Dallas",
        paragraphs: [
          "Property managers across Dallas rely on Fred's Plumbing for consistent quality, fast response, and long-lasting results. Our team brings decades of experience to every project and uses advanced equipment to ensure accurate diagnostics and dependable repairs. We understand the demands placed on plumbing systems in high-occupancy environments, and we are committed to providing service that keeps your residents safe and your property operating smoothly.",
        ],
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
        background: "dark",
        photoSubjectPrimary:
          "A Fred's Plumbing technician diagnosing a plumbing system in a Dallas property",
      },
      {
        _type: "serviceTestimonials",
        _key: "dallas-reviews",
        heading: "What Our Clients Say",
        limit: 4,
      },
      {
        _type: "serviceAbout",
        _key: "dallas-heritage",
        heading: "Serving Dallas with Integrity and Expertise Since 1996",
        paragraphs: [
          "Fred's Plumbing has supported multi-family and commercial properties in Dallas for nearly three decades. Our team is committed to delivering safe, efficient, and reliable plumbing solutions that meet the needs of property managers, real estate investors, and facility owners.",
          "We combine experience, advanced tools, and a focus on long-term performance to ensure every project is handled with care. From emergency repairs to large-scale system upgrades, we are here to support your property with dependable service you can trust.",
        ],
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
        background: "dark",
        photoSubjectPrimary:
          "A Fred's Plumbing technician at work on a Dallas multi-family property",
      },
      {
        _type: "cityCommunities",
        _key: "dallas-communities",
        heading: "Proudly Serving Dallas and Surrounding Communities",
        body: "We support properties throughout Dallas and nearby areas including Highland Park, University Park, Richardson, Garland, Mesquite, Irving, and other surrounding neighborhoods. Wherever your property is located in the Dallas region, our team is ready to assist.",
        communities: [
          "Highland Park",
          "University Park",
          "Richardson",
          "Garland",
          "Mesquite",
          "Irving",
        ],
        photoSubjectPrimary: "The Dallas skyline",
        photoSubjectSecondary:
          "A Fred's Plumbing technician arriving at a Dallas property",
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
      },
    ],
    seoTitle: "Plumbing Services in Dallas, TX | Fred's Plumbing",
    seoDescription:
      "Multi-family and commercial plumbing in Dallas, TX — 24/7 emergency response, drain and sewer, preventive maintenance, and specialty systems from Fred's Plumbing.",
  },
  {
    city: "Fort Worth",
    slug: "fort-worth",
    sections: [
      {
        _type: "serviceHero",
        _key: "fort-worth-hero",
        eyebrow: "FRED'S PLUMBING",
        heading: "Plumbing Services in Fort Worth, Texas",
        subheading:
          "Fred's Plumbing provides professional plumbing solutions for multi-family and commercial properties throughout Fort Worth. Our experienced team delivers reliable service, high-quality workmanship, and efficient repairs that support the daily needs of property managers, owners, and residents across the city.",
        credentials: [],
        photoSubject:
          "A Fred's Plumbing service truck with the Fort Worth skyline behind it",
      },
      {
        _type: "propertyTypes",
        _key: "fort-worth-services",
        heading: "Reliable Plumbing Services in Fort Worth",
        background: "offwhite",
        cards: [
          {
            _key: "fort-worth-plumbing",
            icon: "wrench",
            title: "Plumbing",
            // Opening words were clipped in the owner's reference — "From routine
            // maintenance" is a reconstruction pending the owner's confirmation.
            blurb:
              "From routine maintenance to full system installations, our team handles all types of plumbing projects for commercial and multi-family buildings across DFW.",
            href: "/services/plumbing",
            linkLabel: "Get Started",
            photoSubject:
              "A technician servicing plumbing in a Fort Worth multi-family building",
          },
          {
            _key: "fort-worth-drain-sewer",
            icon: "waves",
            title: "Drain & Sewer",
            blurb:
              "We provide professional drain cleaning, hydro jetting, and sewer line repair to prevent backups and keep your property's systems flowing smoothly.",
            href: "/services/drain-sewer",
            linkLabel: "Get Started",
            photoSubject: "Hydro jetting a commercial drain line",
          },
          {
            _key: "fort-worth-specialty",
            icon: "cog",
            title: "Specialty Services",
            blurb:
              "Our expertise extends to boiler, backflow, gas, and advanced diagnostics for complex plumbing challenges.",
            href: "/services/specialty-services",
            linkLabel: "Get Started",
            photoSubject:
              "Boiler and backflow equipment in a commercial mechanical room",
          },
          {
            _key: "fort-worth-maintenance",
            icon: "calendar-check",
            title: "Maintenance",
            blurb:
              "Prevent costly downtime with scheduled maintenance plans designed to protect your infrastructure and ensure compliance with local codes.",
            href: "/services/maintenance",
            linkLabel: "Get Started",
            photoSubject:
              "A technician on a scheduled maintenance inspection",
          },
          {
            _key: "fort-worth-emergency",
            icon: "siren",
            title: "Emergency Repairs",
            blurb:
              "Available 24/7 for burst pipes, leaks, and urgent repairs, we deliver immediate response when your tenants or facilities need it most.",
            href: "/services/emergency-plumbing",
            linkLabel: "Get Started",
            photoSubject:
              "A Fred's Plumbing truck responding to an emergency call",
          },
        ],
      },
      {
        _type: "serviceAbout",
        _key: "fort-worth-why",
        heading: "Why Choose Us in Fort Worth",
        paragraphs: [
          "Property managers throughout Fort Worth trust Fred's Plumbing because we deliver fast service, clear communication, and long-lasting results. Our team has extensive experience with the plumbing needs of large buildings and uses advanced technology to ensure accurate diagnostics and efficient repairs. We focus on protecting your property, reducing downtime, and maintaining a safe environment for your residents.",
        ],
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
        background: "dark",
        photoSubjectPrimary:
          "A Fred's Plumbing technician diagnosing a plumbing system in a Fort Worth property",
      },
      {
        _type: "serviceTestimonials",
        _key: "fort-worth-reviews",
        heading: "What Our Clients Say",
        limit: 4,
      },
      {
        _type: "serviceAbout",
        _key: "fort-worth-heritage",
        heading: "Serving Fort Worth with Quality and Integrity Since 1996",
        paragraphs: [
          "Fred's Plumbing has delivered trusted plumbing solutions to the Fort Worth community for nearly thirty years. Our team understands the unique challenges of managing large-scale plumbing systems in high-occupancy properties and brings the knowledge needed to resolve issues quickly and correctly.",
          "We are committed to providing service that is safe, efficient, and built to last. Whether you need emergency repairs, preventive maintenance, or complex system support, we are here to serve your property with professionalism and care.",
        ],
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
        background: "dark",
        photoSubjectPrimary:
          "A Fred's Plumbing technician at work on a Fort Worth multi-family property",
      },
      {
        _type: "cityCommunities",
        _key: "fort-worth-communities",
        heading: "Proudly Serving Fort Worth and Surrounding Communities",
        body: "Our services extend throughout Fort Worth and into nearby areas including Arlington, North Richland Hills, Haltom City, Mansfield, Benbrook, and other surrounding neighborhoods. Wherever your property is located, our team is ready to assist with dependable plumbing service.",
        communities: [
          "Arlington",
          "North Richland Hills",
          "Haltom City",
          "Mansfield",
          "Benbrook",
        ],
        photoSubjectPrimary: "The Fort Worth skyline",
        photoSubjectSecondary:
          "A Fred's Plumbing technician arriving at a Fort Worth property",
        ctaLabel: "Contact Us",
        ctaHref: "/contact",
      },
    ],
    seoTitle: "Plumbing Services in Fort Worth, TX | Fred's Plumbing",
    seoDescription:
      "Multi-family and commercial plumbing in Fort Worth, TX — 24/7 emergency repairs, drain and sewer service, preventive maintenance, and specialty systems from Fred's Plumbing.",
  },
];
