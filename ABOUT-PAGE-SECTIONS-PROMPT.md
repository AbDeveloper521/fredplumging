# Claude Code prompt — convert the About Us page to the section-stack system

## Current state and goal

`/about` is Sanity-editable today via the `aboutPage` singleton (hero, story, evolution,
values, links — fixed fields). The owner wants it to work **like the service pages**: an
orderable `sections[]` stack where he can add, remove, duplicate, hide and reorder sections
in Studio, and where the shared section library (including the new Icon Card type) is
available. Convert it.

## First, audit what on `/about` is NOT owned by the About document

Read `app/(site)/about/page.tsx` end to end and list, in the report, every rendered element
and where its content comes from. Known already:

- The credential chips (licence, years, service area) derive from `siteSettings` — correct;
  keep them derived, do not duplicate. Their *presence* can become part of the hero section
  item.
- `FinalCTASection` is the shared closer — decide whether it becomes a stack item (like the
  homepage's `finalCta` type) or stays appended by the route; prefer the stack item so the
  owner can swap or hide it.
- Any hardcoded eyebrow/label strings in the page file move into the section data.

## The conversion

Mirror the homepage's grouped-singleton → stack migration exactly (same playbook, same
pitfalls — read how `homePage.sections`, its mapper, its renderer and its migration script
were done, including the draft-document lesson):

1. **Schema:** `aboutPage.sections` becomes a section array. Reuse shared/service section
   types where they exist; add About-specific types only where needed (e.g. `aboutHero`,
   `aboutStory` with the two-photo collage, `aboutEvolution`, `valuesGrid`, `pageLinks`).
   Where an About band is structurally identical to an existing type, use the existing type
   — do not fork. **Include the generic types in the union too** (Icon Card, the map band if
   it is a type, etc.) so the About page can use the library; list in the report exactly
   which types the About stack accepts.
2. **Mapper + renderer:** `sanity/lib/aboutSections.ts` in the style of the existing
   section mappers (malformed → dropped with a logged warning, `hidden` skipped), and a
   renderer with `_key`-derived DOM ids (duplicates legal).
3. **Fallback:** `data/aboutPage.ts` becomes the ordered default stack carrying the current
   copy verbatim — the page renders pixel-identically before any Studio edit. The client's
   approved copy (including the Fredrick Lee Press paragraph) must not be reworded; the
   standing rules about that copy still apply.
4. **Migration script:** `scripts/migrate-about-sections.ts` — dry-run by default,
   `--confirm` to write, patches **both** `aboutPage` and `drafts.aboutPage` (the homepage
   migration initially missed the draft — don't repeat that), copies every field including
   image asset refs/hotspot/crop/alt verbatim into the new items, unsets the old top-level
   fields in the same transaction, refuses to run if a non-empty `sections` array already
   exists, and is incapable of deleting documents or assets. Do not run `--confirm`
   yourself; report the dry-run plan and the command.
5. Cache tag stays `aboutPage`; confirm `/api/revalidate` and the Live setup need no
   change. `npm run typegen` + `npm run check:drift` clean; regenerated types committed.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. Fallback path: `/about` renders pixel-identical to today (screenshot/diff), at
   375/768/1024/1440, no console warnings.
3. Local Studio draft (discard): reorder two About sections, hide one, add an Icon Card
   section with 3 cards → all reflected on localhost, no duplicate-id or key warnings.
4. `/about/careers`, `/about/partners`, `/about/testimonials` and every other page
   unchanged.
5. Dry run prints a complete plan; nothing written without `--confirm`.
6. One commit.

## Report

The full audit list (what was already editable, what was hardcoded and is now in the
stack, what stays derived from `siteSettings`); the section types the About stack accepts;
whether a published/draft old-shape `aboutPage` document exists; the dry-run plan and the
exact confirm command for the owner; and confirmation the page is pixel-identical pre-confirm.
