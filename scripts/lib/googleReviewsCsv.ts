/**
 * Shared parsing for `google-reviews-export.csv` — the owner's full public
 * Google-listing export (134 reviews, captured 2026-07-30). Used by
 * `scripts/convert-reviews-csv.ts` (regenerates data/testimonials.ts) and
 * `scripts/import-reviews.ts` (upserts testimonial documents into Sanity).
 *
 * The CSV is the source record: never reformat or re-wrap the file itself,
 * and never "fix" a review's text — quotes are carried byte-for-byte.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

export const CSV_PATH = path.join(process.cwd(), "google-reviews-export.csv");

export interface ReviewRow {
  /** Google's stable, unique review id (base64). */
  reviewId: string;
  name: string;
  rating: number;
  /** `Review date (estimated)` — the only date column worth using; the
   *  relative "as shown" dates were stale the moment the export finished. */
  dateIso: string;
  /** Review text, byte-for-byte from the CSV cell. Empty = rating-only. */
  text: string;
  ownerReply: string;
  /** Relative, as captured at export time ("3 months ago"). */
  ownerReplyDate: string;
  totalReviews: number;
  localGuide: boolean;
  edited: boolean;
}

/** Minimal RFC 4180 parser — quoted fields, "" escapes, CRLF/LF rows. */
export function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inQuotes) {
      if (ch === '"') {
        if (raw[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && raw[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop blank lines (e.g. a trailing newline).
  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

/** All 134 rows, newest first (the export's own order). Throws loudly if a
 *  column this pipeline depends on is missing or renamed. */
export function loadReviewRows(csvPath: string = CSV_PATH): ReviewRow[] {
  const raw = readFileSync(csvPath, "utf8").replace(/^﻿/, "");
  const [header, ...rows] = parseCsv(raw);

  const col = (name: string): number => {
    const index = header.indexOf(name);
    if (index === -1) {
      throw new Error(
        `google-reviews-export.csv is missing the "${name}" column — ` +
          `found: ${header.join(", ")}`,
      );
    }
    return index;
  };

  const reviewId = col("Review ID");
  const name = col("Reviewer name");
  const rating = col("Rating (stars)");
  const dateIso = col("Review date (estimated)");
  const text = col("Review text");
  const ownerReply = col("Owner reply");
  const ownerReplyDate = col("Owner reply date");
  const totalReviews = col("Reviewer total reviews");
  const localGuide = col("Local Guide");
  const edited = col("Edited");

  return rows.map((cells, i) => {
    if (!cells[reviewId] || !cells[name]) {
      throw new Error(`CSV row ${i + 2} has no Review ID / Reviewer name.`);
    }
    return {
      reviewId: cells[reviewId],
      name: cells[name],
      rating: Number(cells[rating]),
      dateIso: cells[dateIso],
      text: cells[text] ?? "",
      ownerReply: cells[ownerReply] ?? "",
      ownerReplyDate: cells[ownerReplyDate] ?? "",
      totalReviews: Number(cells[totalReviews] || 0),
      localGuide: cells[localGuide] === "yes",
      edited: cells[edited] === "yes",
    };
  });
}

/** Stable short id from the Google Review ID: "g-" + 10 hex chars. */
export function reviewHash(reviewId: string): string {
  return `g-${createHash("sha256").update(reviewId).digest("hex").slice(0, 10)}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2026-07-31" → "July 2026", matching the existing entries' format. */
export function monthLabel(dateIso: string): string {
  const match = /^(\d{4})-(\d{2})/.exec(dateIso);
  if (!match) throw new Error(`Unparseable estimated date: "${dateIso}"`);
  return `${MONTHS[Number(match[2]) - 1]} ${match[1]}`;
}

/** "Local Guide · 74 reviews" / "8 reviews" / "1 review", per convention. */
export function reviewerMetaFor(row: ReviewRow): string | undefined {
  const parts: string[] = [];
  if (row.localGuide) parts.push("Local Guide");
  if (row.totalReviews > 0) {
    parts.push(`${row.totalReviews} review${row.totalReviews === 1 ? "" : "s"}`);
  }
  return parts.length ? parts.join(" · ") : undefined;
}

/** Loose text identity for matching hand-transcribed quotes to CSV cells —
 *  folds case, punctuation (curly vs straight apostrophes), and spacing so
 *  only the words themselves have to agree. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** True when a hand-kept quote and a CSV cell are the same review's text —
 *  exact after whitespace-normalization, or one is a prefix of the other
 *  (transcriptions were occasionally clipped). */
export function sameQuote(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  const prefix = Math.min(na.length, nb.length, 60);
  return prefix >= 30 && na.slice(0, prefix) === nb.slice(0, prefix);
}
