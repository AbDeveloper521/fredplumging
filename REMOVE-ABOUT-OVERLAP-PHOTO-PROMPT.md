# Claude Code prompt — remove the small overlapping photo from the "About this service" band

## What to change

Every service page carries an **About this service** section (heading like "About Our
Specialized Plumbing Services"). Its left-hand side is a photo collage: one large photo, a red
24/7 Emergency badge, and a **smaller photo overlapping the bottom-right corner** of the large
one.

The site owner wants that small overlapping photo gone. Not restyled, not moved — removed
entirely, along with the CMS fields that feed it, so no one can ever upload an image into a
slot that no longer renders.

**Keep everything else in that collage exactly as it is:** the large photo, the red 24/7
Emergency badge at the top-left, the rounded corners, and the shadow. This is a deletion, not
a redesign.

## Scope — read this before touching anything

The change is contained to eight places. Confirm each with grep before editing; do not
freelance beyond them.

| File | What is there |
|---|---|
| `components/sections/ServiceAboutSection.tsx` | the overlapping `<div className="absolute -bottom-8 -right-3 …">` wrapper and its `<CollagePhoto photo={section.photoSecondary} …>` |
| `data/serviceSections.ts` | `photoSecondary?: CmsPhoto;` and `photoSubjectSecondary?: string;` on `ServiceAboutSection` |
| `sanity/schemas/serviceSections.ts` | the `imageWithAlt({ name: "photoSecondary", title: "Small overlapping photo", … })` field and the `photoSubjectSecondary` string field that follows it |
| `sanity/lib/sections.ts` | `photoSecondary: photoOf(raw, "photoSecondary")` and `photoSubjectSecondary: str(raw.photoSubjectSecondary)` in the `serviceAbout` case |
| `sanity/queries.ts` (two places, ~lines 121 and 153) | `photoSecondary{ asset, hotspot, crop, alt }` in both the service and the industry section projections |

**Do not touch `components/sections/AboutSection.tsx`.** That is the *homepage* About section.
It uses a visually identical collage (same `absolute -bottom-8 -right-3` overlap at line 38),
but the owner asked only about the service pages, and that composition is the site's brand
anchor on the homepage. Leave it alone and mention it in your report so he can decide
separately whether he wants them to match.

## The details that are easy to get wrong

**`CollagePhoto` becomes single-use.** Once the secondary call site is gone, the helper is
called exactly once. Leave it as a named component anyway — it keeps the photo-or-placeholder
branch readable and it is what the primary photo still uses. Do not inline it and do not
delete it.

**The decorative gradient rule.** There is a thin red-to-transparent line at
`absolute -bottom-4 left-10 … sm:block` directly below the collage. It was drawn to balance
the overlapping photo. With that photo gone, look at the result on a wide screen and decide
whether it still reads as intentional or as a stray line. Either keeping or removing it is
fine — but say which you chose and why. Do not leave it unexamined.

**Bottom spacing.** The removed photo was absolutely positioned with `-bottom-8`, so it never
occupied layout space and removing it should not reflow anything. Verify that on a real page
rather than assuming it — the section uses `lg:items-center`, and the left column just got
shorter, so the vertical relationship between the collage and the copy on the right may need a
look at `lg` and above.

**Sanity type generation.** After editing the schema and the GROQ queries, run
`npm run typegen` and then `npm run check:drift`. Both must be clean. Commit the regenerated
`sanity.types.ts` with the change, not as a separate afterthought.

## The orphaned data in Sanity

Removing the two fields from the schema does **not** remove values already stored in the
dataset. Any `serviceAbout` section where an editor previously set a small photo or a subject
line keeps those keys, and the Studio will show a yellow **"Unknown fields found"** notice on
that document. That notice is harmless but it is confusing for a non-technical editor, so
handle it deliberately:

Write `scripts/remove-about-secondary-photo.ts`, run via
`sanity exec scripts/remove-about-secondary-photo.ts`, that:

- runs **read-only by default** — it prints exactly which documents and which array items
  carry `photoSecondary` or `photoSubjectSecondary`, and changes nothing;
- performs the unset only when passed `--confirm`, and then only `unset`s those two keys on
  `sections[]` items whose `_type` is `serviceAbout`;
- **never deletes a document, never deletes an array item, never touches any other field.**

`scripts/seed-reviews.ts` in this repo contains a blanket-delete pattern
(`*[_type == "testimonial" && !(_id in $ids)]` → `tx.delete`). Do not imitate it. This script
must be incapable of removing anything but those two keys.

Do not run the `--confirm` pass yourself. Report the dry-run output and let the owner decide.

## Verify

1. `npx tsc --noEmit` clean, `npm run lint` clean, `npm run build` succeeds.
2. `npm run typegen` and `npm run check:drift` clean.
3. `grep -rn "photoSecondary\|photoSubjectSecondary" components data sanity` returns nothing
   outside `sanity.types.ts` and the new cleanup script.
4. `npm run dev`, then open **every** service page and **every** industry page. On each: the
   About band shows one photo plus the red 24/7 badge, with no overlapping second photo, and
   nothing overlaps or clips at 375px, 768px, 1024px and 1440px. List the URLs you checked.
5. `/studio` still loads, and opening a service's About section shows no "Small overlapping
   photo" field.
6. One commit, revertible on its own.

Then tell me in one short paragraph: what you did with the decorative gradient line, whether
any spacing needed adjusting, how many documents the dry-run found carrying orphaned values,
and whether the homepage About section has the same overlap (it does — confirm it is untouched).
