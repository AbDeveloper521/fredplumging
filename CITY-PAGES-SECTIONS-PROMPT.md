# Claude Code prompt — Dallas & Fort Worth city pages: match the reference, section-stack editable

## Context — these pages already exist; this is an upgrade, not a build

`/areas-we-serve/dallas` and `/areas-we-serve/fort-worth` were built earlier from the
owner's WordPress references: `cityPage` documents (fixed fields), `data/cities.ts`
fallbacks carrying the transcribed copy, a shared template. Since then the rest of the site
moved to the **section-stack system** (services, homepage, About, Partners, Careers) and
gained shared types (banner hero with editable background photo + overlay toggle, icon/card
sections, badge strip, map band).

The owner wants the city pages to match his reference exactly (bands below, **no extra
sections**), look excellent, and have **every text and picture editable in Sanity** like the
other pages. Convert `cityPage` to a `sections[]` stack, reusing existing section types
wherever a band matches — only build city-specific types where nothing fits.

Read first: the city page template + `data/cities.ts` + `sanity/schemas/cityPage.ts` as
they exist today, and the About/Partners/Careers conversion playbook (schema → mapper →
renderer → fallback → migration/seed script with dry-run/confirm, drafts handled, stale-tab
warning).

## The page — the reference's bands, top to bottom, nothing else

1. **Hero** — dark banner, centred: eyebrow, H1 ("Plumbing Services in Dallas, Texas"),
   intro paragraph, **background photo editable** with the dark-overlay toggle (reuse the
   service-hero treatment — same component/type if it slots in cleanly).
2. **Services cards** — heading ("Reliable Plumbing Services in Dallas") + five cards
   (photo slot, title, description, Get Started → link to the real service pages). Reuse the
   sub-service card section type from the service-page template. Card links must resolve to
   real routes; photos are editable slots with placeholders until uploaded.
3. **Why choose us** — dark band, photo left / copy right + Contact Us (reuse the closest
   existing dark about-style type).
4. **Reviews** — the existing Google-reviews strip, verbatim quotes, collection-driven
   (stack item = heading override + hidden only).
5. **Heritage** — "Serving Dallas with Integrity and Expertise Since 1996" — dark collage
   band with the 24/7 badge treatment + Contact Us (reuse the existing collage type).
6. **Communities** — "Proudly Serving Dallas and Surrounding Communities": copy with the
   city list, the Dallas/Fort Worth pin rows, photo slots, Contact Us.
7. **Badge strip + map band** — the association badge strip and the Google-map band close
   the page above the footer, same as service pages. If they aren't already rendered on
   city pages, add them the same way service pages get them (template-rendered, not stack
   items) — one consistent mechanism, and note it in the report.

Copy: the transcriptions already in `data/cities.ts` are the source — they came from the
owner's screenshots and were flagged for his review. Do not rewrite them; each city keeps
its own distinct text (doorway-page rule: never harmonise the two cities' wording).

## Mechanics (the established playbook — brief)

- `cityPage.sections` array; register types; generic library types (Icon Card etc.) in the
  union; Studio structure unchanged (City Pages list stays).
- `data/cities.ts` entries become ordered default stacks, copy verbatim; both pages render
  pixel-identically on the fallback path before any Studio edit... **except** where the
  reference demands a visual upgrade (hero style, card polish) — those changes are
  intentional; list them.
- Mapper + renderer per pattern (malformed dropped + logged, hidden skipped, `_key` ids).
- **Migration/seed script** `scripts/migrate-city-sections.ts`: handles published AND draft
  `cityPage` documents for BOTH slugs in one run; if a document has old-shape fields with
  real content (the owner may have edited text or uploaded photos — check), copy everything
  including asset refs verbatim into the stack and unset old fields in the same
  transaction; if a document is missing/empty, seed from the fallback; refuse on non-empty
  `sections[]`; no deletes ever; dry-run default, `--confirm` for the owner. Stale-tab
  warning in output + report.
- Cache tag stays `cityPage`; typegen + `check:drift` clean; one commit.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. Both city pages at 375/768/1024/1440: bands in the order above, no extras, no console
   warnings; five card links resolve; reviews verbatim; hero shows wash until a photo is
   uploaded.
3. Dry run prints a per-slug plan. Local Studio draft test (discard): edit a heading,
   reorder, hide a band, upload a hero photo + toggle overlay — all reflected.
4. Every other page unchanged.

## Report

Which existing types covered which bands (and any new city-specific type you had to make);
what visually changed vs. today's city pages and why; whether the dataset documents held
real content that was migrated (photos especially); the per-slug dry-run plan + confirm
command; badge strip/map band wiring on city pages; the stale-tab reminder.
