# Claude Code prompt — make the Multi-Family index page (`/multifamily`) section-editable

## Goal

The individual property-type pages (`/multifamily/[slug]` — apartments, condos, senior care
and so on) are section-stack editable. The **index page at `/multifamily`** is not — it is
still hand-built (check whether it is a `PagePlaceholder` or a hardcoded template). Give it
the same treatment as the Services and Areas index pages: a `multifamilyIndexPage` singleton
with a `sections[]` stack drawing on the **shared section library**, so the owner composes
the page in Studio himself.

**The owner will add and arrange the sections himself.** This task is plumbing only —
schema, mapper, renderer, fetcher, Studio entry, seed script, minimal default. Do not design
a rich page.

Mirror the **Services index page** conversion exactly (closest precedent; if that has not run
yet, mirror `aboutPage`/`careersPage`): schema → mapper → renderer → fallback → seed script
with dry-run/confirm, published **and** draft patched, refuses on a non-empty `sections[]`,
never deletes a document or asset, stale-Studio-tab warning in the script output and report.

## What to build

1. **Audit `/multifamily` first** — report what it renders today and where each piece comes
   from: heading, intro, the property-type cards linking to the child pages, anything else.
   Note what is collection-driven versus hardcoded copy.
2. `sanity/schemas/multifamilyIndexPage.ts` — singleton with `sections[]` using the **shared
   library union**. Add a page-specific section type only if the audit finds a band nothing
   in the library covers, and say so rather than inventing one. Importantly: the
   property-type cards should be **collection-driven** from the industry/property-type
   documents (stack item = heading override + `hidden` only), so adding or removing a
   property type never requires editing this page. If they are currently hand-listed,
   convert them — and confirm the existing balanced-row layout applies so any count looks
   right.
3. `data/multifamilyIndexPage.ts` — a **minimal default stack**: the banner hero with the
   page's current heading/intro copy verbatim, plus the property-type cards section so the
   page still lists the child pages out of the box. Nothing more.
4. Mapper + renderer per the existing pattern (malformed → dropped and logged, `hidden`
   skipped, `_key`-derived DOM ids, duplicates legal). Reuse the shared renderer if the
   unified library landed — do not create another parallel one.
5. `sanity/lib/getMultifamilyIndexPage.ts`, cache tag `multifamilyIndexPage`; confirm
   `/api/revalidate` and the Live setup need no change; GROQ projection added.
6. Studio structure: add the singleton near the other page documents, named so it cannot be
   confused with the **Property Types** collection (the Careers/"Careers Page" confusion
   cost the owner time once already). Say what you named it.
7. `scripts/seed-multifamily-index-sections.ts` — same safety spec as the other seeders.
8. `npm run typegen` + `check:drift` clean; regenerated `sanity.types.ts` committed.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen, `check:drift` — all clean, and **no
   verification scaffolding left in `app/`** (a previous task shipped a broken harness route
   and failed the Vercel build).
2. `/multifamily` renders on the fallback path with its current copy, and every link to a
   `/multifamily/[slug]` child page still works; 375 / 768 / 1024 / 1440; no console
   warnings.
3. Dry run prints a sane plan; nothing written without `--confirm`.
4. Local Studio draft (discard after): add a library section, reorder, hide one — all
   reflected on localhost.
5. Every `/multifamily/[slug]` page and every other page unchanged.
6. One commit; nothing uncommitted left behind.

## Report

The audit (what the page rendered and from where); the default stack shipped; whether the
property-type cards are collection-driven now (and what the owner must do when a type is
added if not); the Studio naming choice; the dry-run plan, the confirm command, and the
stale-tab reminder.
