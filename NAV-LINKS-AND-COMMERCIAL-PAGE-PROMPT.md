# Claude Code prompt — optional nav dropdowns + a new Commercial page

Two related jobs. Part A unblocks the owner in Studio; Part B adds the page he wants to link
to. Do Part A first — he needs it to add the Commercial link without a dropdown.

---

# Part A — a navigation link must be publishable without a dropdown

## The problem

In Studio, adding a navigation link **cannot be published unless a dropdown is added**. The
owner wants plain top-level links (Home, Contact, Commercial) that go straight to a page with
no child menu. Right now the schema forces every nav item to have children.

## Diagnose first, then fix

Find the navigation schema — likely `sanity/schemas/navigation.ts` or a nav field inside
`siteSettings` — and report **exactly what is blocking publish** before changing anything.
The usual suspects, one or more of which will be true:

- the `children` / `items` / `submenu` array has `validation: Rule => Rule.required()` or a
  `.min(1)`
- the child item's own fields are required, so an empty row added by the owner blocks publish
- `href` is optional (because children were assumed), so the form gives no valid path for a
  plain link
- a custom `validation` function requires one shape and rejects the other

Say which it was. The fix depends on it and I don't want a guess.

## The rule to implement

A nav item is valid when **either** of these is true, and invalid otherwise:

1. It has an `href` and **no** children → renders as a plain link.
2. It has one or more children, each with its own `href` → renders as a dropdown.

So:

- `children` becomes **optional** — no `required()`, no `.min(1)`. An empty or absent array
  is completely fine.
- `href` becomes **conditionally required**: required when there are no children, optional
  when there are. Implement this as a custom `validation` on the parent object that reads
  sibling values, and return a **clear, human-readable message** — something like *"Add a
  link URL, or add at least one dropdown item."* The owner reads these messages; make them
  useful, not `Invalid value`.
- Decide deliberately whether a parent **with** children may also carry its own `href`. On
  this site the section parents (Services, Areas We Serve, Multi-Family) all have real index
  pages now, so a clickable parent that also opens a dropdown is genuinely useful. Allow it,
  and say so in your report.
- Give the array item a `preview` that makes the two states obvious at a glance in Studio —
  title plus a subtitle showing either the href or "N dropdown items". Right now the owner
  is guessing what he's looking at in a collapsed list.

## The frontend must handle a childless item

This is the part that will actually break if you only touch the schema. Go through every nav
consumer and confirm a parent with **zero** children renders correctly:

- **Desktop nav** — no chevron/caret on a plain link, no empty dropdown panel, no hover
  handler that opens nothing, correct keyboard behaviour (a plain link should not announce
  itself as a menu button to a screen reader).
- **Mobile menu** (`components/layout/MobileMenu.tsx`) — no disclosure toggle, no empty
  expandable region. A plain link is just a link.
- **Active-state logic** (`navActive.ts`) — `isSectionActive` currently derives the active
  section by looking at children. With no children it must fall back to matching the item's
  own `href`. Remember the earlier bug where parent and child both filled a pill and produced
  a stacked double-highlight — do not reintroduce that. Filled pill for the current page, red
  left bar for the section, as established.
- Any **footer** or sitemap-style nav that reuses the same data.
- The **static fallback** in `data/` — make sure its type allows a childless item too, or the
  types will disagree with the schema.

Also handle the **defensive case**: an item with neither `href` nor children (possible in an
older document even after validation changes, since validation doesn't retroactively rewrite
data). It should be **dropped from the rendered nav and logged**, exactly like the section
mapper drops malformed sections — never render a dead link or crash.

## Check existing data

Read the dataset **read-only** and report whether any current nav item would now fail
validation, or is already in a shape the new rules reject. Do not patch the dataset in this
task — report it so the owner fixes it in Studio.

---

# Part B — new "Commercial" page

## Goal

A new page at **`/commercial`** (note: the correct spelling is *commercial*), built exactly
like the Services / Areas We Serve / Multi-Family index pages: a `commercialPage` singleton
with a `sections[]` stack drawing on the **shared section library**.

**The owner will add and arrange every section himself.** This is plumbing only — schema,
fetcher, route, Studio entry, seed script, minimal default. **Do not design a rich page and
do not write marketing copy for it.**

## Mirror the Multi-Family index page exactly

`sanity/schemas/multifamilyIndexPage.ts` and its route are the freshest precedent and needed
no new mapper or renderer, because the shared library already covered it. Follow that shape:

1. `sanity/schemas/commercialPage.ts` — singleton, `sections[]` using the shared
   `sectionsField()` union, `hiddenField()` support per section so hide/duplicate/remove/
   reorder all work natively.
2. `data/commercialPage.ts` — a **deliberately minimal** default stack: just a banner hero
   with a neutral placeholder heading and intro, so the route renders something before the
   owner builds it. One band. Nothing else. Use obviously-placeholder copy (not invented
   marketing claims) so nothing accidental ships — and **never upgrade a service claim**; this
   is a licensed trade and wording matters.
3. `sanity/lib/getCommercialPage.ts`, cache tag `commercialPage`, GROQ projection on the
   shared `SECTIONS_PROJECTION`. Confirm `/api/revalidate` needs no change (it revalidates
   `body._type` with no allowlist) and say so explicitly.
4. `app/(site)/commercial/page.tsx` — thin route calling the **shared** `SectionRenderer`
   with `idPrefix="commercial"`. **Do not create a new mapper or renderer.** If a section type
   genuinely isn't covered by the library, say so rather than inventing one.
5. Studio: add **"Commercial Page"** near the other page singletons. Keep it clearly distinct
   from any Commercial *service* document that may exist — the Careers/"Careers Page"
   confusion cost the owner time once already. Say what you named it and where you put it.
6. `scripts/seed-commercial-sections.ts` — same safety spec as every other seeder: dry-run by
   default, `--confirm` to write, patches published **and** draft, refuses on a non-empty
   `sections[]`, never deletes a document or asset, prints the stale-Studio-tab warning.
7. `npm run typegen` + `check:drift` clean; regenerated `sanity.types.ts` committed.

## Navigation

**Do not add the Commercial link to the navigation yourself.** The owner will add it in
Studio — that is the whole point of Part A, and it doubles as the real-world test that a
plain top-level link now publishes without a dropdown.

Do confirm the route works when linked, and in your report give him the exact values to type:
title `Commercial`, href `/commercial`, no dropdown items.

## SEO

Real `metadata` (title, description, canonical). Indexable. Add to `sitemap.xml` if the site
generates one. **No structured data** — and never `AggregateRating` or `Review` markup
anywhere.

---

# Verify (both parts)

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean;
   regenerated types committed. **No verification scaffolding left in `app/`** — a previous
   task shipped a broken harness route and failed the Vercel build.
2. **Part A, the real test:** in a local Studio draft, add a nav item with a title and href
   and **no** dropdown items, and confirm it publishes with no validation error. Then confirm
   it renders as a plain link on desktop and mobile with no caret and no empty panel. Then
   confirm an item *with* children still works exactly as before. Discard the draft after.
3. Active states correct for both shapes at 375 / 768 / 1024 / 1440 — no double-highlight.
4. Keyboard and screen-reader check on the nav: a plain link is a link, a dropdown parent is
   a button with proper expanded state.
5. `/commercial` renders on the fallback path before seeding; dry run prints a sane plan;
   nothing written without `--confirm`.
6. Every existing page and every existing nav item unchanged.
7. One commit per part (two commits total), nothing uncommitted left behind.

# Report

**Part A:** exactly what was blocking publish; the validation rule you wrote and its message
text; whether a parent with children may also have its own href and why; every nav consumer
you touched; how the childless case is handled in active-state logic; what the defensive
drop-and-log does; and any existing nav data that would now fail validation.

**Part B:** the default stack shipped; confirmation that **no new mapper or renderer** was
needed (and if one was, exactly why); the Studio naming and placement; the dry-run plan; the
confirm command; the stale-tab reminder; and the exact nav values for the owner to type.
