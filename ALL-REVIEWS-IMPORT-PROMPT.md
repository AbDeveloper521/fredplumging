# Claude Code prompt — load the full Google-review export onto the Testimonials page, with "Show more"

## 0. What you are working with

The owner exported his full public Google listing. The file is committed at the repo root as
**`google-reviews-export.csv`**: 134 reviews, all 5-star, spanning 2025-07-31 → 2026-07-31.
Columns include Review ID (stable, unique), Reviewer name, Rating, relative date ("as shown"),
**estimated date (ISO)**, Review text, photo counts/URLs, Likes, Owner reply + date, Reviewer
total reviews, Local Guide flag, Reviewer profile URL, Edited flag.

Facts about the data you should not rediscover the hard way:

- **17 rows have an empty `Review text`** — rating-only reviews.
- 27 reviewers are Local Guides; 94 rows have an owner reply; 8 have photo URLs
  (all `googleusercontent.com`); 17 are marked edited.
- All 134 Review IDs are unique; no duplicate reviewer names.
- The relative "as shown" dates ("15 minutes ago", "a day ago") were captured at export time
  (2026-07-30) and are already stale — **use `Review date (estimated)` only.**

Read before writing anything: `data/testimonials.ts` (the header comment is the law for this
task), `data/googleReviews.ts` (`REVIEW_TAGS` / `isReviewTag`), `sanity/lib/getTestimonials.ts`,
`app/(site)/about/testimonials/page.tsx`, `components/ui/TestimonialCard.tsx`, and
`scripts/seed-reviews.ts` (as a **warning**, not a template — see §4).

## 1. The one architectural fact that decides everything

`getTestimonials()` reads **Sanity first** and only falls back to `data/testimonials.ts` when
the fetch *throws*. The Sanity dataset currently has the original ~20 testimonial documents
published. Therefore: **updating the static file alone will change nothing on the live site.**
The task has three parts and all three are required — the data file (fallback + source of
truth for the import), the Sanity import script (what actually changes production), and the
page UI ("Show more").

## 2. Part one — regenerate the static data from the CSV

Write a small converter (a one-off script is fine, e.g. `scripts/convert-reviews-csv.ts`,
kept in the repo so the next export can be re-run) that parses `google-reviews-export.csv`
and regenerates the `testimonials` array in `data/testimonials.ts`:

- **Quotes verbatim.** Byte-for-byte from the CSV — typos, missing apostrophes, "Freds", all
  of it. Never trim, correct, shorten or paraphrase. The existing file's header comment
  explains why; keep that comment.
- **Skip the 17 empty-text rows.** A quote card with no quote is nothing. They still count in
  the aggregate (134 total) — that number lives in the `reviewSettings` singleton / hero
  badge, not in this array. Log the skipped names in the script output.
- `id`: derive from the stable `Review ID` (e.g. a short hash or slugified prefix) — NOT from
  name+month; the old scheme collides once the volume grows.
- `date`: format `Review date (estimated)` as the existing entries do ("July 2026").
- `reviewerMeta`: build from Local Guide + total reviews ("Local Guide · 74 reviews" /
  "8 reviews"), matching the existing convention.
- `source: "google"`; `sourceUrl`: follow whatever the existing entries use (check one) — do
  not invent a new URL shape.
- **No photos.** Review photo URLs and reviewer profile URLs are `googleusercontent.com` —
  never downloaded, cached or hotlinked (Google restricts it; the repo rule already says so).
  The initial-circle avatar stays.
- **Owner replies:** store them (add an optional `ownerReply?: string` + date field to the
  `Testimonial` interface) but do **not** render them in this task — flag in your report that
  the data is there if the owner wants a "Response from the owner" treatment later.
- **Preserve the existing entries' curation.** The current ~20 entries carry `featured` flags
  and `serviceTags` that drive the homepage and service pages. Match them to their CSV rows
  (by name + quote prefix) and carry `featured`/`serviceTags`/`role` over onto the regenerated
  entries. New reviews get no tags (untagged = shown everywhere per `getTestimonials`) and
  `featured: false`. List in your report any existing entry you could NOT match to a CSV row
  — do not delete it; keep it and flag it.
- Order: newest first by estimated date (the CSV is already in that order).

## 3. Part two — the Sanity import script (additive-only)

Write `scripts/import-reviews.ts`, run via `sanity exec` with the Editor token, that upserts
the converted reviews as `testimonial` documents:

- Deterministic `_id` derived from the Google `Review ID` (prefix it, e.g.
  `testimonial-g-<hash>`), so re-running the script is idempotent.
- `createIfNotExists` for new reviews. For documents that already exist under these ids,
  patch only if the quote text differs (the 17 "edited" reviews may change between exports).
- The original ~20 documents were created by hand with different ids. Detect them by matching
  name + quote against the CSV rows and **leave them alone** — skip importing their CSV
  counterparts so the same review does not appear twice under two ids. Print the matched
  pairs in the dry run.
- **Read-only by default; writes only with `--confirm`. It must never delete anything** — no
  document deletes, no array-item deletes, under any flag. `scripts/seed-reviews.ts` contains
  a blanket-delete pattern (`!(_id in $ids)` → `tx.delete`); do not imitate it. This script
  must be structurally incapable of removing a review.
- Set the `order` field consistently with newest-first (check how the existing docs use it).
- Do not run `--confirm` yourself. Report the dry-run summary (to create / to patch / matched
  existing / skipped empty) and let the owner run the confirm pass.

## 4. Part three — "Show more" on the Testimonials page

The page currently renders every testimonial at once in the three-column layout. With ~117
text reviews that is a wall. Change the grid on `/about/testimonials` to progressive reveal:

- New client component (e.g. `components/ui/TestimonialsExplorer.tsx` — name it however the
  repo conventions suggest) that receives the full serialized array from the server component
  and renders the first **20**, with a centred **"Show more reviews"** button beneath that
  reveals 20 more per click and disappears when everything is visible.
- Under or inside the button, a quiet count — "Showing 20 of 117" — updated per click.
- Accessibility: the button is a real `<button>`; after a click, move focus to the first
  newly revealed card (or use a polite live-region announcement) so keyboard and screen-reader
  users aren't stranded; cards keep whatever heading/list semantics they have today.
- Keep the existing `TestimonialCard` untouched and keep the current column layout. If the
  columns are CSS `columns-*` masonry, check that revealing in batches doesn't reshuffle
  already-visible cards distractingly; if it does, switch the page to a plain 3-column grid —
  say which you chose.
- The `Reveal`-on-scroll animation on newly-appended cards should either work correctly or be
  omitted for appended batches — no cards stuck invisible because their intersection observer
  never fired.
- Server component still fetches via `getTestimonials()`; no fetch-on-click, no pagination
  URLs, no infinite scroll.

Also update the stale numbers around the page: the metadata description says "133 Google
reviews", and the hero badge / `reviewSettings` singleton carries the count and "as of" date.
Code-side defaults update to 134 / July 2026; if the live values come from the
`reviewSettings` document in Sanity, tell the owner in the report to update that in Studio
(do not write to the dataset outside the import script).

## 5. Do not

- No `AggregateRating`, `review`, or `@type: "Review"` structured data — showing real reviews
  in HTML is fine; marking them up on your own business risks a manual action. Site-wide rule.
- Do not touch `sanity/lib/getGoogleReviews.ts` (billed Places API, separate system).
- Do not render reviewer profile photos or review photos from Google.
- Do not "de-duplicate" by deleting anything anywhere; every removal decision belongs to the
  owner.
- Do not reformat or re-wrap the CSV file itself; it is the source record.

## 6. Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run typegen`, `npm run check:drift`
   all clean (typegen/drift only if the schema gained `ownerReply` — add it to the schema if
   you add it to the type, keeping the two mirrored).
2. Converter output: 117 entries with text, 17 skipped, every quote byte-identical to its CSV
   cell — write a tiny assertion in the converter that re-reads the CSV and compares, rather
   than eyeballing.
3. `npm run dev` → `/about/testimonials`: 20 cards, button, click through to the end — count
   reaches 117, button disappears, no console errors, no card stuck invisible. 375px / 768px /
   1024px / 1440px.
4. Homepage and service pages still show their curated/featured reviews unchanged (fallback
   data path: temporarily unset the Sanity env vars locally if needed to see the static path).
5. Import script dry run prints a sane plan and creates/patches nothing without `--confirm`.
6. One commit.

## 7. Report back

- Converter summary: imported / skipped-empty / matched-to-existing / unmatched-existing.
- The dry-run plan from the import script, and the exact command the owner runs to confirm.
- Whether `reviewSettings` in Studio needs the count/date updated by hand (it does if Sanity
  wins at runtime — say the two field names).
- Masonry vs. grid decision for the reveal, and why.
- Confirmation that owner replies are stored but unrendered, awaiting a decision.
