/**
 * One-time migration of the `aboutPage` document from the old fixed-field
 * shape (heroHeading, storyParagraphs, …) to the section-stack shape
 * (`sections[]`) — dry run:
 *   sanity exec scripts/migrate-about-sections.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/migrate-about-sections.ts -- --confirm
 *
 * What it does, and ALL it can do:
 *  - Patches at most TWO documents: `aboutPage` AND `drafts.aboutPage`,
 *    whichever exist — both in ONE transaction. (The homepage migration
 *    initially refused on a draft and made the owner discard it; here the
 *    draft is migrated too, so an open draft can never overwrite the
 *    migration on the next Publish.) Each patch: `set` the new `sections`
 *    array built from that document's own field values, then `unset` the
 *    old top-level fields that were copied — so the Studio's "Unknown
 *    fields found" warnings disappear.
 *  - Field values are copied VERBATIM under their new names (the old
 *    `storyHeading` becomes the story section's `heading`, and so on —
 *    see FIELD_MAP). Image objects travel unchanged — asset refs, hotspot,
 *    crop and alt; no asset is touched. Mapped target names are checked
 *    against the live schema definitions, not trusted blindly.
 *  - The story/evolution/values/links eyebrows and the story badge line
 *    were hardcoded in the old page file, not stored — migrated items leave
 *    them unset and the site renders the built-in default copy ("Our
 *    Story", "Then and Now", …) until the owner edits them.
 *  - The closing-CTA item has no old source — it is created empty and the
 *    site renders its built-in default copy (exactly what the route used to
 *    append).
 *  - Old fields with no home in the new shape are left alone and reported,
 *    never guessed at.
 *
 * Refuses to run when a target document already has a non-empty `sections`
 * array (someone started re-entering by hand — nothing may overwrite newer
 * work). With no aboutPage document at all there is nothing to migrate:
 * the site serves the built-in default stack, and the owner can simply
 * open About Page in /studio (it prefills with the stack) and publish.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no other document types, under any flag.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { aboutSectionTypes } from "../sanity/schemas/aboutPage";
import { defaultAboutSections } from "../data/aboutPage";

type Raw = Record<string, unknown>;

/** Per new-section-type: old top-level field → new field on the section. */
const FIELD_MAP: Record<string, Record<string, string>> = {
  aboutHero: {
    heroEyebrow: "eyebrow",
    heroHeading: "heading",
    heroParagraphs: "paragraphs",
  },
  aboutStory: {
    storyHeading: "heading",
    storyParagraphs: "paragraphs",
    storyPhotoPrimary: "photoPrimary",
    storyPhotoSubjectPrimary: "photoSubjectPrimary",
    storyPhotoSecondary: "photoSecondary",
    storyPhotoSubjectSecondary: "photoSubjectSecondary",
  },
  aboutEvolution: {
    evolutionHeading: "heading",
    evolutionParagraphs: "paragraphs",
    evolutionPhoto: "photo",
    evolutionPhotoSubject: "photoSubject",
  },
  valuesGrid: {
    valuesHeading: "heading",
    values: "values",
  },
  pageLinks: {
    linksHeading: "heading",
    links: "links",
  },
};

/** Every old top-level field the migration consumes (the unset list). */
const OLD_FIELDS = Object.values(FIELD_MAP).flatMap((map) => Object.keys(map));

/** New-field names each About section type accepts — from the schema itself. */
const SCHEMA_FIELDS: Record<string, string[]> = Object.fromEntries(
  aboutSectionTypes.map((type) => [
    type.name,
    ((type as { fields?: Array<{ name: string }> }).fields ?? []).map(
      (field) => field.name,
    ),
  ]),
);

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

/** Builds the planned sections[] for one document; prints the plan. */
function planFor(docId: string, doc: Raw): { sections: Raw[]; unset: string[] } | null {
  const existing = doc.sections;
  if (Array.isArray(existing) && existing.length > 0) {
    console.error(
      `STOP: ${docId} already has a non-empty sections array ` +
        `(${existing.length} item(s)) — someone has started building the new ` +
        "structure. This script never merges into or overwrites that work. " +
        "Nothing was changed.",
    );
    return null;
  }

  const oldFieldsPresent = OLD_FIELDS.filter(
    (field) => doc[field] !== undefined && doc[field] !== null,
  );
  const unmapped: string[] = [];
  const sections: Raw[] = [];

  console.log(`Planned sections[] for ${docId} (default stack order):\n`);
  for (const item of defaultAboutSections) {
    const section: Raw = { _type: item._type, _key: item._key };
    const copied: string[] = [];
    const map = FIELD_MAP[item._type];

    if (map) {
      const allowed = SCHEMA_FIELDS[item._type] ?? [];
      for (const [oldField, newField] of Object.entries(map)) {
        const value = doc[oldField];
        if (value === undefined || value === null) continue;
        if (!allowed.includes(newField)) {
          unmapped.push(`${oldField} (schema has no "${item._type}.${newField}")`);
          continue;
        }
        section[newField] = withKeys(value, `${item._key}-${newField}`);
        copied.push(`${oldField} → ${newField}`);
      }
    }

    sections.push(section);

    const refs = assetRefs(section);
    console.log(
      `  ${sections.length}. ${item._type} (_key: ${item._key})` +
        (copied.length
          ? `\n     fields: ${copied.join(", ")}` +
            (refs.length ? `\n     images preserved: ${refs.join(", ")}` : "")
          : "  (new empty item — site renders its built-in default copy)"),
    );
  }

  console.log(
    `\n  Old fields to unset on ${docId} after copying: ` +
      (oldFieldsPresent.join(", ") || "(none present)"),
  );
  if (unmapped.length > 0) {
    console.log("  Old fields with NO home in the new shape (kept out, not guessed at):");
    for (const line of unmapped) console.log(`    - ${line}`);
  }
  console.log("");

  return { sections, unset: oldFieldsPresent };
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
    client.fetch<Raw | null>(`*[_id == "aboutPage"][0]`),
    client.fetch<Raw | null>(`*[_id == "drafts.aboutPage"][0]`),
  ]);

  if (!doc && !draft) {
    console.log(
      "No aboutPage document exists (published or draft) — nothing to " +
        "migrate. The site serves the built-in default stack; the owner can " +
        "simply open About Page in /studio (it prefills with the stack) and " +
        "publish.",
    );
    return;
  }

  const targets: Array<{ id: string; plan: { sections: Raw[]; unset: string[] } }> = [];
  for (const [id, source] of [
    ["aboutPage", doc],
    ["drafts.aboutPage", draft],
  ] as const) {
    if (!source) continue;
    const plan = planFor(id, source);
    if (!plan) process.exit(1);
    targets.push({ id, plan });
  }

  if (!confirm) {
    console.log(
      "DRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/migrate-about-sections.ts -- --confirm",
    );
    return;
  }

  // One transaction covering both documents: set each stack, drop each
  // document's old fields. These patches are the only writes in the script,
  // and they target only the two aboutPage ids.
  let transaction = client.transaction();
  for (const { id, plan } of targets) {
    transaction = transaction.patch(id, (patch) =>
      patch.set({ sections: plan.sections }).unset(plan.unset),
    );
  }
  await transaction.commit();

  console.log(
    `Done. ${targets.map((t) => t.id).join(" and ")} now carr${targets.length === 1 ? "ies" : "y"} ` +
      "the sections[] stack; old fields removed. Check /studio (About Page " +
      "shows populated sections, no 'Unknown fields found') and reload " +
      "localhost /about.",
  );
}

main().catch((error) => {
  console.error("migrate-about-sections failed:", error);
  process.exit(1);
});
