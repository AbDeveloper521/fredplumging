import {
  Building2,
  Waves,
  Siren,
  CalendarCheck,
  Wrench,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  title: string;
  slug: string;
  shortDescription: string;
  /** Expected photography subject — used by the image placeholder system. */
  image: string;
  imageAlt: string;
  icon: LucideIcon;
  href: string;
  featured?: boolean;
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
    icon: Building2,
    href: "/services/commercial-plumbing",
    featured: true,
  },
  {
    title: "Emergency Repairs",
    slug: "emergency-repairs",
    shortDescription:
      "Rapid response for leaks, clogs, backups, pipe failures, and urgent plumbing problems.",
    image: "/images/service-emergency.webp",
    imageAlt:
      "Technician responding to an urgent plumbing repair at a multi-family property",
    icon: Siren,
    href: "/services/emergency-repairs",
    featured: true,
  },
  {
    title: "Drain & Sewer",
    slug: "drain-sewer",
    shortDescription:
      "Professional cleaning, inspection, repair, and maintenance for drains and sewer systems.",
    image: "/images/service-drain-sewer.webp",
    imageAlt: "Sewer camera inspection equipment in use at a commercial property",
    icon: Waves,
    href: "/services/drain-sewer",
  },
  {
    title: "Preventive Maintenance",
    slug: "preventive-maintenance",
    shortDescription:
      "Planned service programs that reduce downtime and help prevent expensive failures.",
    image: "/images/service-maintenance.webp",
    imageAlt:
      "Technician performing scheduled maintenance on a commercial water heater system",
    icon: CalendarCheck,
    href: "/services/preventive-maintenance",
  },
  {
    title: "Specialty Plumbing",
    slug: "specialty-plumbing",
    shortDescription:
      "Custom plumbing support for complex systems, installations, and facility-specific needs.",
    image: "/images/service-specialty.webp",
    imageAlt: "Specialized commercial plumbing installation in a mechanical room",
    icon: Wrench,
    href: "/services/specialty-plumbing",
  },
  {
    title: "Backflow Testing",
    slug: "backflow-testing",
    shortDescription:
      "Certified testing, maintenance, and repair to support compliance and water safety.",
    image: "/images/service-backflow.webp",
    imageAlt: "Certified technician testing a commercial backflow prevention assembly",
    icon: ShieldCheck,
    href: "/services/backflow-testing",
  },
];
