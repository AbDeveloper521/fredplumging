/**
 * Fallback-drift check — run with `npm run check:drift`
 * (executes via `sanity exec`, which handles TypeScript and env loading).
 *
 * Compares the PUBLISHED Sanity content against the static fallback
 * constants in data/*.ts. Those constants are what visitors see if Sanity is
 * ever unreachable — if they drift from the published content, an outage
 * would confidently serve stale facts (an old phone number is the nightmare
 * case). Warns on divergence; set DRIFT_STRICT=1 to fail CI instead.
 */
import { getCliClient } from "sanity/cli";
import { site, serviceAreaCities } from "../data/site";
import {
  STATIC_NAVIGATION,
  STATIC_FOOTER_NAVIGATION,
  STATIC_TRUST_LOGOS,
} from "../data/navigation";
import { faqs } from "../data/faqs";
import { testimonials } from "../data/testimonials";
import { googleReviews } from "../data/googleReviews";
import { jobPostings } from "../data/jobs";
import { services } from "../data/services";
import { industries } from "../data/industries";
import { cities } from "../data/cities";

// Prefer the app's read token (works in CI); fall back to CLI login auth.
const client = process.env.SANITY_API_READ_TOKEN
  ? getCliClient({ apiVersion: "2026-07-01" }).withConfig({
      token: process.env.SANITY_API_READ_TOKEN,
      useCdn: false,
    })
  : getCliClient({ apiVersion: "2026-07-01" });

type Diff = { path: string; fallback: unknown; published: unknown };

/** Deep-compare, ignoring `_key`s, undefined-vs-missing, and extra CMS-only fields. */
function diff(fallback: unknown, published: unknown, path: string, out: Diff[]): void {
  if (fallback === undefined || fallback === null) return;
  if (published === undefined || published === null) {
    out.push({ path, fallback, published });
    return;
  }
  if (Array.isArray(fallback)) {
    const pub = Array.isArray(published) ? published : [];
    if (fallback.length !== pub.length) {
      out.push({ path: `${path}.length`, fallback: fallback.length, published: pub.length });
    }
    fallback.forEach((item, i) => diff(item, pub[i], `${path}[${i}]`, out));
    return;
  }
  if (typeof fallback === "object") {
    for (const [key, value] of Object.entries(fallback as Record<string, unknown>)) {
      if (
        key === "_key" ||
        key === "id" || // local React key — the CMS document has its own _id
        key === "image" ||
        key === "imageAlt" ||
        key === "photo" ||
        key === "body" ||
        key === "sections" ||
        key === "seoTitle" ||
        key === "seoDescription" ||
        // Map-band fields carry built-in defaults and are optional CMS
        // overrides — unset in Sanity is the normal state, not drift.
        key === "mapHeading" ||
        key === "mapDescription" ||
        key === "mapEmbedUrl" ||
        // Stored for a future "Response from the owner" treatment, never
        // rendered — the hand-created testimonial docs don't carry them.
        key === "ownerReply" ||
        key === "ownerReplyDate"
      )
        continue;
      diff(value, (published as Record<string, unknown>)[key], `${path}.${key}`, out);
    }
    return;
  }
  if (fallback !== published) {
    out.push({ path, fallback, published });
  }
}

async function main() {
  const checks: Array<{ name: string; fallback: unknown; query: string }> = [
    {
      name: "siteSettings (data/site.ts)",
      fallback: { ...site, serviceAreaCities },
      query: `*[_type=="siteSettings" && _id=="siteSettings"][0]{name,legalName,tagline,phone,phoneHref,email,emailHref,serviceArea,foundedYear,yearsInBusiness,url,licenseNumber,serviceAreaCities}`,
    },
    {
      name: "navigation (data/navigation.ts)",
      fallback: STATIC_NAVIGATION,
      query: `*[_type=="navigation" && _id=="navigation"][0]{items[]{label,href,layout,showServiceAreaCities,children[]{label,href,description,icon}},cta{label,href}}`,
    },
    {
      name: "footer (data/navigation.ts)",
      fallback: STATIC_FOOTER_NAVIGATION,
      query: `*[_type=="navigation" && _id=="navigation"][0]{"columns":footerColumns[]{heading,links[]{label,href}},"legal":legalLinks[]{label,href}}`,
    },
    {
      name: "trust logos (data/navigation.ts)",
      fallback: STATIC_TRUST_LOGOS,
      query: `*[_type=="trustLogo"]|order(order asc){name,headline,blurb,category,url,verified}`,
    },
    {
      name: "faqs (data/faqs.ts)",
      fallback: faqs,
      query: `*[_type=="faq"]|order(order asc){question,answer}`,
    },
    {
      name: "reviewSettings (data/googleReviews.ts)",
      fallback: {
        rating: googleReviews.rating,
        reviewCount: googleReviews.reviewCount,
        verifiedOn: googleReviews.verifiedOn,
        reviewsUrl: googleReviews.reviewsUrl,
      },
      query: `*[_type=="reviewSettings" && _id=="reviewSettings"][0]{rating,reviewCount,verifiedOn,reviewsUrl}`,
    },
    {
      name: "testimonials (data/testimonials.ts)",
      fallback: testimonials,
      query: `*[_type=="testimonial"]|order(order asc){name,role,rating,quote,date,featured,source,reviewerMeta,sourceUrl,serviceTags}`,
    },
    {
      name: "services (data/services.ts)",
      fallback: services,
      query: `*[_type=="service"]|order(order asc){title,"slug":slug.current,shortDescription,icon,featured}`,
    },
    {
      name: "jobs (data/jobs.ts)",
      fallback: jobPostings,
      query: `*[_type=="jobPosting"]|order(order asc){title,"slug":slug.current,employmentType,team,shift,openings,summary,responsibilities,requirements,compensationNote,applyEmail,applyUrl,datePosted,validThrough,open}`,
    },
    {
      // Section stacks are not drift-compared (the `sections` key is in the
      // skip list, same as services/homepage) — this now guards the
      // document's identity fields only.
      name: "city pages (data/cities.ts)",
      fallback: cities,
      query: `*[_type=="cityPage"]|order(city asc){city,"slug":slug.current}`,
    },
    {
      name: "industries (data/industries.ts)",
      fallback: industries,
      query: `*[_type=="industry"]|order(order asc){title,"slug":slug.current,description,bulletPoints}`,
    },
  ];

  let totalDiffs = 0;
  for (const check of checks) {
    const published = await client.fetch(check.query);
    if (published === null || (Array.isArray(published) && published.length === 0)) {
      console.warn(`⚠️  ${check.name}: nothing published in Sanity yet — fallback is the only copy.`);
      continue;
    }
    const diffs: Diff[] = [];
    diff(check.fallback, published, "$", diffs);
    if (diffs.length === 0) {
      console.log(`✓  ${check.name}: fallback matches published content.`);
    } else {
      totalDiffs += diffs.length;
      console.warn(`⚠️  ${check.name}: fallback has DRIFTED from published content:`);
      for (const d of diffs.slice(0, 10)) {
        console.warn(`     ${d.path}: fallback=${JSON.stringify(d.fallback)} published=${JSON.stringify(d.published)}`);
      }
      if (diffs.length > 10) console.warn(`     …and ${diffs.length - 10} more differences.`);
    }
  }

  if (totalDiffs > 0) {
    console.warn(
      `\n⚠️  ${totalDiffs} difference(s) between published Sanity content and the static fallbacks.` +
        `\n   If Sanity is ever unreachable, visitors will see the OLD fallback values.` +
        `\n   Update the data/*.ts constants to match what's published.`,
    );
    if (process.env.DRIFT_STRICT === "1") process.exit(1);
  }
}

main().catch((error) => {
  console.error("check-fallback-drift failed to run:", error);
  process.exit(1);
});
