export interface Industry {
  title: string;
  slug: string;
  description: string;
  /** Expected photography subject — used by the image placeholder system. */
  image: string;
  imageAlt: string;
  bulletPoints: string[];
  href: string;
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
    href: "/industries/apartments",
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
    href: "/industries/condos",
  },
  {
    title: "Senior Care Facilities",
    slug: "senior-care",
    description:
      "Careful, low-disruption plumbing service for assisted living and senior care communities, where resident comfort, safety, and reliability come first.",
    image: "/images/technician-working.webp",
    imageAlt: "Technician working quietly in an occupied senior living facility",
    bulletPoints: [
      "Low-disruption scheduling",
      "Background-checked technicians",
      "Water temperature and safety systems",
      "Rapid emergency response",
      "Ongoing maintenance programs",
    ],
    href: "/industries/senior-care",
  },
  {
    title: "Student Housing",
    slug: "student-housing",
    description:
      "High-occupancy plumbing support for student housing properties — fast turnover work, semester-break project scheduling, and dependable emergency coverage.",
    image: "/images/multifamily-property.webp",
    imageAlt: "Student housing community near a university campus",
    bulletPoints: [
      "High-volume turnover repairs",
      "Break-period project work",
      "Common-area systems",
      "24/7 emergency coverage",
      "Preventive inspections",
    ],
    href: "/industries/student-housing",
  },
  {
    title: "Commercial Buildings",
    slug: "commercial-buildings",
    description:
      "Full-service plumbing for offices, retail, restaurants, and mixed-use commercial facilities — from tenant improvements to building-wide system maintenance.",
    image: "/images/service-commercial-plumbing.webp",
    imageAlt: "Commercial office building lobby and mechanical systems",
    bulletPoints: [
      "Tenant improvement plumbing",
      "Building-wide systems",
      "Code and compliance support",
      "After-hours scheduling",
      "Emergency repairs",
    ],
    href: "/industries/commercial-buildings",
  },
  {
    title: "Property Management Portfolios",
    slug: "property-management",
    description:
      "A single, vendor-compliant plumbing partner across your entire portfolio — consistent pricing, consistent communication, and consistent documentation at every property.",
    image: "/images/vendor-compliance.webp",
    imageAlt: "Property manager reviewing service documentation across a portfolio",
    bulletPoints: [
      "Portfolio-wide coverage",
      "Vendor portal compliance",
      "Consistent reporting",
      "Priority dispatch",
      "Dedicated account contact",
    ],
    href: "/industries/property-management",
  },
];
