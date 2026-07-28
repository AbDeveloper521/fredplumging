/**
 * Section-drop audit — run with `sanity exec scripts/audit-sections.ts`.
 *
 * READ-ONLY. Fetches every service and industry document with the exact
 * per-slug queries the site uses, runs each document's raw `sections` array
 * through the REAL `toSections()` mapper, and reports which sections survive
 * and which are silently dropped — with the raw values of the fields that
 * caused the drop, JSON-stringified so `""`, `"\n"` and `null` are
 * distinguishable. Never writes, patches, publishes or deletes anything.
 */
import Module from "node:module";
import { getCliClient } from "sanity/cli";

// `sanity/lib/sections.ts` imports "server-only", which throws by design when
// loaded outside a React Server environment. This script runs in plain Node
// under `sanity exec`, so neutralize that one module before importing the
// real mapper — the point of the audit is to use the production code path.
const moduleAny = Module as unknown as {
  _load: (request: string, ...rest: unknown[]) => unknown;
};
const originalLoad = moduleAny._load;
moduleAny._load = function (request: string, ...rest: unknown[]) {
  if (request === "server-only") return {};
  return originalLoad.call(this, request, ...rest);
};

const client = (
  process.env.SANITY_API_READ_TOKEN
    ? getCliClient({ apiVersion: "2026-07-01" }).withConfig({
        token: process.env.SANITY_API_READ_TOKEN,
        useCdn: false,
      })
    : getCliClient({ apiVersion: "2026-07-01" })
).withConfig({ perspective: "published" });

type Raw = Record<string, unknown>;

/**
 * Which string fields each section type requires to survive `toSection()`
 * (mirrors the gates in sanity/lib/sections.ts — used only to NAME the empty
 * fields in the report; survived/dropped itself is decided by the real code).
 * Array-valued requirements are checked separately.
 */
const REQUIRED_STRINGS: Record<string, string[]> = {
  serviceHero: ["heading", "subheading", "secondaryCtaLabel", "secondaryCtaHref"],
  serviceAbout: ["heading", "ctaLabel", "ctaHref"],
  whatsIncluded: ["heading", "intro"],
  signsYouNeed: ["heading", "ctaLabel", "ctaHref"],
  processSteps: ["heading"],
  comparisonTable: ["heading"],
  serviceTrust: ["heading"],
  serviceTestimonials: ["heading"],
  propertyTypes: ["heading"],
  serviceFaq: ["heading"],
  serviceArea: ["heading", "body"],
  relatedServices: ["heading"],
  finalCta: ["heading", "body", "secondaryCtaLabel", "secondaryCtaHref"],
};

/** Array fields that must have ≥1 valid entry for the section to survive. */
const REQUIRED_ARRAYS: Record<string, string[]> = {
  serviceAbout: ["paragraphs"],
  whatsIncluded: ["items"],
  signsYouNeed: ["cards"],
  processSteps: ["steps"],
  comparisonTable: ["rows"],
  serviceTrust: ["items"],
  propertyTypes: ["cards"],
  serviceFaq: ["faqs"],
  relatedServices: ["serviceSlugs"],
};

function isEmptyString(value: unknown): boolean {
  return typeof value !== "string" || value.trim() === "";
}

function show(value: unknown): string {
  return value === undefined ? "undefined" : JSON.stringify(value);
}

async function main() {
  // Imported after the server-only shim is installed.
  const { toSections } = await import("../sanity/lib/sections");
  const { SERVICE_BY_SLUG_QUERY, INDUSTRY_BY_SLUG_QUERY } = await import(
    "../sanity/queries"
  );

  const targets: Array<{ docType: string; slugQuery: string; bySlug: string }> = [
    {
      docType: "service",
      slugQuery: `*[_type == "service"] | order(order asc).slug.current`,
      bySlug: SERVICE_BY_SLUG_QUERY,
    },
    {
      docType: "industry",
      slugQuery: `*[_type == "industry"] | order(order asc).slug.current`,
      bySlug: INDUSTRY_BY_SLUG_QUERY,
    },
  ];

  let totalDocs = 0;
  let totalSections = 0;
  let totalDropped = 0;
  const fullyDropped: string[] = [];

  for (const target of targets) {
    const slugs = await client.fetch<string[]>(target.slugQuery);
    for (const slug of slugs) {
      if (!slug) continue;
      totalDocs += 1;
      const doc = await client.fetch<{
        _updatedAt?: string;
        sections?: unknown;
      } | null>(
        // Same projection the site uses, plus _updatedAt for the report.
        target.bySlug.replace(/\{/, "{ _updatedAt,"),
        { slug },
      );
      console.log(`\n━━ ${target.docType} "${slug}" (updated ${doc?._updatedAt ?? "?"})`);
      const rawSections = Array.isArray(doc?.sections) ? (doc.sections as Raw[]) : null;
      if (!rawSections) {
        console.log("   no sections array — renders through the legacy CmsDetailPage layout.");
        continue;
      }

      let dropped = 0;
      rawSections.forEach((raw, i) => {
        totalSections += 1;
        const type = String(raw._type ?? "?");
        const k = String(raw._key ?? `(no _key, index ${i})`);
        // The real mapper decides survival — one section at a time.
        const survived = toSections([raw]) !== undefined;
        if (survived) {
          console.log(`   ✓ [${i}] ${type} (${k}) — kept`);
          return;
        }
        dropped += 1;
        totalDropped += 1;
        const reasons: string[] = [];
        for (const field of REQUIRED_STRINGS[type] ?? []) {
          if (isEmptyString(raw[field])) {
            reasons.push(`${field} = ${show(raw[field])}`);
          }
        }
        for (const field of REQUIRED_ARRAYS[type] ?? []) {
          const value = raw[field];
          if (!Array.isArray(value) || value.length === 0) {
            reasons.push(`${field} = ${show(value)}`);
          } else {
            reasons.push(`${field} has ${value.length} entr(y/ies) but none passed validation`);
          }
        }
        if (!(type in REQUIRED_STRINGS)) reasons.push(`unknown _type ${show(raw._type)}`);
        console.log(
          `   ✗ [${i}] ${type} (${k}) — DROPPED. Empty/invalid required fields: ${
            reasons.length > 0 ? reasons.join(", ") : "(none identified — investigate manually)"
          }`,
        );
      });

      if (rawSections.length > 0 && dropped === rawSections.length) {
        fullyDropped.push(`${target.docType} "${slug}"`);
      }
    }
  }

  console.log(`\n${"═".repeat(72)}`);
  console.log(
    `SUMMARY: ${totalDocs} documents, ${totalSections} sections, ${totalDropped} dropped.`,
  );
  if (fullyDropped.length > 0) {
    console.log(`\n${"!".repeat(72)}`);
    console.log(
      "EVERY section dropped on the following documents — they are silently\nfalling back to the legacy CmsDetailPage layout:",
    );
    for (const doc of fullyDropped) console.log(`   • ${doc}`);
    console.log("!".repeat(72));
  }
}

main().catch((error) => {
  console.error("audit-sections failed to run:", error);
  process.exit(1);
});
