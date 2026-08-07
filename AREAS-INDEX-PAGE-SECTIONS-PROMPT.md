# Claude Code prompt — make the Areas We Serve index page (`/areas-we-serve`) section-editable

## Goal

The city pages (`/areas-we-serve/dallas`, `/areas-we-serve/fort-worth`) are section-stack
editable. The **index page at `/areas-we-serve`** is not — it is still hand-built (likely a
`PagePlaceholder` or a hardcoded template; check). Give it the same treatment as the
Services index / About / Partners / Careers: an `areasIndexPage` singleton with a
`sections[]` stack drawing on the **shared section library**, so the owner composes the page
in Studio himself.

**The owner will add and arrange the sections himself.** This task is the plumbing only:
schema, mapper, renderer, fetcher, Studio entry, seed script, and a minimal default. Do not
design a rich page.

Follow the established playbook exactly — mirror how the **Services index page** was done
(that is the closest precedent; if that task has not run yet, mirror `aboutPage`/
`careersPage`): schema → mapper → renderer → fallback → seed script with dry-run/confirm,
published **and** draft patched, refuses on non-empty `sections[]`, never deletes, stale
Studio tab warning in the script output and the report.

## What to build

1. **Audit `/areas-we-serve` first** and report what it renders today and where each piece
   comes from — heading, intro, any city list or cards linking to Dallas/Fort Worth, the
   service-area map, anything else. Note what is collection-driven versus hardcoded copy.
2. `sanity/schemas/areasIndexPage.ts` — singleton with `sections[]` using the **shared
   library union** (same list every other page stack accepts). Add a page-specific section
   type only if the audit finds a band nothing in the library covers — and say so rather
   than inventing one. In particular: if the page shows a "cities we serve" cards/links
   grid, check whether the city documents can drive it as a collection-backed section
   (heading override + `hidden` only), so adding a third city later needs no page edit.
3. `data/areasIndexPage.ts` — a **minimal default stack**: the banner hero carrying the
   page's current heading/intro copy verbatim, plus whatever section keeps the links to the
   Dallas and Fort Worth pages present. Nothing more.
4. Mapper + renderer per the existing pattern (malformed → dropped and logged, `hidden`
   skipped, `_key`-derived DOM ids, duplicates legal). Reuse the shared renderer if the
   unified library landed — do not create yet another parallel one.
5. `sanity/lib/getAreasIndexPage.ts`, cache tag `areasIndexPage`; confirm `/api/revalidate`
   and the Live setup need no change; GROQ projection added.
6. Studio structure: add the singleton to the sidebar near the other page documents, named
   so it cannot be confused with the **City Pages** collection — the Careers/"Careers Page"
   confusion cost the owner time once already. Say what you named it.
7. `scripts/seed-areas-index-sections.ts` — same safety spec as the other seeders.
8. `npm run typegen` + `check:drift` clean; regenerated `sanity.types.ts` committed.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen, `check:drift` — all clean, and **no
   verification scaffolding left in `app/`** (a previous task shipped a broken harness
   route and failed the Vercel build).
2. `/areas-we-serve` renders on the fallback path with its current copy, and the links to
   both city pages still work; 375 / 768 / 1024 / 1440; no console warnings.
3. Dry run prints a sane plan; nothing written without `--confirm`.
4. Local Studio draft (discard after): add a library section to the new page, reorder, hide
   one — all reflected on localhost.
5. Both city pages and every other page unchanged.
6. One commit; nothing uncommitted left behind.

## Report

The audit (what the page rendered and from where); the default stack shipped; whether the
city links are collection-driven or hand-listed (and if hand-listed, what the owner must do
when a third city is added); the Studio naming choice; the dry-run plan, the confirm
command, and the stale-tab reminder.
