/**
 * One-time migration of the published `homePage` document from the old
 * grouped shape (fixed object fields: hero, about, emergency, …) to the
 * section-stack shape (`sections[]`) — dry run:
 *   sanity exec scripts/migrate-homepage-sections.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/migrate-homepage-sections.ts -- --confirm
 *
 * What it does, and ALL it can do:
 *  - Patches exactly ONE document: `homePage`. One transaction: `set` the
 *    new `sections` array, then `unset` the old group fields that were
 *    copied — so the Studio's "Unknown fields found" warnings disappear.
 *  - Copies every old field that has a same-named home in the new section
 *    type (field lists come from the live schema definitions, not from a
 *    hand-written list). Image objects are copied VERBATIM — asset refs,
 *    hotspot, crop and alt travel unchanged; no asset is touched.
 *  - Old fields with no home in the new shape are left on the dry-run
 *    output and reported, never guessed at.
 *  - Sections with no old group (trust bar, services, reviews, FAQ, map)
 *    are created as empty items — the site fills them from the built-in
 *    default copy, and the owner can edit them later.
 *  - The default stack deliberately omits "Who We Serve" (industries); the
 *    old shape has no such group either. None is created.
 *
 * Refuses to run when:
 *  - the document already has a non-empty `sections` array (someone started
 *    re-entering by hand — nothing may overwrite newer work), or
 *  - a DRAFT of homePage exists (patching only the published version would
 *    let the old-shape draft silently overwrite the migration on the
 *    owner's next Publish — discard the draft in Studio first).
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 * (scripts/seed-reviews.ts contains a blanket-delete pattern; it is NOT the
 * template.)
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { homeSectionTypes } from "../sanity/schemas/homePage";
import { defaultHomeSections } from "../data/homePage";

/** Old top-level group field → new section `_type`. */
const OLD_GROUP_TO_TYPE: Record<string, string> = {
  hero: "homeHero",
  about: "homeAbout",
  emergency: "homeEmergency",
  whyChooseUs: "homeWhyChooseUs",
  process: "homeProcess",
  compliance: "homeCompliance",
  caseStudy: "homeCaseStudy",
  serviceArea: "homeServiceArea",
  finalCta: "homeFinalCta",
};
const TYPE_TO_OLD_GROUP = Object.fromEntries(
  Object.entries(OLD_GROUP_TO_TYPE).map(([group, type]) => [type, group]),
);

/** Field names each new section type accepts — read from the schema itself. */
const SCHEMA_FIELDS: Record<string, string[]> = Object.fromEntries(
  homeSectionTypes.map((type) => [
    type.name,
    ((type as { fields?: Array<{ name: string }> }).fields ?? []).map(
      (field) => field.name,
    ),
  ]),
);

type Raw = Record<string, unknown>;

/** Ensures every entry of an array-of-objects carries a `_key`. */
function withKeys(value: unknown, prefix: string): unknown {
  if (!Array.isArray(value)) return value;
  return value.map((entry, i) =>
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? { _key: (entry as Raw)._key ?? `${prefix}-${i}`, ...(entry as Raw) }
      : entry,
  );
}

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
    client.fetch<Raw | null>(`*[_id == "drafts.homePage"][0]`),
  ]);

  if (!doc) {
    console.log(
      "No published homePage document exists — nothing to migrate. " +
        "(The site serves the built-in default stack; the owner can simply " +
        "open Home Page in /studio and publish.)",
    );
    return;
  }
  if (draft) {
    console.error(
      "STOP: a DRAFT of Home Page exists (drafts.homePage). Migrating only " +
        "the published version would let the old-shape draft overwrite the " +
        "migration on the next Publish. Open Home Page in /studio, use " +
        "'Discard changes' to drop the draft, then re-run this script. " +
        "Nothing was changed.",
    );
    process.exit(1);
  }
  const existingSections = doc.sections;
  if (Array.isArray(existingSections) && existingSections.length > 0) {
    console.error(
      `STOP: homePage already has a non-empty sections array ` +
        `(${existingSections.length} item(s)) — someone has started building ` +
        "the new structure. This script never merges into or overwrites that " +
        "work. Nothing was changed.",
    );
    process.exit(1);
  }

  const groupsPresent = Object.keys(OLD_GROUP_TO_TYPE).filter(
    (group) => doc[group] && typeof doc[group] === "object",
  );
  if (groupsPresent.length === 0) {
    console.log(
      "The homePage document has none of the old group fields — nothing to " +
        "migrate. Nothing was changed.",
    );
    return;
  }

  const unmapped: string[] = [];
  const sections: Raw[] = [];

  console.log("Planned sections[] (default stack order):\n");
  for (const item of defaultHomeSections) {
    const oldGroup = TYPE_TO_OLD_GROUP[item._type] as string | undefined;
    const source =
      oldGroup && doc[oldGroup] && typeof doc[oldGroup] === "object"
        ? (doc[oldGroup] as Raw)
        : undefined;

    const section: Raw = { _type: item._type, _key: item._key };
    const copied: string[] = [];

    if (source) {
      const allowed = SCHEMA_FIELDS[item._type] ?? [];
      for (const [field, value] of Object.entries(source)) {
        if (field.startsWith("_")) continue;
        if (value === null || value === undefined) continue;
        if (allowed.includes(field)) {
          section[field] = withKeys(value, `${item._key}-${field}`);
          copied.push(field);
        } else {
          unmapped.push(
            `${oldGroup}.${field} = ${JSON.stringify(value).slice(0, 120)}`,
          );
        }
      }
    }

    sections.push(section);

    const refs = assetRefs(section);
    console.log(
      `  ${sections.length}. ${item._type} (_key: ${item._key})` +
        (source
          ? ` ← old "${oldGroup}" group\n     fields: ${copied.join(", ") || "(none)"}` +
            (refs.length
              ? `\n     images preserved: ${refs.join(", ")}`
              : "")
          : "  (new empty item — site renders its built-in default copy)"),
    );
  }

  console.log(
    `\nOld group fields to unset after copying: ${groupsPresent.join(", ")}`,
  );
  if (unmapped.length > 0) {
    console.log(
      "\nOld fields with NO home in the new shape (kept out, not guessed at):",
    );
    for (const line of unmapped) console.log(`  - ${line}`);
  } else {
    console.log("\nEvery old field has a home in the new shape — none left behind.");
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/migrate-homepage-sections.ts -- --confirm",
    );
    return;
  }

  // One patch, one transaction: set the stack, drop the old groups. This is
  // the only write in the script, and it targets only the `homePage` id.
  await client
    .patch("homePage")
    .set({ sections })
    .unset(groupsPresent)
    .commit();

  console.log(
    "\nDone. homePage now carries the sections[] stack; old group fields " +
      "removed. Check /studio (Home Page shows populated sections, no " +
      "'Unknown fields found') and reload localhost — the uploaded photos " +
      "should render again.",
  );
}

main().catch((error) => {
  console.error("migrate-homepage-sections failed:", error);
  process.exit(1);
});
