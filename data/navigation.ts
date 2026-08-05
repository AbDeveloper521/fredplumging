/**
 * Single source of truth for the site's primary navigation.
 *
 * The types below intentionally mirror a Sanity document (`_key` on every
 * array member, `layout` as a field rather than a hardcoded per-label rule)
 * so the CMS swap is a change to `getNavigation()` only — no component edits.
 *
 * Components must consume `getNavigation()`, never `STATIC_NAVIGATION`.
 */

/**
 * Icon tokens shared by navigation AND service cards — strings
 * (CMS-serializable, safe to pass across the Server→Client boundary)
 * resolved to lucide icons by the registry in
 * `components/layout/navIcons.ts`. The runtime array exists so Sanity
 * schemas and the fetch layer can validate icon values. This is the single
 * icon system for all CMS content — do not add another.
 */
export const NAV_ICON_NAMES = [
  "shield-check",
  "wrench",
  "cog",
  "siren",
  "waves",
  "calendar-check",
  "building-2",
  "heart-pulse",
  "graduation-cap",
  "building",
  "hotel",
  "heart-handshake",
  "stethoscope",
  "map-pin",
  "clock",
  "clock-4",
  "droplets",
  "flame",
  "gauge",
  "award",
  "truck",
  "message-square",
  "clipboard-check",
  "clipboard-list",
  "phone-call",
  "search-check",
  "file-check-2",
  "alert-triangle",
  "lightbulb",
  "trending-up",
  "users",
] as const;

export type NavIconName = (typeof NAV_ICON_NAMES)[number];

export type NavLink = {
  _key: string;
  label: string;
  href: string;
  /** Optional supporting copy, rendered in mega-menu panels. */
  description?: string;
  /** Optional icon token, rendered in mega panels and the mobile accordion. */
  icon?: NavIconName;
};

export type NavGroup = {
  _key: string;
  label: string;
  href: string;
  /** Panel shape: `mega` renders two columns, `list` a single column. */
  layout: "mega" | "list";
  /** When true, the panel also lists `serviceAreaCities` from `data/site.ts`. */
  showServiceAreaCities?: boolean;
  children: NavLink[];
};

export type Navigation = {
  items: NavGroup[];
  cta: { label: string; href: string };
};

const STATIC_NAVIGATION: Navigation = {
  items: [
    {
      _key: "about",
      label: "About Us",
      href: "/about",
      layout: "list",
      children: [
        { _key: "about-partners", label: "Partners", href: "/about/partners" },
        {
          _key: "about-testimonials",
          label: "Testimonials",
          href: "/about/testimonials",
        },
        { _key: "about-careers", label: "Careers", href: "/about/careers" },
      ],
    },
    {
      _key: "services",
      label: "Services",
      href: "/services",
      layout: "mega",
      children: [
        {
          _key: "services-plumbing",
          label: "Plumbing",
          href: "/services/plumbing",
          description: "Repairs, replacements, and fixture work.",
          icon: "wrench",
        },
        {
          _key: "services-specialty",
          label: "Specialty Services",
          href: "/services/specialty-services",
          description: "Backflow, gas lines, and hydro jetting.",
          icon: "cog",
        },
        {
          _key: "services-emergency",
          label: "Emergency Plumbing",
          href: "/services/emergency-plumbing",
          description: "24/7 response across the Metroplex.",
          icon: "siren",
        },
        {
          _key: "services-drain-sewer",
          label: "Drain & Sewer",
          href: "/services/drain-sewer",
          description: "Camera inspection, cleaning, and repair.",
          icon: "waves",
        },
        {
          _key: "services-maintenance",
          label: "Maintenance",
          href: "/services/maintenance",
          description: "Scheduled preventive programs.",
          icon: "calendar-check",
        },
        {
          _key: "services-commercial",
          label: "Commercial Plumbing",
          href: "/services/commercial-plumbing",
          description: "Retail, office, and industrial properties.",
          icon: "building-2",
        },
        {
          _key: "services-senior-care",
          label: "Senior Care Facilities",
          href: "/services/senior-care-facilities",
          description: "Low-disruption work in occupied care settings.",
          icon: "heart-pulse",
        },
        {
          _key: "services-student-housing",
          label: "Student Housing",
          href: "/services/student-housing",
          description: "Turn-season capacity and fast turnarounds.",
          icon: "graduation-cap",
        },
      ],
    },
    {
      _key: "areas-we-serve",
      label: "Areas We Serve",
      href: "/areas-we-serve",
      layout: "list",
      showServiceAreaCities: true,
      children: [
        {
          _key: "areas-dallas",
          label: "Dallas",
          href: "/areas-we-serve/dallas",
          description: "Response teams across Dallas County.",
          icon: "map-pin",
        },
        {
          _key: "areas-fort-worth",
          label: "Fort Worth",
          href: "/areas-we-serve/fort-worth",
          description: "Coverage throughout Tarrant County.",
          icon: "map-pin",
        },
      ],
    },
    {
      _key: "multifamily",
      label: "Multifamily",
      href: "/multifamily",
      layout: "mega",
      children: [
        {
          _key: "multifamily-apartments",
          label: "Apartments",
          href: "/multifamily/apartments",
          description: "Unit turns, risers, and property-wide repairs.",
          icon: "building",
        },
        {
          _key: "multifamily-condos",
          label: "Condos",
          href: "/multifamily/condos",
          description: "HOA-coordinated work on shared systems.",
          icon: "hotel",
        },
        {
          _key: "multifamily-assisted-living",
          label: "Assisted Living",
          href: "/multifamily/assisted-living",
          description: "Quiet, scheduled service around residents.",
          icon: "heart-handshake",
        },
        {
          _key: "multifamily-nursing-homes",
          label: "Nursing Homes",
          href: "/multifamily/nursing-homes",
          description: "Code-compliant work in 24/7 care settings.",
          icon: "stethoscope",
        },
      ],
    },
  ],
  cta: { label: "Request Service", href: "/contact" },
};

/**
 * As of Sanity phase 2, `STATIC_NAVIGATION` is the FALLBACK. Components must
 * consume `getNavigation()` from `sanity/lib/getNavigation.ts`, which sources
 * the `navigation` singleton from Sanity and falls back to this constant.
 * (The fetcher can't live here: client components import values from this
 * module, and a Sanity import would leak server code into their bundle.)
 */
export { STATIC_NAVIGATION };

export type FooterLink = {
  _key: string;
  label: string;
  href: string;
};

export type FooterColumn = {
  _key: string;
  heading: string;
  links: FooterLink[];
};

export type FooterNavigation = {
  columns: FooterColumn[];
  legal: FooterLink[];
};

/**
 * Footer fallback — read via `getFooterNavigation()` in
 * `sanity/lib/getFooterNavigation.ts` (stored on the `navigation` singleton).
 */
export const STATIC_FOOTER_NAVIGATION: FooterNavigation = {
  columns: [
    {
      _key: "footer-services",
      heading: "Services",
      links: [
        { _key: "f-plumbing", label: "Plumbing", href: "/services/plumbing" },
        { _key: "f-emergency", label: "Emergency Plumbing", href: "/services/emergency-plumbing" },
        { _key: "f-drain", label: "Drain & Sewer", href: "/services/drain-sewer" },
        { _key: "f-maintenance", label: "Maintenance", href: "/services/maintenance" },
        { _key: "f-commercial", label: "Commercial Plumbing", href: "/services/commercial-plumbing" },
        { _key: "f-specialty", label: "Specialty Services", href: "/services/specialty-services" },
      ],
    },
    {
      _key: "footer-industries",
      heading: "Industries",
      links: [
        { _key: "f-apartments", label: "Apartments", href: "/multifamily/apartments" },
        { _key: "f-condos", label: "Condos", href: "/multifamily/condos" },
        { _key: "f-assisted", label: "Assisted Living", href: "/multifamily/assisted-living" },
        { _key: "f-nursing", label: "Nursing Homes", href: "/multifamily/nursing-homes" },
        { _key: "f-senior", label: "Senior Care Facilities", href: "/services/senior-care-facilities" },
      ],
    },
    {
      _key: "footer-company",
      heading: "Company",
      links: [
        { _key: "f-about", label: "About Us", href: "/about" },
        { _key: "f-areas", label: "Areas We Serve", href: "/areas-we-serve" },
        { _key: "f-testimonials", label: "Testimonials", href: "/about/testimonials" },
        { _key: "f-careers", label: "Careers", href: "/about/careers" },
        { _key: "f-contact", label: "Contact", href: "/contact" },
      ],
    },
  ],
  legal: [
    { _key: "f-privacy", label: "Privacy Policy", href: "/privacy-policy" },
    { _key: "f-terms", label: "Terms of Service", href: "/terms-of-service" },
    { _key: "f-accessibility", label: "Accessibility", href: "/accessibility" },
  ],
};

export type TrustLogoCategory =
  | "vendor-portal"
  | "compliance-network"
  | "association"
  | "credential";

export const TRUST_LOGO_CATEGORIES: readonly TrustLogoCategory[] = [
  "vendor-portal",
  "compliance-network",
  "association",
  "credential",
];

/**
 * Categories that appear in the association/certification badge strip on
 * every service page (components/sections/AssociationBadgeStrip.tsx).
 * Uploading a Trust Logo in Studio with one of these categories is ALL it
 * takes — no per-page editing. Vendor platforms stay out: those belong to
 * the grayscale tile strips (TrustBar / compliance band).
 */
export const ASSOCIATION_BADGE_CATEGORIES: readonly TrustLogoCategory[] = [
  "association",
  "credential",
];

/**
 * The complement — vendor-platform categories shown in the grayscale tile
 * strips. DERIVED, so the two sets partition TRUST_LOGO_CATEGORIES by
 * construction: no overlap, no orphan, and a category added later lands
 * here (the vendor strips) until deliberately moved to the badge list.
 */
export const VENDOR_PLATFORM_CATEGORIES: readonly TrustLogoCategory[] =
  TRUST_LOGO_CATEGORIES.filter(
    (category) => !ASSOCIATION_BADGE_CATEGORIES.includes(category),
  );

/**
 * Vendor tile strips (TrustBar, compliance band, service/city tile rows).
 * Uncategorised legacy documents count as vendor so nothing published
 * before the category split silently vanishes from where it shows today.
 */
export function vendorPlatformLogos(logos: TrustLogo[]): TrustLogo[] {
  return logos.filter(
    (logo) =>
      logo.category === undefined ||
      VENDOR_PLATFORM_CATEGORIES.includes(logo.category),
  );
}

/** Service-page credentials strip — explicit badge categories only. */
export function associationBadgeLogos(logos: TrustLogo[]): TrustLogo[] {
  return logos.filter(
    (logo) =>
      logo.category !== undefined &&
      ASSOCIATION_BADGE_CATEGORIES.includes(logo.category),
  );
}

/** One factual line above the badge strip; edit here, not in the component. */
export const ASSOCIATION_STRIP_HEADING = "Licensed, certified, and affiliated";

export interface TrustLogo {
  name: string;
  /** Real logo image resolved server-side; falls back to a styled wordmark. */
  photo?: { url: string; alt: string };
  /** Card heading on /about/partners; falls back to "Approved vendor on {name}". */
  headline?: string;
  /**
   * The paragraph on /about/partners. THE SWITCH: an entry with a blurb gets
   * a full partner card there; without one it appears only in the logo strips.
   */
  blurb?: string;
  /** Grouping + pill label on the partner card. */
  category?: TrustLogoCategory;
  /** Outbound link to the client's public vendor profile, when one exists. */
  url?: string;
  /** Drives the "verified" pill on the partner card. */
  verified?: boolean;
}

/**
 * Trust-logo fallback — read via `getTrustLogos()` in
 * `sanity/lib/getTrustLogos.ts`. Vendor systems and associations shown in
 * the trust bar and compliance strip; entries WITH a `blurb` also get a full
 * card on /about/partners. Blurb copy is the client's own marketing text,
 * transcribed from their live site (typography normalized, claims untouched).
 */
export const STATIC_TRUST_LOGOS: TrustLogo[] = [
  {
    name: "VendorCafe",
    headline: "Verified Vendor On VendorCafe",
    blurb:
      "We are an approved vendor on VendorCafe, allowing property managers to review documentation and process invoices quickly. Our active status ensures smooth coordination and full compliance for multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex.",
    category: "vendor-portal",
    verified: true,
  },
  {
    name: "Compliance Depot",
    headline: "Approved Provider On Compliance Depot",
    blurb:
      "Fred's Plumbing maintains full compliance through Compliance Depot to streamline vendor verification for property managers. Our documentation, insurance, and certifications are kept current to ensure fast approval and dependable service for every community.",
    category: "compliance-network",
    verified: true,
  },
  {
    name: "Vendor Nexus",
    headline: "Trusted Partner On Vendor Nexus",
    blurb:
      "We are a verified vendor on Vendor Nexus, giving property managers confidence that our team meets required standards for safety, performance, and documentation. This partnership helps simplify communication and speeds up scheduling.",
    category: "vendor-portal",
    verified: true,
  },
  {
    name: "NetVendor",
    headline: "Certified Vendor On NetVendor",
    blurb:
      "Our partnership with NetVendor ensures our insurance, background checks, and compliance records remain fully up to date. Property managers who rely on NetVendor can trust that our team is qualified, approved, and ready to respond quickly.",
    category: "compliance-network",
    verified: true,
  },
  {
    name: "RealPage",
    headline: "Verified Partner On RealPage",
    blurb:
      "Fred's Plumbing is a trusted vendor within the RealPage network, offering streamlined coordination for service requests and RealPage documentation. This partnership supports efficient operations for apartment communities and commercial properties across the region.",
    category: "vendor-portal",
    verified: true,
  },
  { name: "Greystar" },
  { name: "Yardi" },
  { name: "AAGD", category: "association" },
  { name: "TDLR", category: "credential" },
];
