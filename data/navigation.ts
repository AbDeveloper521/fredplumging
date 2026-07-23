export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const navigation: NavItem[] = [
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Commercial Plumbing", href: "/services/commercial-plumbing" },
      { label: "Drain & Sewer", href: "/services/drain-sewer" },
      { label: "Emergency Repairs", href: "/services/emergency-repairs" },
      { label: "Preventive Maintenance", href: "/services/preventive-maintenance" },
      { label: "Specialty Plumbing", href: "/services/specialty-plumbing" },
      { label: "Backflow Testing", href: "/services/backflow-testing" },
    ],
  },
  {
    label: "Industries",
    href: "/industries",
    children: [
      { label: "Apartments", href: "/industries/apartments" },
      { label: "Condos", href: "/industries/condos" },
      { label: "Senior Care", href: "/industries/senior-care" },
      { label: "Student Housing", href: "/industries/student-housing" },
      { label: "Commercial Properties", href: "/industries/commercial-buildings" },
      { label: "Multi-Family Communities", href: "/industries/property-management" },
    ],
  },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export const footerNavigation = {
  services: [
    { label: "Commercial Plumbing", href: "/services/commercial-plumbing" },
    { label: "Drain & Sewer", href: "/services/drain-sewer" },
    { label: "Emergency Repairs", href: "/services/emergency-repairs" },
    { label: "Preventive Maintenance", href: "/services/preventive-maintenance" },
    { label: "Specialty Plumbing", href: "/services/specialty-plumbing" },
    { label: "Backflow Testing", href: "/services/backflow-testing" },
  ],
  industries: [
    { label: "Apartments", href: "/industries/apartments" },
    { label: "Condos", href: "/industries/condos" },
    { label: "Senior Care", href: "/industries/senior-care" },
    { label: "Student Housing", href: "/industries/student-housing" },
    { label: "Commercial Properties", href: "/industries/commercial-buildings" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Service Areas", href: "/service-areas" },
    { label: "Reviews", href: "/reviews" },
    { label: "Careers", href: "/careers" },
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
