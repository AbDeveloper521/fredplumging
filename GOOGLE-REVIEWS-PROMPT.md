# Claude Code prompt — integrate the real Google reviews

Paste everything below the line into Claude Code, from the repo root
(`C:\Users\abdul\Downloads\plumber`).

Two files are being handed to you alongside this prompt and should be copied
into the repo **before** running it:

- `data/testimonials.ts` — **replaces** the existing file. 20 real reviews,
  transcribed verbatim from the live Google listing on 28 July 2026. All eight
  invented / `[REVIEW TEXT — …]` placeholder entries are gone.
- `data/googleReviews.ts` — **new**. Listing identifiers, the verified
  aggregate (5.0 · 133), the `REVIEW_TAGS` allow-list and the
  `reviewsForTags()` selector.

---

You are working in an existing Next.js 16 + Tailwind v4 + Sanity project.
Read `CLAUDE.md` first and follow every convention in it. In particular:

- This Next.js version has breaking changes vs. your training data — read the
  relevant guide in `node_modules/next/dist/docs/01-app/` before writing any
  Next.js-specific code.
- Tailwind v4, CSS-first. Tokens live in the `@theme` block in
  `app/globals.css`. **There is no `tailwind.config` file — do not create one.**
- Server Components by default. `"use client"` only where genuinely needed.
- Named exports, one component per file, PascalCase filenames.
- Compose classes with `cn()` from `@/lib/utils`, never string concatenation.
- No hardcoded business facts in components — they come from `data/site.ts`
  via `getSite()`.
- There is no test suite. Verify with `npm run lint` and `npm run build`.

## Goal

Replace the dummy testimonials with the client's real Google reviews, and
surface them on the homepage, on **every** service page, on the property-type
pages, and on a real `/about/testimonials` page — all of it CMS-editable
through the existing Sanity setup, with the static `data/*.ts` files as the
fallback layer exactly like every other content type in this repo.

## Hard constraints — read these before writing code

1. **Never invent, paraphrase, shorten or "fix" a review quote.** Google's
   terms require reviews to be displayed as written. The 20 quotes in
   `data/testimonials.ts` are already verbatim; treat them as immutable data.
2. **Do not cache or hotlink reviewer profile photos.** Google restricts this.
   `TestimonialCard` already renders a generated initial circle — keep it.
3. **Do not add `AggregateRating` to `components/seo/JsonLd.tsx`.** Google does
   not allow a business to mark up its own rating for its own
   LocalBusiness/Organization entity; self-serving review markup is ineligible
   for rich results and risks a structured-data manual action. The 5.0 / 133
   figures belong in visible page copy only. If you find yourself adding
   `aggregateRating`, `review`, or `@type: "Review"` anywhere in `JsonLd.tsx`,
   stop — that is out of scope and actively harmful.
4. Reviews are first-party content the client controls in Sanity. The Google
   Places API is **not** the runtime source: it hard-caps at 5 reviews per
   place, cannot paginate to 133, and cannot choose which 5. Build the Places
   layer as an optional, off-by-default refresh helper only (step 7).

## Step 1 — extend the testimonial schema

`sanity/schemas/testimonial.ts`. Keep every existing field and its validation
messages verbatim. Add, after `rating`:

- `source` — string, `list` of `{title: "Google", value: "google"}` and
  `{title: "Direct / email", value: "direct"}`, `layout: "radio"`,
  `initialValue: "google"`, required. Description in the same plain-English
  voice as the existing fields: explains that Google reviews show a "Posted on
  Google" line, and that only reviews actually published on Google may be
  marked as Google.
- `reviewerMeta` — string, optional. e.g. "Local Guide · 32 reviews".
- `sourceUrl` — url, optional, `validation: Rule.uri({scheme: ["https"]})`.
- `serviceTags` — array of string, `layout: "tags"`, optional. The description
  must tell the client these decide which service and property-type pages the
  review appears on, and list the valid slugs.
- `verified` — boolean, `initialValue: true`, description explaining it means
  "someone confirmed this review exists on the public listing".

Update `preview.prepare` so the subtitle shows `role ?? reviewerMeta` and the
title keeps its `★ ` prefix for featured.

## Step 2 — new `reviewSettings` singleton

Create `sanity/schemas/reviewSettings.ts`, a document type named
`reviewSettings` with a fixed id, mirroring how `siteSettings` is written
(same commenting style, same tone of validation messages). Fields:

`rating` (number, 0–5, initialValue 5), `reviewCount` (number, integer, min 0,
initialValue 133), `verifiedOn` (string, e.g. "July 2026"), `reviewsUrl` (url,
https only, required), `writeReviewUrl` (url, https only, optional),
`headline` (string, optional — overrides the default section eyebrow).

Add a `description` on the type itself warning the client that `rating` and
`reviewCount` are shown to visitors as facts about the Google listing and must
be kept in step with it.

Then:

- Register it in `sanity/schemas/index.ts` (import + add to `schemaTypes`).
- Pin it in `sanity/structure.ts` as a singleton, immediately after
  "Navigation Menu", titled **"Google Reviews"**, `.id("reviewSettings")`,
  `S.document().schemaType("reviewSettings").documentId("reviewSettings")`.

## Step 3 — queries

`sanity/queries.ts`. Extend `TESTIMONIALS_QUERY` to project the new fields and
add `"id": _id`:

```
*[_type == "testimonial"] | order(order asc){
  "id": _id, name, role, rating, quote, date, featured,
  source, reviewerMeta, sourceUrl, serviceTags, verified
}
```

Add `REVIEW_SETTINGS_QUERY` following the exact shape of
`SITE_SETTINGS_QUERY` (`*[_type == "reviewSettings" && _id == "reviewSettings"][0]{…}`).

## Step 4 — fetchers

`sanity/lib/getTestimonials.ts` — keep the existing structure, tag, revalidate
value, and the `logEmpty` comment about deleted testimonials not resurrecting
from the fallback (that reasoning still holds and is more important now that
the quotes are real people's words). Map the new fields, defaulting
`source` to `"google"`, and filter `serviceTags` through `isReviewTag()` from
`@/data/googleReviews` so an unknown slug is dropped rather than silently
hiding the review everywhere.

Create `sanity/lib/getReviewSettings.ts` following `getSite()` exactly:
`REVIEW_SETTINGS_TAG = "reviewSettings"`, same `next: { revalidate, tags }`
shape, `logFallback` on error, falling back to the `googleReviews` constant in
`data/googleReviews.ts`.

Add both tags to whatever tag map `app/api/revalidate/route.ts` uses, so a
Studio publish busts the right caches.

## Step 5 — components

**New `components/ui/GoogleRatingBadge.tsx`** — a small server component taking
`{ profile, variant?: "light" | "dark", className? }`. Renders the four-colour
Google "G" as an inline SVG (blue `#4285F4`, green `#34A853`, yellow `#FBBC05`,
red `#EA4335` — do not recolour it to the brand palette, Google's brand
guidelines forbid that), the rating, a 5-star row, and "133 Google reviews" as
a link to `profile.reviewsUrl` with `target="_blank"` and
`rel="noopener noreferrer"`. Include a visually-hidden "(opens in a new tab)".
Dark variant sits on `navy-900`; light on white/offwhite.

**`components/ui/TestimonialCard.tsx`** — keep the existing figure/figcaption
structure, the `Stars` subcomponent, the initial-circle avatar and the featured
variant. Add: when `testimonial.source === "google"`, a small Google "G" mark
in the card's top-right (aligned with the star row) with
`aria-label="Posted on Google"`, and render `reviewerMeta` in the caption line
when `role` is absent, so the line reads e.g. `Local Guide · 32 reviews · July 2026`.
If `sourceUrl` is present, wrap the date in a link to it.

**`components/sections/TestimonialsSection.tsx`** — keep the existing layout
(featured card spanning two columns, then the supporting grid) and the
`return null` on empty. Change the props to:

```ts
interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  site: SiteContent;
  profile: GoogleReviewProfile;
  heading?: string;
  titleId?: string;
  /** Service / property-type slugs to prefer. Omit on the homepage. */
  filterTags?: string[];
  /** Link to the full /about/testimonials page. Defaults true off-homepage. */
  showAllLink?: boolean;
}
```

Select what to render with `reviewsForTags(testimonials, filterTags, { limit: 4 })`
from `@/data/googleReviews`. Replace the middle "5-star client feedback"
summary metric with `<GoogleRatingBadge>`; keep the years-in-business and 24/7
metrics as they are. Under the grid add a row with a link to
`/about/testimonials` ("Read all {profile.reviewCount} reviews") and an
outbound link to `profile.reviewsUrl`. Key the mapped cards on
`testimonial.id`, not `name`.

## Step 6 — wire it into every page

**`data/serviceSections.ts`** — extend the section interface:

```ts
export interface ServiceTestimonialsSection extends SectionBase {
  _type: "serviceTestimonials";
  heading: string;
  /** Slugs to prefer; empty means "most recent overall". */
  filterTags?: string[];
  /** Max cards, 1–6. Defaults to 4. */
  limit?: number;
}
```

**`sanity/schemas/serviceSections.ts`** — add matching fields to the
`serviceTestimonials` object (`filterTags` as a tags array with a description
listing the valid slugs; `limit` as a number, 1–6, initialValue 4). Update its
`preview.prepare` subtitle to mention the tags when present.

**`sanity/lib/sections.ts`** — replace the one-line `serviceTestimonials` case
with validation in the same style as its neighbours: filter `filterTags`
through `isReviewTag()`, clamp `limit` to 1–6, and return `undefined` for both
when absent. Do **not** make the section fail validation when tags are missing
— an untagged section is valid and shows the most recent reviews.

**`components/sections/ServiceSectionRenderer.tsx`** — add `profile:
GoogleReviewProfile` to the props, and pass `filterTags={section.filterTags}`,
`limit={section.limit}` and `profile` through in the `serviceTestimonials`
case. Leave `SECTION_IDS` alone — `client-reviews` is already correct.

**`app/(site)/services/[slug]/page.tsx`** — add `getReviewSettings()` to the
existing `Promise.all`, pass `profile` to `ServiceSectionRenderer`. Nothing
else on this page changes; do not touch the JSON-LD block.

Do the same in the industry/property-type detail page
(`app/(site)/multifamily/[slug]/page.tsx`) and anywhere else that renders
`ServiceSectionRenderer` or `TestimonialsSection` — grep for both and fix every
call site so the build type-checks.

**Homepage** (`app/(site)/page.tsx`) — pass `profile`, no `filterTags`.

**Service pages that have no `serviceTestimonials` section in their Sanity
document:** append one in the seed/section defaults if this repo has a seeding
script under `scripts/` — every service page must end up with a reviews
section. If there is no such script, say so in your summary instead of
inventing one, and list which services need the section added in the Studio.
Sensible tags per service slug:

| service slug | filterTags |
|---|---|
| `emergency-plumbing` | `emergency-plumbing` |
| `commercial-plumbing` | `commercial-plumbing`, `maintenance` |
| `drain-sewer` | `drain-sewer` |
| `plumbing` | `plumbing` |
| `maintenance` | `maintenance`, `commercial-plumbing` |
| `specialty-services` | `commercial-plumbing`, `plumbing` |
| `senior-care-facilities` | `commercial-plumbing`, `plumbing` |
| `student-housing` | `apartments`, `commercial-plumbing` |
| `apartments` / `condos` / `assisted-living` / `nursing-homes` | matching industry slug |

`reviewsForTags()` already widens to the most recent reviews when a tag has too
few matches, so thin tags degrade gracefully rather than rendering an empty
section.

## Step 7 — the `/about/testimonials` page

Replace the `PagePlaceholder` stub in `app/(site)/about/testimonials/page.tsx`
with a real page (keep the existing `metadata` object, extending the
description to mention the 5.0 rating and 133 reviews):

- A hero band matching the other About sub-pages, with `<GoogleRatingBadge
  variant="dark">` and a "Leave a review" outbound button when
  `profile.writeReviewUrl` is set.
- All reviews in a masonry-ish responsive grid (`columns-1 md:columns-2
  lg:columns-3` with `break-inside-avoid` on the cards is the least fussy way
  to handle the very uneven quote lengths here — one review is a single line,
  another is a full paragraph).
- The existing `FinalCTASection` at the bottom, consistent with sibling pages.
- `BreadcrumbJsonLd` with Home → About Us → Testimonials.

Add `export const revalidate` consistent with the other CMS-backed routes.

## Step 8 — optional Places refresh (build it, leave it off)

Add `GOOGLE_PLACES_API_KEY` to `.env.example` with a comment matching the
existing server-only convention (never `NEXT_PUBLIC_`, real value only in
`.env.local`).

Create `scripts/resolve-place-id.ts` — a one-shot Node script that calls Places
API (New) `places:searchText` with `textQuery: "Fred's Plumbing"` and a
`locationBias` circle around `32.7430719, -96.963595`, and prints the
`places/ChIJ…` resource name so it can be pasted into the `reviewSettings`
document. The hex feature ID cannot be converted to a Place ID computationally
— it has to be looked up.

Create `sanity/lib/getGoogleReviews.ts` following the same fetcher shape as the
others: fetches `places/{placeId}` with `fields=rating,userRatingCount,reviews`,
returns `{ rating, reviewCount, reviews }`, and is a **no-op returning null**
when `GOOGLE_PLACES_API_KEY` or the place ID is unset. Wire it only as an
optional source for the aggregate numbers in `getReviewSettings()` — never let
it override the curated review list, because it would replace 20 chosen reviews
with an arbitrary 5.

## Step 9 — unrelated but blocking: the site URL is wrong

`data/site.ts` has `url: "https://www.fredsplumbingdfw.com"` marked as a
placeholder. The client's Google listing points at **fredsplumbingservices.com**.
`site.url` drives `metadataBase`, every canonical, the sitemap and every JSON-LD
`url`. Do **not** change it yourself — flag it in your summary as a required
confirmation, along with whether `service@fredsplumbingdfw.com` is the real
inbox.

## Step 10 — verify

Run `npm run lint` and `npm run build`, fix everything they report, and then
confirm each of these by reading the built output or the source:

1. No occurrence of `[REVIEW TEXT` or `[REVIEW DATE` anywhere in the repo.
2. None of "Melissa R.", "James T.", "Angela M.", "David K." appear anywhere.
3. `components/seo/JsonLd.tsx` contains no `aggregateRating` and no `Review`
   type.
4. Every service slug's page renders a reviews section, and no rendered section
   is empty.
5. No reviewer photo URL (`googleusercontent.com`) appears in any source file.

Report which files you changed, anything you could not do, and the two
confirmations needed from the client (domain, email).
