/**
 * One-time reorganisation of the published `homePage` section stack to the
 * client's reference layout (their old WordPress homepage) — dry run:
 *   npx sanity exec scripts/reorganize-homepage-sections.ts
 * write pass (owner runs this after reading the plan):
 *   npx sanity exec scripts/reorganize-homepage-sections.ts -- --confirm
 *
 * ⚠️ Close every open Studio tab BEFORE confirming: a stale tab that still
 * holds the old stack can silently republish it over this migration.
 *
 * What it does, and ALL it can do:
 *  - Patches exactly ONE document: `homePage`. One transaction: `set` the
 *    reordered `sections` array. Nothing else is touched.
 *  - Existing sections are carried over WHOLE — every field, every image
 *    asset ref, hotspot, crop and alt travels unchanged — then only the
 *    copy fields the reference layout names are updated (each change is
 *    printed old → new in the dry run). The reference copy comes from
 *    `data/homePage.ts`, the same defaults the site falls back to.
 *  - Two items are new: the certification `badgeStrip` and the property-type
 *    band (`homeIndustries`). Both are created empty — the site fills them
 *    from the built-in default copy, and the owner edits them in Studio.
 *  - Sections the reference layout doesn't carry (why-choose-us, process,
 *    case study, FAQ, and any trust bar / service area) are NOT deleted:
 *    they move below the closing band with "Hide this section" ticked, so
 *    their content — including uploaded photos — stays in the document and
 *    one untick brings any of them back.
 *  - The Google-map band keeps its slot right before the closing band.
 *
 * Refuses to run when:
 *  - a DRAFT of homePage exists (patching only the published version would
 *    let the stale draft overwrite this migration on the owner's next
 *    Publish — discard the draft in Studio first),
 *  - the document carries a section type this plan doesn't know, or two
 *    sections of the same known type (refuse rather than guess), or
 *  - there is no published `sections` array to reorganise.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { homePageDefaults } from "../data/homePage";

type Raw = Record<string, unknown>;

/**
 * The reference page, top to bottom. `copy` lists the fields whose values
 * the reference names — an existing value that differs is overwritten (and
 * printed); an absent value stays absent, because the site's default copy
 * (data/homePage.ts) now IS the reference copy for these fields.
 */
const PLAN: Array<{
  type: string;
  /** _key for a newly created item; existing items keep their own _key. */
  newKey: string;
  label: string;
  copy?: Record<string, string>;
}> = [
  {
    type: "homeHero",
    newKey: "hero",
    label: "Hero (background photo, emergency form)",
    copy: {
      headingBefore: homePageDefaults.hero.headingBefore,
      headingHighlight: homePageDefaults.hero.headingHighlight ?? "",
      headingAfter: homePageDefaults.hero.headingAfter ?? "",
      subcopy: homePageDefaults.hero.subcopy,
    },
  },
  {
    type: "homeEmergency",
    newKey: "emergency",
    label: "Red emergency band",
    copy: {
      heading: homePageDefaults.emergency.heading,
      body: homePageDefaults.emergency.body,
    },
  },
  {
    type: "homeAbout",
    newKey: "about",
    label: "Heritage band (photos left, copy right)",
    copy: {
      heading: homePageDefaults.about.heading,
      description: homePageDefaults.about.description,
    },
  },
  { type: "badgeStrip", newKey: "badgeStrip", label: "Certification badges" },
  {
    type: "homeServices",
    newKey: "services",
    label: "Services grid",
    copy: { heading: homePageDefaults.services.heading },
  },
  {
    type: "homeCompliance",
    newKey: "compliance",
    label: "Vendor compliance band",
    copy: {
      heading: homePageDefaults.compliance.heading,
      description: homePageDefaults.compliance.description,
    },
  },
  {
    type: "homeIndustries",
    newKey: "industries",
    label: "Property types band (dark)",
  },
  { type: "homeTestimonials", newKey: "testimonials", label: "Reviews" },
  { type: "homeLocationMap", newKey: "locationMap", label: "Google-map band" },
  {
    type: "homeFinalCta",
    newKey: "finalCta",
    label: "Closing band (quote form)",
    copy: { heading: homePageDefaults.finalCta.heading },
  },
];

/** Known types the reference layout doesn't carry → hidden, never deleted. */
const HOLDOVER_TYPES = new Set([
  "homeTrustBar",
  "homeWhyChooseUs",
  "homeProcess",
  "homeCaseStudy",
  "homeServiceArea",
  "homeFaq",
]);

/** Collects every image asset _ref inside a value, for the dry-run print. */
function assetRefs(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((entry) => assetRefs(entry, out));
  } else if (value && typeof value === "object") {
    const obj = value as Raw;
    const asset = obj.asset as Raw | undefined;
    if (asset && typeof asset === "object" && typeof asset._ref === "string") {
      out.push(asset._ref);
    }
    for (const inner of Object.values(obj)) assetRefs(inner, out);
  }
  return out;
}

const show = (value: unknown) =>
  JSON.stringify(typeof value === "string" ? value : (value ?? "(empty)")).slice(0, 90);

async function main() {
  const confirm = process.argv.includes("--confirm");

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (confirm && !writeToken) {
    console.error("SANITY_API_WRITE_TOKEN is not set (Editor scope, .env.local).");
    process.exit(1);
  }
  const client = getCliClient({ apiVersion: "2026-07-01" }).withConfig({
    ...(writeToken ? { token: writeToken } : {}),
    useCdn: false,
  });
  const { projectId, dataset } = client.config();
  console.log(
    `${confirm ? "WRITE PASS" : "DRY RUN"} against ${projectId}/${dataset}\n`,
  );

  const [doc, draft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == "homePage"][0]`),
    client.fetch<Raw | null>(`*[_id == "drafts.homePage"][0]{_id}`),
  ]);

  if (draft) {
    console.error(
      "STOP: a DRAFT of Home Page exists (drafts.homePage). Patching only " +
        "the published version would let the stale draft overwrite this " +
        "migration on the next Publish. Open Home Page in /studio, use " +
        "'Discard changes' to drop the draft, CLOSE the tab, then re-run. " +
        "Nothing was changed.",
    );
    process.exit(1);
  }
  const existing = doc?.sections;
  if (!doc || !Array.isArray(existing) || existing.length === 0) {
    console.log(
      "No published homePage sections exist — nothing to reorganise. The " +
        "site already renders the new default stack from data/homePage.ts; " +
        "the owner can open Home Page in /studio and publish to take control.",
    );
    return;
  }

  // Index the published items by type; refuse anything this plan can't
  // place with certainty.
  const planTypes = new Set(PLAN.map((entry) => entry.type));
  const byType = new Map<string, Raw>();
  for (const item of existing as Raw[]) {
    const type = String(item?._type ?? "unknown");
    if (!planTypes.has(type) && !HOLDOVER_TYPES.has(type)) {
      console.error(
        `STOP: the published stack contains a "${type}" section this plan ` +
          "doesn't know how to place. Refusing rather than guessing — " +
          "review the document in /studio (or extend the plan) and re-run. " +
          "Nothing was changed.",
      );
      process.exit(1);
    }
    if (byType.has(type)) {
      console.error(
        `STOP: the published stack contains more than one "${type}" ` +
          "section — this plan can't know which copy the reference position " +
          "should carry. Resolve the duplicate in /studio and re-run. " +
          "Nothing was changed.",
      );
      process.exit(1);
    }
    byType.set(type, item);
  }
  const usedKeys = new Set(
    (existing as Raw[]).map((item) => String(item?._key ?? "")),
  );

  const sections: Raw[] = [];
  console.log("Planned sections[] (reference order):\n");

  for (const entry of PLAN) {
    const source = byType.get(entry.type);
    const section: Raw = source
      ? { ...source }
      : {
          _type: entry.type,
          // Never collide with a key already in the document.
          _key: usedKeys.has(entry.newKey)
            ? `${entry.newKey}-ref`
            : entry.newKey,
        };
    const changes: string[] = [];

    if (source && entry.copy) {
      for (const [field, target] of Object.entries(entry.copy)) {
        const current = source[field];
        if (typeof current === "string" && current.trim() !== "") {
          if (current !== target) {
            if (target === "") {
              delete section[field];
              changes.push(`${field}: ${show(current)} → (cleared)`);
            } else {
              section[field] = target;
              changes.push(`${field}: ${show(current)} → ${show(target)}`);
            }
          }
        }
        // Absent stays absent: the site's default copy for this field is
        // already the reference text (data/homePage.ts).
      }
    }

    sections.push(section);
    const refs = assetRefs(section);
    console.log(
      `  ${sections.length}. ${entry.label} [${entry.type}]` +
        (source
          ? `  ← existing item (_key: ${String(source._key)})`
          : "  (NEW empty item — site renders its built-in default copy)") +
        (changes.length
          ? `\n     copy updated:\n       ${changes.join("\n       ")}`
          : source
            ? "\n     all fields carried over unchanged"
            : "") +
        (refs.length ? `\n     images preserved: ${refs.join(", ")}` : ""),
    );
  }

  // Everything the reference layout doesn't carry: hidden below the fold of
  // the document, content and photos intact.
  const holdovers = (existing as Raw[]).filter((item) =>
    HOLDOVER_TYPES.has(String(item?._type)),
  );
  if (holdovers.length > 0) {
    console.log(
      "\nKept but HIDDEN (content and photos preserved — untick “Hide this " +
        "section” in Studio to bring one back):",
    );
    for (const item of holdovers) {
      const section: Raw = { ...item, hidden: true };
      sections.push(section);
      const refs = assetRefs(section);
      console.log(
        `  ${sections.length}. ${String(item._type)} (_key: ${String(item._key)})` +
          (refs.length ? ` — images preserved: ${refs.join(", ")}` : ""),
      );
    }
  } else {
    console.log("\nNo leftover sections to hide.");
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. Before applying: close every open " +
        "Studio tab (a stale tab's Publish can overwrite this migration). " +
        "Then run:\n" +
        "  npx sanity exec scripts/reorganize-homepage-sections.ts -- --confirm",
    );
    return;
  }

  // One patch, one transaction — the only write in the script, targeting
  // only the `homePage` id.
  await client.patch("homePage").set({ sections }).commit();

  console.log(
    "\nDone. homePage now carries the reference-order stack. Check /studio " +
      "(Home Page shows the new order, hidden sections at the bottom) and " +
      "reload the site — the uploaded photos should still render on the " +
      "hero-adjacent bands.",
  );
}

main().catch((error) => {
  console.error("reorganize-homepage-sections failed:", error);
  process.exit(1);
});
