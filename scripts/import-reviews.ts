/**
 * Additive Google-review import — dry run:
 *   sanity exec scripts/import-reviews.ts
 * write pass (owner runs this after reading the plan):
 *   sanity exec scripts/import-reviews.ts -- --confirm
 *
 * Upserts the converted reviews in `data/testimonials.ts` (regenerated from
 * `google-reviews-export.csv` by scripts/convert-reviews-csv.ts) as
 * `testimonial` documents:
 *
 *  - Deterministic ids — `testimonial-g-<hash of the Google Review ID>` — so
 *    re-running after the next export is idempotent.
 *  - `createIfNotExists` for new reviews; an existing g-doc is patched ONLY
 *    if its quote text differs (Google reviews can be edited between exports).
 *  - The ~20 hand-created documents (different id scheme) are detected by
 *    reviewer name + quote and left alone — their CSV counterparts are NOT
 *    imported under a second id. Only their `order` is aligned so the whole
 *    collection sorts newest-first.
 *
 * THIS SCRIPT MUST NEVER DELETE ANYTHING — no document deletes, no array-item
 * deletes, under any flag. (scripts/seed-reviews.ts contains a blanket-delete
 * pattern; it is NOT the template.) Every removal decision belongs to the
 * owner, in the Studio.
 *
 * Auth: needs SANITY_API_WRITE_TOKEN (Editor scope) for --confirm.
 */
import { getCliClient } from "sanity/cli";
import { testimonials } from "../data/testimonials";
import { loadReviewRows, sameQuote } from "./lib/googleReviewsCsv";

interface ExistingDoc {
  _id: string;
  name: string;
  quote: string;
  order?: number;
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

  const existing = await client.fetch<ExistingDoc[]>(
    `*[_type == "testimonial"]{_id, name, quote, order}`,
  );
  const byId = new Map(existing.map((doc) => [doc._id, doc]));
  const skippedEmpty = loadReviewRows().filter((row) => row.text === "").length;

  const toCreate: Array<{ _id: string; doc: Record<string, unknown> }> = [];
  const toPatchQuote: Array<{ _id: string; name: string; quote: string }> = [];
  const legacyMatched: Array<{ _id: string; name: string; order: number }> = [];
  const claimedLegacy = new Set<string>();

  testimonials.forEach((entry, i) => {
    const _id = `testimonial-${entry.id}`;
    const order = (i + 1) * 10;

    const own = byId.get(_id);
    if (own) {
      // Re-run after a fresh export: touch only edited quotes.
      if (own.quote !== entry.quote) {
        toPatchQuote.push({ _id, name: entry.name, quote: entry.quote });
      }
      return;
    }

    // A hand-created doc for the same review, under the old id scheme?
    const legacy = existing.find(
      (doc) =>
        !claimedLegacy.has(doc._id) &&
        !doc._id.startsWith("testimonial-g-") &&
        doc.name.toLowerCase() === entry.name.toLowerCase() &&
        sameQuote(doc.quote, entry.quote),
    );
    if (legacy) {
      claimedLegacy.add(legacy._id);
      legacyMatched.push({ _id: legacy._id, name: entry.name, order });
      return;
    }

    toCreate.push({
      _id,
      doc: {
        _id,
        _type: "testimonial",
        name: entry.name,
        ...(entry.role ? { role: entry.role } : {}),
        rating: entry.rating,
        quote: entry.quote,
        date: entry.date,
        featured: entry.featured ?? false,
        source: entry.source,
        ...(entry.reviewerMeta ? { reviewerMeta: entry.reviewerMeta } : {}),
        ...(entry.sourceUrl ? { sourceUrl: entry.sourceUrl } : {}),
        ...(entry.serviceTags?.length
          ? { serviceTags: [...entry.serviceTags] }
          : {}),
        ...(entry.ownerReply ? { ownerReply: entry.ownerReply } : {}),
        ...(entry.ownerReplyDate ? { ownerReplyDate: entry.ownerReplyDate } : {}),
        verified: true,
        order,
      },
    });
  });

  const untouched = existing.filter(
    (doc) =>
      !claimedLegacy.has(doc._id) &&
      !testimonials.some((entry) => `testimonial-${entry.id}` === doc._id),
  );

  console.log(
    `Plan for project "${projectId}", dataset "${dataset}" ` +
      `(${existing.length} testimonial documents published):\n` +
      `  create              ${toCreate.length}  (createIfNotExists, id "testimonial-g-…")\n` +
      `  patch quote         ${toPatchQuote.length}  (existing g-docs whose text changed)\n` +
      `  matched existing    ${legacyMatched.length}  (hand-created docs — left alone, order aligned)\n` +
      `  skipped empty       ${skippedEmpty}  (rating-only CSV rows, never imported)\n` +
      `  untouched other     ${untouched.length}  (published docs with no CSV counterpart — left alone)`,
  );
  if (legacyMatched.length) {
    console.log(
      `\nMatched hand-created documents (kept under their original ids):\n` +
        legacyMatched.map((m) => `  ${m.name}  ←  ${m._id}`).join("\n"),
    );
  }
  if (toPatchQuote.length) {
    console.log(
      `\nQuote patches:\n` +
        toPatchQuote.map((p) => `  ${p.name}  (${p._id})`).join("\n"),
    );
  }
  if (untouched.length) {
    console.log(
      `\nPublished docs with no CSV counterpart (flag for the owner, never deleted):\n` +
        untouched.map((d) => `  ${d.name}  (${d._id})`).join("\n"),
    );
  }

  if (!confirm) {
    console.log(
      `\nDry run — nothing written. To apply:\n` +
        `  sanity exec scripts/import-reviews.ts -- --confirm`,
    );
    return;
  }

  const tx = client.transaction();
  toCreate.forEach(({ doc }) => tx.createIfNotExists(doc as never));
  toPatchQuote.forEach(({ _id, quote }) => tx.patch(_id, { set: { quote } }));
  legacyMatched.forEach(({ _id, order }) => tx.patch(_id, { set: { order } }));
  await tx.commit();

  console.log(
    `\n✓ Committed: ${toCreate.length} created, ${toPatchQuote.length} quotes patched, ` +
      `${legacyMatched.length} order-aligned. Nothing was deleted.\n` +
      `  Next: update the Google Reviews singleton in /studio (reviewCount, verifiedOn),\n` +
      `  then npm run check:drift.`,
  );
}

main().catch((error) => {
  console.error("import-reviews failed:", error);
  process.exit(1);
});
