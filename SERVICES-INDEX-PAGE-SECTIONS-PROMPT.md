# Claude Code prompt — make the Services index page (`/services`) section-editable

## Goal

Individual service pages (`/services/[slug]`) are section-stack editable. The **index page
at `/services`** is not — it is still hand-built (likely a `PagePlaceholder` or a hardcoded
template). Give it the same treatment as About / Partners / Careers / City pages: a
`servicesIndexPage` singleton with a `sections[]` stack drawing on the **shared section
library**, so the owner can compose the page himself in Studio.

**The owner will add and arrange the sections himself.** So this task is the plumbing, not
the page design: schema, mapper, renderer, fetcher, Studio entry, and a minimal sensible
default. Do not invent a rich default layout.

Follow the established playbook exactly — read how `aboutPage`/`careersPage` were done
(schema → mapper → renderer → fallback → seed script with dry-run/confirm, drafts handled,
stale-Studio-tab warning in the script output and the report).

## What to build

1. **Audit `/services` first** and report what it renders today and where each piece comes
   from — heading, intro, the service cards grid, anything else. Note which parts are
   collection-driven (the service documents) versus hardcoded copy.
2. `sanity/schemas/servicesIndexPage.ts` — singleton with `sections[]` using the **shared
   library union** (the same list every other page stack accepts, per the unified-library
   work). No page-specific section types unless the audit finds a band nothing covers — say
   so rather than inventing one.
3. `data/servicesIndexPage.ts` — a **minimal default stack**: the banner hero (carrying the
   page's current heading/intro copy verbatim) plus the services-grid section so the page
   still lists the services out of the box. Nothing more; the owner builds the rest.
4. Mapper + renderer per the existing pattern (malformed → dropped and logged, `hidden`
   skipped, `_key`-derived DOM ids, duplicates legal). Reuse the shared renderer if the
   unified library landed — do not create a seventh parallel one.
5. `sanity/lib/getServicesIndexPage.ts` with cache tag `servicesIndexPage`; confirm
   `/api/revalidate` and the Live setup need no change. GROQ projection added.
6. Studio structure: add **"Services Page"** to the sidebar near the other page singletons.
   Name it so it can't be confused with the **Services** collection (the individual service
   documents) — the Careers/"Careers Page" confusion already bit the owner once; consider
   labelling the collection "Service Pages" or the singleton "Services Index Page" and say
   what you chose.
7. `scripts/seed-services-index-sections.ts` — same safety spec as the other seeders:
   handles every dataset state, patches published **and** draft, refuses on a non-empty
   `sections[]`, never deletes a document or asset, dry-run by default, `--confirm` for the
   owner. Warn about stale Studio tabs in the output.
8. `npm run typegen` + `check:drift` clean; regenerated `sanity.types.ts` committed.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen, `check:drift` — all clean. The build
   must pass and **no verification scaffolding may be left in `app/`** (a previous task
   shipped a broken harness route).
2. `/services` renders on the fallback path with its current copy and the service list
   intact; 375 / 768 / 1024 / 1440; no console warnings.
3. Dry run prints a sane plan; nothing written without `--confirm`.
4. In a local Studio draft (discard after): add a section from the library to Services Page,
   reorder, hide one — all reflected on localhost.
5. Individual service pages and every other page unchanged.
6. One commit; nothing left uncommitted.

## Report

The audit (what `/services` rendered and from where); the default stack you shipped; the
Studio naming choice that keeps the singleton distinct from the Services collection; the
dry-run plan and confirm command; and the stale-tab reminder.
