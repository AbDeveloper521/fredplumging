/**
 * Section-drop audit — run with `sanity exec scripts/audit-sections.ts`.
 *
 * READ-ONLY. Fetches every service and industry document with the exact
 * per-slug queries the site uses, runs each document's raw `sections` array
 * through the REAL `toSectionsWithReport()` mapper, and reports which
 * sections survive and which are dropped — naming the exact fields (raw
 * values JSON-stringified so `""`, `"\n"` and `null` are distinguishable)
 * and the Studio field titles the owner must fill. Never writes, patches,
 * publishes or deletes anything.
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

function show(value: unknown): string {
  return value === undefined ? "undefined" : JSON.stringify(value);
}

async function main() {
  // Imported after the server-only shim is installed.
  const { toSectionsWithReport } = await import("../sanity/lib/sectionLibrary");
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

      totalSections += rawSections.length;
      const { sections, dropped } = toSectionsWithReport(rawSections);
      const droppedByIndex = new Map(dropped.map((d) => [d.index, d]));

      rawSections.forEach((raw, i) => {
        const type = String(raw._type ?? "?");
        const k = String(raw._key ?? `(no _key, index ${i})`);
        const drop = droppedByIndex.get(i);
        if (!drop) {
          console.log(`   ✓ [${i}] ${type} (${k}) — kept`);
          return;
        }
        totalDropped += 1;
        const detail = drop.emptyFields
          .map((f) => `${f} = ${show(raw[f.replace(/ \(no complete entry\)$/, "")])}`)
          .join(", ");
        console.log(
          `   ✗ [${i}] ${type} (${k}) — DROPPED. Empty required fields: ${detail || "(none identified)"}`,
        );
        console.log(
          `        Fix in Studio: fill ${drop.studioFields.map((t) => `“${t}”`).join(", ") || "(inspect the section)"}`,
        );
      });

      if (rawSections.length > 0 && sections === undefined) {
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
