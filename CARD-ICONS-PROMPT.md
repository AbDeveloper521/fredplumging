# Claude Code prompt — sub-service cards: icons instead of photo slots

## What to change

On the service pages, the three-card band (on `/services/plumbing`: **Slab Leak Repair /
Piping Services / Commercial Installs & Replacements**, each with a "Get Started →" link)
currently shows a large dark photo placeholder on top of every card. The owner wants
**icons, not images** for this section.

First find the section type actually rendering it — it is whichever card type the simple
service template used for band 3 (check the plumbing entry in the `data/` fallback and the
component it maps to, likely `ServicePropertyTypesSection` or a sibling). All changes go to
that one section type; do not touch other card-like sections.

## The card design

Drop the top photo area entirely. Each card becomes a clean white card
(`rounded-2xl shadow-card border-grey-300/60`, consistent with the site's existing cards):

- An **icon chip** top-left: `size-12`–`14` rounded-xl, `bg-red-600/10` (or the tint the
  site's `IconFeature` already uses — match, don't invent), with the `lucide-react` icon in
  `text-red-600`, `size-6`–`7`.
- Then the title, description, and the existing "Get Started →" link, all unchanged in
  content and behaviour.
- Whole-card hover treatment consistent with other interactive cards on the site (lift or
  border-darken — copy an existing pattern).
- Grid/breakpoints unchanged; verify card heights still balance with unequal text lengths
  (`items-stretch` / flex column with the link pinned to the bottom).

## Data and schema

- In this section type's schema: add an optional `icon` field using the same icon-key picker
  the other sections use (validated against `navIcons` keys, same Studio description
  pattern). **Remove the photo field from this section type** — the owner has decided this
  band is icon-based; a dead photo slot invites confusion. Check the dataset read-only
  first: if any published document has an image actually uploaded in this band, keep the
  field but stop rendering it, and flag it in the report instead of removing (do not create
  data loss or unknown-fields noise; the earlier screenshots show placeholders, so
  expect none).
- Mapper (`sanity/lib/sections.ts`): unknown or missing icon → a sensible default so no card
  ever renders empty.
- Fallback data: set icons for the three plumbing cards — suggested: `droplets` for Slab
  Leak Repair, `wrench` (or a pipe-like key if one exists in `navIcons`) for Piping
  Services, `building-2` for Commercial Installs & Replacements. Use only keys that exist
  in `navIcons`; list what you chose.
- Sanity side: since icon is optional with a default, existing documents need no patching —
  cards get the default icon until the owner picks one in Studio. If per-card defaults by
  title would be nicer (match the three suggested icons when the title matches), do it in
  the mapper fallback, not by writing to the dataset.
- `npm run typegen` + `npm run check:drift` clean; regenerated types committed.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. `/services/plumbing` (fallback path and against Sanity): three cards with red icon
   chips, no photo area, links working, heights balanced. 375/768/1024/1440.
3. Every other service page using this section type renders correctly with the default icon.
4. Studio shows the icon picker on this section; no unknown-fields warnings introduced.
5. One commit.

Report: which section type it was, the icon keys used, whether any document actually had an
uploaded photo in this band, and whether the photo field was removed or just unrendered.
