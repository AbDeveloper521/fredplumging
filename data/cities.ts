import type { NavIconName } from "./navigation";
import type { CmsPhoto } from "./services";

/**
 * City ("Areas We Serve") page content. As of the cityPage schema these
 * constants are the FALLBACK: pages read via `getCityPage(slug)` in
 * `sanity/lib/getCityPage.ts`. Copy is transcribed from the owner's
 * reference site — typography normalized, claims untouched.
 *
 * Adding a city = one entry here + one route file that calls
 * `getCityPage("<slug>")`. Each city's copy must be written for that city —
 * never another city's text with the name swapped.
 */

export interface CityServiceCard {
  _key: string;
  title: string;
  description: string;
  /** Path of the matching existing service page, e.g. /services/plumbing. */
  href: string;
  icon: NavIconName;
}

export interface CityPageContent {
  /** City name, e.g. "Dallas" — used in headings and metadata fallbacks. */
  city: string;
  /** URL slug under /areas-we-serve. */
  slug: string;
  heroHeading: string;
  heroIntro: string;
  servicesHeading?: string;
  serviceCards: CityServiceCard[];
  whyChooseHeading?: string;
  whyChooseBody?: string;
  reviewsHeading: string;
  heritageHeading?: string;
  heritageParagraphs: string[];
  /** Real photo uploaded in the Studio, resolved to a URL server-side. */
  heritagePhoto?: CmsPhoto;
  /** Intended photo subject — placeholder caption until a photo exists. */
  heritagePhotoSubject?: string;
  communitiesHeading?: string;
  communitiesBody?: string;
  /** The client's own list of nearby communities — exactly as provided. */
  communities: string[];
  showLogoStrip: boolean;
  /** Optional per-page SEO overrides. */
  seoTitle?: string;
  seoDescription?: string;
}

/** The one place a city page's URL is derived from its slug. */
export function cityHref(slug: string): string {
  return `/areas-we-serve/${slug}`;
}

export const cities: CityPageContent[] = [
  {
    city: "Dallas",
    slug: "dallas",
    heroHeading: "Plumbing Services in Dallas, Texas",
    heroIntro:
      "Fred's Plumbing provides dependable multi-family and commercial plumbing solutions throughout Dallas. Our team is known for fast response, professional service, and long-lasting results that support the needs of property managers and facility owners across the city.",
    servicesHeading: "Reliable Plumbing Services in Dallas",
    serviceCards: [
      {
        _key: "dallas-plumbing",
        title: "Plumbing",
        description:
          "Full-service plumbing solutions for multi-family and commercial properties across Dallas–Fort Worth. We handle repairs, installations, replacements, and system upgrades with a focus on reliability, safety, and long-term performance.",
        href: "/services/plumbing",
        icon: "wrench",
      },
      {
        _key: "dallas-drain-sewer",
        title: "Drain & Sewer",
        description:
          "Professional drain cleaning, sewer inspections, and repairs using advanced hydro jetting and camera technology. Our team resolves blockages, backups, and damaged lines quickly to prevent disruptions and costly damage.",
        href: "/services/drain-sewer",
        icon: "waves",
      },
      {
        _key: "dallas-specialty",
        title: "Specialty Services",
        description:
          "Expert support for complex plumbing systems including boilers, backflow, and gas. Our technicians are trained to handle high-demand systems while maintaining compliance and efficiency.",
        href: "/services/specialty-services",
        icon: "cog",
      },
      {
        _key: "dallas-maintenance",
        title: "Maintenance",
        description:
          "Preventive maintenance programs designed to protect your plumbing systems, reduce emergency calls, and extend equipment life. Our preferred customer plans provide routine inspections, priority service, and consistent system care.",
        href: "/services/maintenance",
        icon: "calendar-check",
      },
      {
        _key: "dallas-emergency",
        title: "Emergency Repairs",
        description:
          "Available 24/7 for burst pipes, leaks, and urgent repairs, we deliver immediate response when your tenants or facilities need it most.",
        href: "/services/emergency-plumbing",
        icon: "siren",
      },
    ],
    whyChooseHeading: "Why Choose Us in Dallas",
    whyChooseBody:
      "Property managers across Dallas rely on Fred's Plumbing for consistent quality, fast response, and long-lasting results. Our team brings decades of experience to every project and uses advanced equipment to ensure accurate diagnostics and dependable repairs. We understand the demands placed on plumbing systems in high-occupancy environments, and we are committed to providing service that keeps your residents safe and your property operating smoothly.",
    reviewsHeading: "What Our Clients Say",
    heritageHeading: "Serving Dallas with Integrity and Expertise Since 1996",
    heritageParagraphs: [
      "Fred's Plumbing has supported multi-family and commercial properties in Dallas for nearly three decades. Our team is committed to delivering safe, efficient, and reliable plumbing solutions that meet the needs of property managers, real estate investors, and facility owners.",
      "We combine experience, advanced tools, and a focus on long-term performance to ensure every project is handled with care. From emergency repairs to large-scale system upgrades, we are here to support your property with dependable service you can trust.",
    ],
    heritagePhotoSubject:
      "A Fred's Plumbing technician at work on a Dallas multi-family property",
    communitiesHeading: "Proudly Serving Dallas and Surrounding Communities",
    communitiesBody:
      "We support properties throughout Dallas and nearby areas including Highland Park, University Park, Richardson, Garland, Mesquite, Irving, and other surrounding neighborhoods. Wherever your property is located in the Dallas region, our team is ready to assist.",
    communities: [
      "Highland Park",
      "University Park",
      "Richardson",
      "Garland",
      "Mesquite",
      "Irving",
    ],
    showLogoStrip: true,
    seoTitle: "Plumbing Services in Dallas, TX | Fred's Plumbing",
    seoDescription:
      "Multi-family and commercial plumbing in Dallas, TX — 24/7 emergency response, drain and sewer, preventive maintenance, and specialty systems from Fred's Plumbing.",
  },
];
