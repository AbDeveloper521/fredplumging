/**
 * Single source of truth for the site's primary navigation.
 *
 * The types below intentionally mirror a Sanity document (`_key` on every
 * array member, `layout` as a field rather than a hardcoded per-label rule)
 * so the CMS swap is a change to `getNavigation()` only — no component edits.
 *
 * Components must consume `getNavigation()`, never `STATIC_NAVIGATION`.
 */

export type NavLink = {
  _key: string;
  label: string;
  href: string;
  /** Optional supporting copy, rendered in mega-menu panels. */
  description?: string;
};

export type NavGroup = {
  _key: string;
  label: string;
  href: string;
  /** Panel shape: `mega` renders two columns, `list` a single column. */
  layout: "mega" | "list";
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
        },
        {
          _key: "services-specialty",
          label: "Specialty Services",
          href: "/services/specialty-services",
          description: "Backflow, gas lines, and hydro jetting.",
        },
        {
          _key: "services-emergency",
          label: "Emergency Plumbing",
          href: "/services/emergency-plumbing",
          description: "24/7 response across the Metroplex.",
        },
        {
          _key: "services-drain-sewer",
          label: "Drain & Sewer",
          href: "/services/drain-sewer",
          description: "Camera inspection, cleaning, and repair.",
        },
        {
          _key: "services-maintenance",
          label: "Maintenance",
          href: "/services/maintenance",
          description: "Scheduled preventive programs.",
        },
        {
          _key: "services-commercial",
          label: "Commercial Plumbing",
          href: "/services/commercial-plumbing",
          description: "Retail, office, and industrial properties.",
        },
        {
          _key: "services-senior-care",
          label: "Senior Care Facilities",
          href: "/services/senior-care-facilities",
          description: "Low-disruption work in occupied care settings.",
        },
        {
          _key: "services-student-housing",
          label: "Student Housing",
          href: "/services/student-housing",
          description: "Turn-season capacity and fast turnarounds.",
        },
      ],
    },
    {
      _key: "areas-we-serve",
      label: "Areas We Serve",
      href: "/areas-we-serve",
      layout: "list",
      children: [
        { _key: "areas-dallas", label: "Dallas", href: "/areas-we-serve/dallas" },
        {
          _key: "areas-fort-worth",
          label: "Fort Worth",
          href: "/areas-we-serve/fort-worth",
        },
      ],
    },
    {
      _key: "multifamily",
      label: "Multifamily",
      href: "/multifamily",
      layout: "list",
      children: [
        {
          _key: "multifamily-apartments",
          label: "Apartments",
          href: "/multifamily/apartments",
        },
        { _key: "multifamily-condos", label: "Condos", href: "/multifamily/condos" },
        {
          _key: "multifamily-assisted-living",
          label: "Assisted Living",
          href: "/multifamily/assisted-living",
        },
        {
          _key: "multifamily-nursing-homes",
          label: "Nursing Homes",
          href: "/multifamily/nursing-homes",
        },
      ],
    },
  ],
  cta: { label: "Request Service", href: "/contact" },
};

/**
 * Navigation accessor — the seam a CMS plugs into.
 * Later: `return await sanityClient.fetch(navQuery)`.
 */
export async function getNavigation(): Promise<Navigation> {
  return STATIC_NAVIGATION;
}

export const footerNavigation = {
  services: [
    { label: "Plumbing", href: "/services/plumbing" },
    { label: "Emergency Plumbing", href: "/services/emergency-plumbing" },
    { label: "Drain & Sewer", href: "/services/drain-sewer" },
    { label: "Maintenance", href: "/services/maintenance" },
    { label: "Commercial Plumbing", href: "/services/commercial-plumbing" },
    { label: "Specialty Services", href: "/services/specialty-services" },
  ],
  industries: [
    { label: "Apartments", href: "/multifamily/apartments" },
    { label: "Condos", href: "/multifamily/condos" },
    { label: "Assisted Living", href: "/multifamily/assisted-living" },
    { label: "Nursing Homes", href: "/multifamily/nursing-homes" },
    { label: "Senior Care Facilities", href: "/services/senior-care-facilities" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Areas We Serve", href: "/areas-we-serve" },
    { label: "Testimonials", href: "/about/testimonials" },
    { label: "Careers", href: "/about/careers" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

/** Vendor systems and associations shown in the trust bar and compliance section. */
export const trustLogos = [
  "VendorCafe",
  "Greystar",
  "Nexus",
  "NetVendor",
  "Yardi",
  "AAGD",
  "TDLR",
];
