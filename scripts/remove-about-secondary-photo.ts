/**
 * Cleanup for the removed "Small overlapping photo" fields — run with:
 *
 *   sanity exec scripts/remove-about-secondary-photo.ts             (dry run)
 *   sanity exec scripts/remove-about-secondary-photo.ts -- --confirm
 *
 * The schema no longer has `photoSecondary` / `photoSubjectSecondary` on
 * `serviceAbout` sections, but values already stored in the dataset remain
 * and show a yellow "Unknown fields found" notice in the Studio. This script
 * `unset`s exactly those two keys on `sections[]` items whose `_type` is
 * `serviceAbout` — and nothing else.
 *
 * Safety, by construction:
 * - READ-ONLY unless `--confirm` is passed: the default run only prints what
 *   it would change.
 * - The only mutation it can issue is `patch(...).unset([...])` with paths
 *   scoped to `sections[_type=="serviceAbout"].photoSecondary` /
 *   `.photoSubjectSecondary`.
 * - It never deletes a document, never deletes an array item, and never
 *   touches any other field. (Deliberately unlike scripts/seed-reviews.ts,
 *   whose blanket-delete pattern must not be imitated.)
 */
import { getCliClient } from "sanity/cli";

const confirm = process.argv.includes("--confirm");

const client = getCliClient({ apiVersion: "2026-07-01" });

type Doc = {
  _id: string;
  _type: string;
  slug: string | null;
  sections: Array<{
    _key: string | null;
    photoSecondary: unknown;
    photoSubjectSecondary: string | null;
  }> | null;
};

async function main() {
  // Drafts included on purpose: an orphaned key on a draft would resurface
  // the Studio notice the next time the document is opened.
  const docs = await client.fetch<Doc[]>(
    `*[_type in ["service", "industry"] && defined(sections)]{
      _id,
      _type,
      "slug": slug.current,
      "sections": sections[_type == "serviceAbout"]{
        _key,
        photoSecondary,
        photoSubjectSecondary
      }
    }`,
  );

  const affected = docs
    .map((doc) => ({
      ...doc,
      orphaned: (doc.sections ?? []).filter(
        (section) =>
          section.photoSecondary != null ||
          section.photoSubjectSecondary != null,
      ),
    }))
    .filter((doc) => doc.orphaned.length > 0);

  if (affected.length === 0) {
    console.log(
      "No documents carry photoSecondary / photoSubjectSecondary values — nothing to clean.",
    );
    return;
  }

  console.log(
    `${affected.length} document(s) carry orphaned values on serviceAbout sections:\n`,
  );
  for (const doc of affected) {
    console.log(`• ${doc._type} "${doc.slug}" (${doc._id})`);
    for (const section of doc.orphaned) {
      const keys = [
        section.photoSecondary != null ? "photoSecondary" : null,
        section.photoSubjectSecondary != null
          ? `photoSubjectSecondary = ${JSON.stringify(section.photoSubjectSecondary)}`
          : null,
      ].filter(Boolean);
      console.log(`    section _key ${section._key}: ${keys.join(", ")}`);
    }
  }

  if (!confirm) {
    console.log(
      "\nDry run — nothing was changed. Re-run with `-- --confirm` to unset " +
        "these two keys (and only these two keys) on the sections listed above.",
    );
    return;
  }

  for (const doc of affected) {
    await client
      .patch(doc._id)
      .unset([
        `sections[_type=="serviceAbout"].photoSecondary`,
        `sections[_type=="serviceAbout"].photoSubjectSecondary`,
      ])
      .commit();
    console.log(`unset done: ${doc._type} "${doc.slug}" (${doc._id})`);
  }
  console.log(`\nCleaned ${affected.length} document(s).`);
}

main().catch((error) => {
  console.error("remove-about-secondary-photo failed to run:", error);
  process.exit(1);
});
