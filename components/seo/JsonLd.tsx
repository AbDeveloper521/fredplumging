import { getSite } from "@/sanity/lib/getSite";
import type { SiteContent } from "@/data/site";
import type { JobPosting } from "@/data/jobs";

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * The LocalBusiness reference embedded in page-level schemas. Name, phone,
 * and URL come from siteSettings via getSite() — the same values the visible
 * site renders — so NAP data can never diverge between page and schema.
 */
function localBusiness(site: SiteContent) {
  return {
    "@type": "Plumber",
    name: site.name,
    legalName: site.legalName,
    telephone: site.phoneHref.replace(/^tel:/, ""),
    email: site.email,
    url: site.url,
  };
}

/**
 * Service structured data for /services/[slug] pages, with the business as
 * provider. `path` is the page's path; the absolute URL is built from
 * siteSettings' production URL.
 */
export async function ServiceJsonLd({
  name,
  description,
  path,
  audienceType,
}: {
  name: string;
  description: string;
  path: string;
  /** Optional schema.org Audience — used on industry pages. */
  audienceType?: string;
}) {
  const site = await getSite();
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        url: `${site.url}${path}`,
        serviceType: name,
        ...(audienceType
          ? { audience: { "@type": "Audience", audienceType } }
          : {}),
        provider: localBusiness(site),
        areaServed: [
          { "@type": "AdministrativeArea", name: site.serviceArea },
          ...site.serviceAreaCities.map((city) => ({
            "@type": "City" as const,
            name: city,
          })),
        ],
      }}
    />
  );
}

/**
 * FAQPage structured data. Callers MUST pass the exact strings the page
 * renders — search engines penalize schema text that differs from the
 * visible text.
 */
export function FaqJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  if (faqs.length === 0) return null;
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }}
    />
  );
}

/** BreadcrumbList structured data — absolute URLs built from siteSettings. */
export async function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ label: string; href: string }>;
}) {
  const site = await getSite();
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.label,
          item: `${site.url}${item.href === "/" ? "" : item.href}`,
        })),
      }}
    />
  );
}

/**
 * JobPosting structured data for /about/careers/[slug]. Google requires
 * title, description, datePosted, hiringOrganization, and a jobLocation with
 * a real PostalAddress, and applies manual actions when required fields are
 * missing or don't match the visible page — so this renders NOTHING until
 * the role has a datePosted AND siteSettings carries a full street address.
 * Emitting nothing is correct today; a half-populated JobPosting is worse.
 */
export async function JobPostingJsonLd({ job }: { job: JobPosting }) {
  const site = await getSite();
  const addressComplete =
    site.streetAddress &&
    site.addressLocality &&
    site.addressRegion &&
    site.postalCode;
  if (!job.open || !job.datePosted || !job.summary || !addressComplete) {
    return null;
  }

  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: job.title,
        description: job.summary,
        datePosted: job.datePosted,
        ...(job.validThrough ? { validThrough: job.validThrough } : {}),
        employmentType: job.employmentType,
        ...(job.openings ? { totalJobOpenings: job.openings } : {}),
        hiringOrganization: {
          "@type": "Organization",
          name: site.name,
          sameAs: site.url,
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            streetAddress: site.streetAddress,
            addressLocality: site.addressLocality,
            addressRegion: site.addressRegion,
            postalCode: site.postalCode,
            addressCountry: "US",
          },
        },
        // A mailto route must not claim direct apply.
        ...(job.applyUrl ? { directApply: true } : {}),
        url: `${site.url}/about/careers/${job.slug}`,
      }}
    />
  );
}

/**
 * LocalBusiness (Plumber) structured data.
 * Note: no street address is published intentionally — add `address`
 * once the business confirms the address it wants indexed.
 */
export async function JsonLd() {
  const site = await getSite();
  const data = {
    "@context": "https://schema.org",
    "@type": "Plumber",
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    telephone: site.phoneHref.replace(/^tel:/, ""),
    email: site.email,
    description:
      "Commercial, multi-family, drain, sewer, maintenance, and 24/7 emergency plumbing services across the Dallas–Fort Worth Metroplex.",
    foundingDate: String(site.foundedYear),
    areaServed: [
      { "@type": "AdministrativeArea", name: site.serviceArea },
      ...site.serviceAreaCities.map((city) => ({
        "@type": "City" as const,
        name: city,
      })),
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
