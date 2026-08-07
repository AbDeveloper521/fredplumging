import { getSite } from "@/sanity/lib/getSite";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * /llms.txt — the plain-text summary for LLM crawlers.
 *
 * Generated rather than shipped as a static file in `public/`: it previously
 * hardcoded the email address and fourteen absolute URLs, all of which had
 * drifted from the real ones. Every business fact here now comes from Site
 * Settings and `SITE_URL`, so it cannot go stale on its own again.
 *
 * The service and property-type lists stay literal on purpose — their one-line
 * descriptions are written for this file and are not stored anywhere else.
 */
const SERVICES: Array<[string, string, string]> = [
  [
    "Plumbing Services",
    "/services/plumbing",
    "Repairs, repipes, fixtures, slab leak detection, and installations for commercial and multi-family properties.",
  ],
  [
    "Emergency Plumbing",
    "/services/emergency-plumbing",
    "24/7 rapid response for leaks, backups, and pipe failures.",
  ],
  [
    "Drain & Sewer",
    "/services/drain-sewer",
    "Camera inspection, cleaning, repair, and maintenance.",
  ],
  [
    "Preventive Maintenance",
    "/services/maintenance",
    "Scheduled programs that reduce downtime and prevent failures.",
  ],
  [
    "Commercial Plumbing",
    "/services/commercial-plumbing",
    "Property-wide solutions for offices and facilities.",
  ],
  [
    "Specialty Services",
    "/services/specialty-services",
    "Backflow testing, gas lines, and hydro jetting.",
  ],
];

const PROPERTY_TYPES: Array<[string, string, string]> = [
  [
    "Apartments",
    "/multifamily/apartments",
    "Unit turns, risers, and property-wide repairs.",
  ],
  [
    "Condos",
    "/multifamily/condos",
    "HOA-coordinated work on shared systems.",
  ],
  [
    "Assisted Living",
    "/multifamily/assisted-living",
    "Low-disruption service around residents.",
  ],
  [
    "Nursing Homes",
    "/multifamily/nursing-homes",
    "Code-compliant work in 24/7 care settings.",
  ],
];

const COMPANY: Array<[string, string]> = [
  ["About", "/about"],
  ["Areas We Serve", "/areas-we-serve"],
  ["Contact", "/contact"],
];

export async function GET() {
  const site = await getSite();
  const cities = site.serviceAreaCities.join(", ");

  const body = `# ${site.name}

> ${site.name} is a commercial and multi-family plumbing company serving
> the ${site.serviceArea} since ${site.foundedYear}. Licensed by the State of Texas
> (${site.licenseNumber}) and fully insured, it provides 24/7 emergency response,
> preventive maintenance programs, drain and sewer service, water heater
> work, backflow testing, and code-compliant installations for apartment
> communities, condominiums, assisted living, nursing homes, student
> housing, and commercial buildings.

Phone: ${site.phone} (answered 24/7)
Email: ${site.email}
Service area: ${cities}, and surrounding North Texas
communities.

## Services

${SERVICES.map(([label, path, blurb]) => `- [${label}](${SITE_URL}${path}): ${blurb}`).join("\n")}

## Property types

${PROPERTY_TYPES.map(([label, path, blurb]) => `- [${label}](${SITE_URL}${path}): ${blurb}`).join("\n")}

## Company

${COMPANY.map(([label, path]) => `- [${label}](${SITE_URL}${path})`).join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
