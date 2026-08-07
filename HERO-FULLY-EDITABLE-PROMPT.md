# Claude Code prompt — homepage hero: make every visible element editable, audit for leftovers

## The gap

The `homeHero` schema covers the headline, intro, eyebrow, trust strip, experience badge
(label + show toggle), background photo and overlay. But its own description admits:
*"Buttons, phone number, and the years figure come from Site Settings."* The owner has
marked the **buttons, the trust strip and the badge** as things he must be able to edit.
Two of those already have fields; the buttons do not. Fix the buttons, then prove the rest.

## 1. Buttons become editable

Add to `homeHero`:

- **Primary button** — label + link (both-or-none via the existing `ctaPair` convention;
  href helper for internal `/path` or full URL). Default in the fallback data: `Our Services`
  → `/services`. Empty → button not rendered.
- **Phone button** — an optional label field where the number itself still comes from
  `site.phone` (never hardcode a number; the description should say so, e.g. write
  `Call {phone}` and it fills in). A **show/hide toggle** so the whole button can be removed.
  Empty/off → not rendered, and the row closes up cleanly.
- If both buttons are absent the hero must not leave a gap or an orphaned divider rule.

Thread through: schema → GROQ projection → `sanity/lib/` mapper → types → `HeroSection`
component → `data/homePage.ts` fallback. Existing published documents must keep rendering
exactly as today (absent fields → current defaults), so nothing changes visually until the
owner edits something.

## 2. Full hero audit — report every element and its source

Go through `HeroSection.tsx` line by line and produce a table in the report: **every visible
element → the Studio field that controls it, or "derived from Site Settings", or
"hardcoded"**. Anything still in the "hardcoded" column that a client could reasonably want
to change (labels, the divider, the badge icon, the eyebrow rule, aria-labels that read as
copy) gets a field in this task — or an explicit one-line justification for why it stays
code (layout-only, decorative, a11y).

Specifically confirm the three items the owner flagged:
- trust strip items (`trustIndicators`) — editable ✅ expected
- experience badge label + visibility — editable ✅ expected
- both buttons — being added now
If any of those three turn out NOT to be reaching Studio (mapper drops it, GROQ omits it,
component ignores it), that's a bug — find it and fix it, and say what it was.

## 3. Check the pipeline end to end, not just the schema

For each hero field, verify the whole chain: schema → GROQ → mapper → component. A field
that exists in the schema but is missing from the GROQ projection or dropped in the mapper
looks editable in Studio and does nothing on the site. List any you found broken.

## 4. Housekeeping

There is a `app/(site)/__preview` route in the repo (committed earlier). Check whether it's
a temporary harness like the deleted `hero-degrade-check`; if so, remove it and confirm the
build passes. Do not leave verification scaffolding in `app/`.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen, `check:drift` — all clean. The build
   must pass; the previous commit shipped a broken route.
2. Homepage renders identically with current data (defaults path).
3. In a local Studio draft (discard after): change the primary button label and link, hide
   the phone button, edit a trust chip, toggle the badge off — each reflected on localhost,
   layout clean in every combination including "all off".
4. One commit, and confirm nothing uncommitted is left behind.

## Report

The full element → source table; what the buttons' new fields are named; any broken
pipeline link you found and fixed; what happened to `__preview`; and one line for the owner
naming exactly which Studio fields control the buttons, chips and badge.
