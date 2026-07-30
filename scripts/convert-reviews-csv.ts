/**
 * CSV → data/testimonials.ts converter — run with:
 *   sanity exec scripts/convert-reviews-csv.ts
 *
 * Regenerates the `testimonials` array in `data/testimonials.ts` from the
 * owner's full Google-listing export (`google-reviews-export.csv`). Kept in
 * the repo so the next export is a re-run, not a rewrite.
 *
 * Guarantees:
 *  - Quotes are byte-for-byte from the CSV — typos and all. A self-check at
 *    the end re-reads the CSV and compares every emitted quote literal.
 *  - Rating-only rows (empty text) are skipped and logged; they still count
 *    in the aggregate figure, which lives in reviewSettings, not here.
 *  - Curation on the existing entries (`featured`, `serviceTags`, `role`,
 *    `reviewerMeta`) is matched by reviewer name + quote and carried over.
 *    Existing entries with no CSV counterpart are KEPT and flagged, never
 *    dropped — every removal decision belongs to the owner.
 *
 * Writes only the local data file — it never touches Sanity. The dataset is
 * updated separately by `scripts/import-reviews.ts`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  loadReviewRows,
  monthLabel,
  reviewerMetaFor,
  reviewHash,
  sameQuote,
  type ReviewRow,
} from "./lib/googleReviewsCsv";
import {
  testimonials as previous,
  type Testimonial,
} from "../data/testimonials";

const OUT_PATH = path.join(process.cwd(), "data", "testimonials.ts");

const HEADER = `/**
 * Real customer reviews from Fred's Plumbing's public Google Business
 * Profile — REGENERATED from the owner's full listing export
 * (\`google-reviews-export.csv\`, captured 2026-07-30) by
 * \`scripts/convert-reviews-csv.ts\`. Don't hand-edit quotes here; re-run the
 * converter against a fresh export instead. Curation (\`featured\`,
 * \`serviceTags\`, \`role\`) is hand-maintained and survives regeneration.
 *
 * As of the reviews phase these constants are the FALLBACK: the site reads via
 * \`getTestimonials()\` in \`sanity/lib/getTestimonials.ts\`, which pulls the
 * \`testimonial\` documents from Sanity and only drops back here if the fetch
 * throws.
 *
 * RULES FOR THIS FILE
 * - Every entry must be a real review that exists on the Google listing.
 *   Never invent, paraphrase, "clean up", or extend a quote — Google's terms
 *   require reviews be shown as written, and an invented quote is a legal and
 *   reputational problem, not a copy problem.
 * - \`date\` is the human-readable month of the export's estimated review date
 *   ("2026-07-31" → "July 2026"). The export's relative dates were already
 *   stale at capture time and are never used.
 * - Reviewer profile photos and review photos are deliberately NOT stored or
 *   hotlinked; Google restricts caching them. \`TestimonialCard\` renders an
 *   initial circle.
 * - \`ownerReply\` is stored verbatim but not rendered anywhere yet.
 * - \`serviceTags\` drive which reviews surface on which service / property-type
 *   page. Values must match a real slug in \`data/services.ts\` or
 *   \`data/industries.ts\` — an unknown tag silently shows the review nowhere.
 */

/** Where a review came from. Only Google is wired today. */
export type TestimonialSource = "google" | "direct";

export interface Testimonial {
  /** Stable key — "g-" + a hash of the Google Review ID. Used as the React
   *  key and (prefixed) as the Sanity document id by the import script. */
  id: string;
  name: string;
  role?: string;
  rating: number;
  quote: string;
  date: string;
  featured?: boolean;
  /** Provenance — "google" renders the "Posted on Google" attribution line. */
  source: TestimonialSource;
  /** Deep link to the review platform. Falls back to the listing URL. */
  sourceUrl?: string;
  /** Reviewer standing on Google, e.g. "Local Guide · 32 reviews". */
  reviewerMeta?: string;
  /**
   * Service and property-type slugs this review is relevant to.
   * See \`REVIEW_TAGS\` in \`data/googleReviews.ts\` for the allow-list.
   */
  serviceTags?: string[];
  /** The business's public reply on Google, verbatim. Stored, not rendered. */
  ownerReply?: string;
  /** Relative reply date as captured at export time ("3 months ago"). */
  ownerReplyDate?: string;
}

export const testimonials: Testimonial[] = [
`;

/** Emit one entry as source text; returns the text and the quote literal so
 *  the self-check can verify byte-identity against the CSV. */
function emit(entry: Testimonial, note?: string): { code: string; quoteLiteral: string } {
  const quoteLiteral = JSON.stringify(entry.quote);
  const lines: string[] = [];
  if (note) lines.push(`  // ${note}`);
  lines.push("  {");
  lines.push(`    id: ${JSON.stringify(entry.id)},`);
  lines.push(`    name: ${JSON.stringify(entry.name)},`);
  if (entry.role) lines.push(`    role: ${JSON.stringify(entry.role)},`);
  lines.push(`    rating: ${entry.rating},`);
  lines.push(`    quote:`);
  lines.push(`      ${quoteLiteral},`);
  lines.push(`    date: ${JSON.stringify(entry.date)},`);
  if (entry.featured) lines.push(`    featured: true,`);
  lines.push(`    source: ${JSON.stringify(entry.source)},`);
  if (entry.sourceUrl) lines.push(`    sourceUrl: ${JSON.stringify(entry.sourceUrl)},`);
  if (entry.reviewerMeta)
    lines.push(`    reviewerMeta: ${JSON.stringify(entry.reviewerMeta)},`);
  if (entry.serviceTags?.length)
    lines.push(
      `    serviceTags: [${entry.serviceTags.map((t) => JSON.stringify(t)).join(", ")}],`,
    );
  if (entry.ownerReply) {
    lines.push(`    ownerReply:`);
    lines.push(`      ${JSON.stringify(entry.ownerReply)},`);
    if (entry.ownerReplyDate)
      lines.push(`    ownerReplyDate: ${JSON.stringify(entry.ownerReplyDate)},`);
  }
  lines.push("  },");
  return { code: lines.join("\n"), quoteLiteral };
}

function main() {
  const rows = loadReviewRows();
  const withText = rows.filter((row) => row.text !== "");
  const skipped = rows.filter((row) => row.text === "");

  // Match each existing entry to its CSV row for curation carry-over.
  const matchedPrev = new Map<string, Testimonial>(); // reviewId → prev entry
  const unmatchedPrev: Testimonial[] = [];
  const quoteDiffers: string[] = [];
  for (const prev of previous) {
    const row = withText.find(
      (r) =>
        r.name.toLowerCase() === prev.name.toLowerCase() &&
        sameQuote(r.text, prev.quote),
    );
    if (row) {
      matchedPrev.set(row.reviewId, prev);
      if (row.text !== prev.quote) quoteDiffers.push(prev.name);
    } else {
      unmatchedPrev.push(prev);
    }
  }

  const entries: Array<{ entry: Testimonial; row?: ReviewRow; note?: string }> =
    withText.map((row) => {
      const prev = matchedPrev.get(row.reviewId);
      return {
        row,
        entry: {
          id: reviewHash(row.reviewId),
          name: row.name,
          role: prev?.role,
          rating: row.rating,
          quote: row.text, // verbatim — the self-check below enforces it
          date: monthLabel(row.dateIso),
          featured: prev?.featured,
          source: "google" as const,
          reviewerMeta: prev?.reviewerMeta ?? reviewerMetaFor(row),
          serviceTags: prev?.serviceTags,
          ownerReply: row.ownerReply || undefined,
          ownerReplyDate: row.ownerReply
            ? row.ownerReplyDate || undefined
            : undefined,
        },
      };
    });

  for (const prev of unmatchedPrev) {
    entries.push({
      entry: prev,
      note: "NOT matched to any row in google-reviews-export.csv — kept pending the owner's review.",
    });
  }

  const emitted = entries.map(({ entry, note }) => emit(entry, note));
  const file = `${HEADER}${emitted.map((e) => e.code).join("\n")}\n];\n`;
  writeFileSync(OUT_PATH, file, "utf8");

  // Self-check: re-read the CSV and the written file; every quote literal
  // must decode to exactly the CSV cell, byte for byte.
  const written = readFileSync(OUT_PATH, "utf8");
  const freshRows = new Map(loadReviewRows().map((r) => [r.reviewId, r]));
  let checked = 0;
  entries.forEach(({ entry, row }, i) => {
    const literal = emitted[i].quoteLiteral;
    if (!written.includes(literal)) {
      throw new Error(`Self-check failed: literal for "${entry.name}" not in output.`);
    }
    if (row) {
      const csvText = freshRows.get(row.reviewId)?.text;
      if (JSON.parse(literal) !== csvText) {
        throw new Error(
          `Self-check failed: quote for "${entry.name}" is not byte-identical to its CSV cell.`,
        );
      }
      checked++;
    }
  });

  console.log(
    `✓ Wrote ${entries.length} testimonials to data/testimonials.ts ` +
      `(${withText.length} from the CSV, ${unmatchedPrev.length} legacy kept).`,
  );
  console.log(`✓ Self-check: ${checked} quotes byte-identical to their CSV cells.`);
  console.log(
    `\nSkipped ${skipped.length} rating-only reviews (no text):\n  ` +
      skipped.map((r) => r.name).join(", "),
  );
  console.log(
    `\nCuration carried over for ${matchedPrev.size} of ${previous.length} existing entries.`,
  );
  if (quoteDiffers.length) {
    console.log(
      `\n⚠️  ${quoteDiffers.length} existing entr${quoteDiffers.length === 1 ? "y" : "ies"} had hand-transcribed quotes that differ from the CSV cell (CSV wins):\n  ` +
        quoteDiffers.join(", "),
    );
  }
  if (unmatchedPrev.length) {
    console.log(
      `\n⚠️  ${unmatchedPrev.length} existing entr${unmatchedPrev.length === 1 ? "y" : "ies"} matched NO CSV row — kept at the end of the file, flag for the owner:\n  ` +
        unmatchedPrev.map((t) => `${t.name} (${t.id})`).join(", "),
    );
  }
}

main();
