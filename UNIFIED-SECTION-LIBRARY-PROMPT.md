# Claude Code prompt — one shared section library across every page stack

## The goal

The site now has seven section stacks (service, industry, homePage, aboutPage,
partnersPage, careersPage, cityPage), each with its own union of allowed section types, its
own mapper, and its own renderer. The owner wants **one library**: every section type
available in the "Add item…" menu of every page, so a section built once is usable
everywhere and nothing needs re-wiring per page.

## The design

1. **One union.** A single shared `sectionLibrary` array-of-types definition (in
   `sanity/schemas/`, composed from the existing type definitions — the types themselves
   don't change) that every page document's `sections` field uses. Page-specific types
   (aboutStory, cityCommunities, partnerPlatforms…) join the library — they're just bands;
   there is no technical reason About's story collage can't sit on a city page if the owner
   wants it.
2. **Grouped insert menu.** A flat 20-type list is unusable. Use Sanity's insert-menu
   grouping/options so the add menu shows categories: **Heroes**, **Content bands**,
   **Cards & grids**, **Collections** (reviews, job openings, FAQ, trust logos — sections
   that pull shared data and work anywhere), **CTA & closing**. Each type gets a clear
   title and, where the Studio version supports it, a one-line description. Keep titles
   owner-friendly ("Photo collage band", not "serviceAbout").
3. **One mapper + one renderer.** Merge the per-page mappers into a single
   `sanity/lib/sectionLibrary.ts` validation map (each type keeps its existing validation
   case verbatim — this is consolidation, not rewriting) and one `SectionRenderer` used by
   all seven templates. Per-page renderers/mappers become thin wrappers or disappear.
   Behaviour contract unchanged: malformed → dropped + logged, `hidden` skipped, `_key`
   ids, duplicates legal.
4. **Per-page defaults stay per-page.** The fallback stacks in `data/` are untouched —
   this changes what *can* be added, not what each page shows by default.
5. **Context-dependent sections must degrade, not crash.** Audit each type for assumptions
   about its host page (e.g. anything reading service-specific props, FAQ JSON-LD emission,
   hero types that expect breadcrumbs). Every type must render sensibly on any page or
   skip itself gracefully with a logged warning. List in the report any type that needed
   a guard.
6. **No dataset changes.** Existing documents keep working — their current sections are
   all in the library by construction. Nothing to migrate, no scripts, no confirms.
7. `npm run typegen` + `npm run check:drift` clean; regenerated types committed.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. Every page renders byte-identical to before (fallback + against the live dataset) —
   this refactor must be invisible on the front end. Spot-check all seven page types.
3. Local Studio draft on three different page types (discard after): the Add item menu
   shows the grouped full library; add a "foreign" section (e.g. the city Communities band
   on a service page draft) → renders correctly; add a collection section (reviews) on the
   About page draft → renders with real data.
4. No duplicate-id/key warnings with mixed sections.
5. One commit.

## Report

The final library list with its groups; any type that needed a degrade-guard for foreign
pages; what code was deleted in the consolidation (lines removed is the win here); and
confirmation that no dataset action is needed and every page renders unchanged.
