import { serviceAreaCities, site } from "@/data/site";

/**
 * LocalBusiness (Plumber) structured data.
 * Note: no street address is published intentionally — add `address`
 * once the business confirms the address it wants indexed.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Plumber",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    telephone: "+1-972-564-9081",
    email: site.email,
    description:
      "Commercial, multi-family, drain, sewer, maintenance, and 24/7 emergency plumbing services across the Dallas–Fort Worth Metroplex.",
    foundingDate: String(site.foundedYear),
    areaServed: [
      { "@type": "AdministrativeArea", name: "Dallas–Fort Worth Metroplex" },
      ...serviceAreaCities.map((city) => ({ "@type": "City" as const, name: city })),
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    makesOffer: [
      "Commercial Plumbing",
      "Drain & Sewer",
      "Emergency Repairs",
      "Preventive Maintenance",
      "Specialty Plumbing",
      "Backflow Testing",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
