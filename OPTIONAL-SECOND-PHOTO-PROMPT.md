# Claude Code prompt — collage band: the small overlapping photo appears only when one is uploaded

## The problem

The photo collage band (the `serviceAbout` section type / the `AboutCollage` component —
large photo, small photo overlapping its corner, copy alongside) renders an
`ImagePlaceholder` in the **small overlapping slot** when no photo is set. The owner wants:

- small photo uploaded → show it, exactly as now
- no small photo → render **nothing** in that slot, no placeholder, no empty box, no
  leftover border or shadow, and no gap in the composition

The band is used in several places (service pages, the homepage About band, the city pages'
"why choose us" and heritage bands — grep for every consumer). Fix it once in the shared
component so every consumer benefits, and list the consumers in your report.

## What to change

- In the collage component, the secondary/overlap photo renders **only** when a resolved
  photo exists. No placeholder fallback for that slot. Remember the resolver drops an image
  that has no alt text — in that case the slot is also "no photo", which is correct
  behaviour; keep the existing `logImageSkipped` warning so the owner can tell the
  difference in logs.
- With the small photo absent, check the surrounding composition still looks deliberate:
  the large photo, the red 24/7 badge, any decorative gradient rule, and the column's
  bottom spacing. Adjust only what's needed so it reads as an intentional single-photo
  layout rather than something missing. Say what you adjusted.
- The **large/primary** photo keeps its placeholder — that one is load-bearing for the
  layout while the owner is still uploading. Do not change it.
- Schema/data untouched: the field stays optional exactly as it is. This is a rendering
  change only. No migration, no dataset writes.

## Audit while you're here

Grep for other **optional, decorative** image slots that render a placeholder when empty
(as opposed to primary slots where the placeholder holds the layout). List them with a
one-line judgement each — "should also be conditional" or "placeholder is correct here" —
but **do not change them in this task** unless it is the same collage component. The owner
decides after seeing the list.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen, `check:drift` — all clean; no
   verification scaffolding left in `app/`.
2. On a page where the small photo IS set: renders identically to today.
3. On a page where it is NOT set: no placeholder, no empty frame, no gap; composition looks
   intentional at 375 / 768 / 1024 / 1440.
4. Every consumer page checked and listed; nothing else changed.
5. One commit; nothing uncommitted left behind.

## Report

The component fixed and every page that uses it; what you adjusted in the composition for
the no-second-photo case; and the audit list of other optional image slots with your
judgement on each.
