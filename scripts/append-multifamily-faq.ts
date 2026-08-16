/**
 * Appends the shared multi-family Q&A band to /multifamily and every
 * /multifamily/[slug] page, and creates the FAQ set those bands point at.
 * Dry run:
 *   sanity exec scripts/append-multifamily-faq.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/append-multifamily-faq.ts -- --confirm
 *
 * ⚠️  BEFORE RUNNING --confirm: close (or hard-reload) every open Studio tab
 * showing Multifamily Index Page, a Property Type, or FAQ Sets. A stale tab
 * holding an old draft that presses Publish afterwards will overwrite what
 * this writes — this exact accident happened with the About page.
 *
 * Why this is not a seeder: every seed-*.ts script REFUSES to run on a
 * non-empty `sections[]`, which is correct — they write a whole stack and
 * must never clobber the owner's work. These pages are already built, so
 * this script does the opposite: it only ever APPENDS one section to the end
 * of a stack it otherwise does not read, reorder, edit, or shorten.
 *
 * What it does, and ALL it can do:
 *  - Finds its targets by QUERYING the dataset (the multifamilyIndexPage
 *    singleton + every `industry` document, published and draft), so a
 *    property type added later is picked up instead of silently missed.
 *  - Appends ONE `faqBand` section, referencing the shared FAQ set, to the
 *    END of each target's `sections[]`.
 *  - IDEMPOTENT: a document that already carries a `faqBand` section is
 *    skipped and reported. Running twice cannot produce two bands.
 *  - Creates the `faqSet` document if it is missing. If one already exists
 *    WITH questions it is left completely alone — the owner's edits win over
 *    the copy in data/faqSets.ts.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no asset
 * operations, no unsetting of fields, no other document types, under any
 * flag. It has no code path that removes or replaces an existing section.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import {
  MULTIFAMILY_FAQ_SET,
  MULTIFAMILY_FAQ_SET_ID,
  UNQUANTIFIED_ANSWERS,
} from "../data/faqSets";
import {
  bandSection,
  faqSetDocument,
  inspect,
  type Raw,
  type Target,
} from "./lib/multifamilyFaq";

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
  console.log(
    "⚠️  Close or hard-reload any open Studio tab showing Multifamily Index " +
      "Page, a Property Type, or FAQ Sets before --confirm — a stale tab " +
      "pressing Publish afterwards overwrites what this writes (this happened " +
      "with the About page).\n",
  );

  // Targets come from the dataset, never a hardcoded list: a property type
  // created after this script was written must not be missed.
  const docs = await client.fetch<Array<Raw & { _id: string; _type: string }>>(
    `*[_id == "multifamilyIndexPage" || _id == "drafts.multifamilyIndexPage" || _type == "industry"]
       | order(_id asc){ _id, _type, title, "slug": slug.current, sections }`,
  );

  console.log(`Documents found (${docs.length}):`);
  for (const doc of docs) {
    const label =
      doc._type === "industry"
        ? `${doc.title ?? "(untitled)"} — /multifamily/${doc.slug ?? "?"}`
        : "/multifamily (index page)";
    const sections = Array.isArray(doc.sections) ? doc.sections.length : 0;
    console.log(
      `  • ${doc._id} [${doc._type}] — ${label}; ${sections} section(s)`,
    );
  }
  if (docs.length === 0) {
    console.error(
      "\nSTOP: no multifamily documents found at all. That is not an expected " +
        "state — check the dataset before doing anything else. Nothing was changed.",
    );
    process.exit(1);
  }

  const targets: Target[] = docs.map((doc) => inspect(doc._id, doc));
  const toAppend = targets.filter((target) => !target.hasBand);
  const skipped = targets.filter((target) => target.hasBand);

  const [faqSetDoc, faqSetDraft] = await Promise.all([
    client.fetch<Raw | null>(`*[_id == $id][0]`, { id: MULTIFAMILY_FAQ_SET_ID }),
    client.fetch<Raw | null>(`*[_id == $id][0]`, {
      id: `drafts.${MULTIFAMILY_FAQ_SET_ID}`,
    }),
  ]);
  const existingItems = (doc: Raw | null) =>
    doc && Array.isArray(doc.items) ? doc.items.length : 0;
  const setHasContent =
    existingItems(faqSetDoc) > 0 || existingItems(faqSetDraft) > 0;

  console.log("\nFAQ set:");
  if (setHasContent) {
    console.log(
      `  • ${MULTIFAMILY_FAQ_SET_ID} already exists with ` +
        `${Math.max(existingItems(faqSetDoc), existingItems(faqSetDraft))} question(s) — ` +
        "LEFT UNTOUCHED. Whatever is published there is what the bands will show; " +
        "edit it in /studio under FAQ Sets.",
    );
  } else if (faqSetDoc || faqSetDraft) {
    console.log(
      `  • ${MULTIFAMILY_FAQ_SET_ID} exists but has no questions — the ` +
        `${MULTIFAMILY_FAQ_SET.items.length} questions from data/faqSets.ts will be added.`,
    );
  } else {
    console.log(
      `  • ${MULTIFAMILY_FAQ_SET_ID} does not exist — it will be CREATED with ` +
        `${MULTIFAMILY_FAQ_SET.items.length} questions from data/faqSets.ts:`,
    );
    MULTIFAMILY_FAQ_SET.items.forEach((item, i) => {
      console.log(`      ${i + 1}. ${item.question}`);
    });
  }

  console.log("\nSections to append (one per document, at the END of the stack):");
  if (toAppend.length === 0) {
    console.log("  (none — every target already carries a Q&A band)");
  }
  for (const target of toAppend) {
    console.log(
      `  • ${target.id}: insert faqBand (_key: ${target.key}) at position ` +
        `${target.length + 1}` +
        (target.createArray ? " — sections array will be created" : ""),
    );
  }
  if (skipped.length > 0) {
    console.log("\nSkipped — already has a Q&A band (idempotent, nothing to do):");
    for (const target of skipped) console.log(`  • ${target.id}`);
  }

  console.log(
    "\nStill unquantified in the answers (get the real figures from the client, " +
      "then edit them in /studio → FAQ Sets → Multi-Family FAQs):",
  );
  for (const gap of UNQUANTIFIED_ANSWERS) {
    console.log(`  • ${gap.itemKey}: ${gap.missing}`);
  }

  if (!confirm) {
    console.log(
      "\nDRY RUN — nothing written. To apply exactly the plan above:\n" +
        "  npx sanity exec scripts/append-multifamily-faq.ts -- --confirm",
    );
    return;
  }

  // One transaction. Every operation below is a create-if-missing or an
  // append; nothing here can remove or replace existing content.
  let transaction = client.transaction();

  if (!setHasContent) {
    // createIfNotExists then patch, so an existing-but-empty document is
    // filled rather than replaced.
    const doc = faqSetDocument();
    transaction = transaction.createIfNotExists({
      _id: MULTIFAMILY_FAQ_SET_ID,
      _type: "faqSet",
    });
    transaction = transaction.patch(MULTIFAMILY_FAQ_SET_ID, (patch) =>
      patch.set({
        title: doc.title,
        ...(doc.heading ? { heading: doc.heading } : {}),
        ...(doc.intro ? { intro: doc.intro } : {}),
        items: doc.items,
      }),
    );
  }

  for (const target of toAppend) {
    const section = bandSection(target.key);
    transaction = transaction.patch(target.id, (patch) =>
      target.createArray
        ? patch.setIfMissing({ sections: [] }).set({ sections: [section] })
        : patch.insert("after", "sections[-1]", [section]),
    );
  }

  await transaction.commit();

  console.log(
    `\nDone. Appended the Q&A band to ${toAppend.length} document(s)` +
      (skipped.length ? `, skipped ${skipped.length} that already had one` : "") +
      ". Reload /multifamily and a property-type page — the band is at the " +
      "bottom, and editing one answer under FAQ Sets changes it on all of them. " +
      "Running this script again is safe: it will report every document as skipped.",
  );
}

main().catch((error) => {
  console.error("append-multifamily-faq failed:", error);
  process.exit(1);
});
