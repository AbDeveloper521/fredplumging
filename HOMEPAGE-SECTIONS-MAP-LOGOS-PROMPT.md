# Claude Code prompt — homepage section controls, remove "Who We Serve", Google-map band, fix the dark logo strip

Four tasks, one commit each is fine (or one commit total — your call, but keep them
separable in the diff). Read `CLAUDE.md` + vendored Next docs first; Next 16.2.11, Tailwind
v4 via `@theme`, no `tailwind.config`.

---

## Task 1 + 2 — homepage sections become an orderable stack (hide / duplicate / remove), and "Who We Serve" comes out

The owner wants, per homepage section: **duplicate, hide, remove**. The `homePage` singleton
we shipped as nine fixed groups cannot do that — fixed object fields can't be reordered,
duplicated or removed. But this repo already has the right architecture: the **section-stack
pattern** from service pages (`sections[]` union array + validator + renderer). Restructure
the homepage to use it.

- **Schema:** `homePage.sections` becomes an **array of typed section objects** — one type
  per current homepage band: `hero`, `trustBar`, `about`, `services`, `emergency`,
  `industries`, `whyChooseUs`, `process`, `compliance`, `testimonials`, `caseStudy`,
  `serviceArea`, `faq`, `finalCta`. Each item carries the copy fields that the grouped
  schema already defined (move them, don't redesign them) **plus a `hidden` boolean**
  ("Hide this section — keeps the content but stops showing it"). Sanity array items give
  the owner **add, remove, duplicate and drag-reorder natively in Studio** — that is
  exactly the functionality he asked for; do not build custom UI for it.
- Collection-driven types (`trustBar`, `services`, `industries`, `testimonials`, `faq`,
  `compliance` logo strip) keep pulling their collections — their array item holds only
  heading overrides + `hidden`, with a field description pointing at where the collection
  lives.
- **Validation/mapping:** a `sanity/lib/homeSections.ts` mapper in the style of
  `sanity/lib/sections.ts` — malformed item → dropped **with a logged warning** (use the
  `logSectionDropped` helper if it exists by now), never a crashed page. Hidden → skipped.
- **Renderer:** `HomeSectionRenderer` mapping type → existing section components.
  **Duplicates are legal now**, so every section instance needs unique DOM ids — the
  components use fixed `aria-labelledby` ids like `about-heading`; derive ids from the
  array `_key` instead. Check every one of the nine components for hardcoded ids.
- **Fallback:** `data/homePage.ts` becomes the ordered default stack with the same copy it
  has now — **minus the `industries` item**. That is how "Who We Serve" (the
  `IndustriesSection`, eyebrow "WHO WE SERVE", heading "Plumbing Solutions Built Around
  Your Property") is removed: it leaves the default stack and `app/(site)/page.tsx` stops
  rendering it. Keep the component, its section type, and the schema entry so the owner can
  re-add it from Studio with one click if he changes his mind. Note: `/multifamily` pages
  and anything else using `IndustriesSection` are untouched — check call sites.
- **Compatibility:** if a `homePage` document was already **published with the old grouped
  shape**, the new code must not blank the page: read `sections` when present, else fall
  back to the static default stack. Check the dataset shape read-only (a GROQ query via the
  existing client is fine) and say in the report whether a published old-shape document
  exists — if it does, the owner re-enters any Studio edits in the new structure; do not
  write a dataset migration yourself.
- `app/(site)/page.tsx` fetches everything it fetches today, plus the stack, and feeds the
  renderer. `npm run typegen` + `npm run check:drift` clean.

## Task 3 — Google-map band at the end of the homepage and every service page

New shared component `components/sections/LocationMapSection.tsx`:

- **Layout:** full-width band, `bg-offwhite`, standard `Container` + `SectionHeading`. Copy
  column left, map right on desktop (stacked on mobile), or copy centred above a wide map —
  pick what sits best with the pages' existing rhythm and say which you chose. Map in a
  `rounded-2xl overflow-hidden border border-grey-300/60 shadow-card` frame, ~16/9 on
  desktop, taller than wide never.
- **The iframe** — build it yourself from this src (do not paste the raw embed verbatim):

  `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1718285.9085962924!2d-98.28338183041127!3d32.738469352465685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d28a9a9242e61cb%3A0x10c8773cb4095848!2sFred's%20Plumbing!5e0!3m2!1sen!2s!4v1785511031920!5m2!1sen!2s`

  with `loading="lazy"`, `referrerPolicy="strict-origin-when-cross-origin"`,
  `allowFullScreen`, width/height driven by the container (not the hardcoded 600×450), and a
  real `title` ("Fred's Plumbing on Google Maps — Dallas–Fort Worth service area"). No
  API key involved; nothing billed.
- **Default copy** (owner said pick something good — keep claims inside what the site
  already says): headline like **"Serving the Dallas–Fort Worth Metroplex"**, one supporting
  line ("Commercial and multi-family plumbing teams dispatched across DFW, 24/7."), and two
  CTAs: primary **Request Service → `/contact`**, secondary **call button** using
  `site.phoneHref`. Optionally a "Get Directions" text link to the public listing URL —
  reuse whatever listing URL constant the reviews system already has rather than
  hardcoding a second copy.
- **Content home:** heading, description and the embed URL live in **`siteSettings`**
  (three new optional fields with the usual fallback defaults in `data/site.ts`) — it is
  site-wide content shown on many pages, so it belongs with the business facts, not
  duplicated per page. Empty embed URL → the whole band hides.
- **Placement:** homepage — as a `locationMap` type in the new section stack, default
  position **after `faq`, before `finalCta`** (the map should not be the last thing before
  the footer; the CTA closes). Service pages — rendered by the service page template
  directly **after the section stack, before the footer** for both the sections path and
  the legacy `CmsDetailPage` path, same position on every service. Industry/multifamily
  pages: leave them out, note it in the report so the owner can ask.
- No `PostalAddress` structured data — still no street address; the map pin is Google's
  listing, not an address claim in our markup.

## Task 4 — fix the logos in the dark "Approved Across Leading Property Management Systems" band

`ComplianceSection.tsx` renders uploaded logos with:

```
className="h-8 w-auto opacity-40 brightness-0 invert ..."
```

`brightness-0 invert` flattens the image to pure white silhouette — which works for
transparent-background logos and produces exactly the **solid grey/white rectangles** in the
owner's screenshot for any logo exported with a baked-in background (the whole box becomes
the silhouette). The owner's uploads include several of those; this treatment can never
render them correctly.

Fix: drop the silhouette treatment and reuse the **white-tile strip** that already works on
light backgrounds — `TrustLogoStrip` (white tiles, `object-contain`, grayscale-until-hover).
White cards sit fine on the `navy-950` band and make the tiles read as a deliberate row.
Either render `<TrustLogoStrip logos={logos} />` directly in `ComplianceSection`, or if its
sizing needs to differ, add a size/variant prop rather than forking the component. Keep the
wordmark fallback for logos without images, restyled to sit inside the same tile. Delete the
`brightness-0 invert` path entirely — no logo treatment that destroys opaque-background
uploads survives this task.

(The real cure for those uploads is still transparent re-exports — the earlier
TRUST-LOGO-STRIP task asked for a list of which logos are opaque; if that list was never
produced, produce it now in the report.)

---

## Do not

- Do not touch `getGoogleReviews`, the reviews import scripts, or testimonial data.
- No `AggregateRating`/review markup anywhere; no invented street address.
- Do not download vendor logos or map imagery; the iframe loads from Google at view time.
- Do not delete the `IndustriesSection` component or its schema type.
- Do not write to the Sanity dataset (read-only shape check excepted).

## Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run typegen`,
   `npm run check:drift` — clean.
2. Homepage on dev: renders the same as before **except** no "Who We Serve" band, plus the
   new map band between FAQ and the final CTA. Compare section-by-section top to bottom.
   375 / 768 / 1024 / 1440.
3. In a local Studio session: reorder two sections, hide one, duplicate one — each change
   reflects on localhost; the duplicate causes no duplicate-id/accessibility errors and no
   React key warnings. Do not publish these experiments to the production dataset if the
   Studio writes to it — test with drafts/perspective if possible, and say what you did.
4. Every service page ends with the map band above the footer; iframe lazy-loads (check the
   network tab — it must not load until scrolled near), keyboard focus can enter and leave
   the iframe.
5. Compliance band: all five logos visible and legible, opaque-background uploads contained
   in tiles, nothing rendered as a blank rectangle. Homepage TrustBar unchanged.
6. `/multifamily` and its children unchanged (IndustriesSection call sites intact).

## Report back

- The section-type list in the new stack and the default order; confirmation "Who We Serve"
  is out of the default but re-addable in Studio.
- Whether a published old-shape `homePage` document exists and what the owner must re-enter.
- Map band: which layout you chose; the three new `siteSettings` fields the owner can edit.
- Which compliance logos are opaque-background and should be re-exported transparent.
- Any component that needed its hardcoded `aria-labelledby` id parameterised.
