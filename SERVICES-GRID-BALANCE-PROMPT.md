# Claude Code prompt — services grid: balanced layout for any number of services

## The problem

The services grid (the photo cards with "Learn more" — `ServicesSection`, check every place
it renders: homepage stack, possibly `/services` index) was designed around 8 services.
The owner deleted 3; with 5 left it now renders **one giant stretched card on its own row
plus four small ones below** — the first card is spanning empty tracks. It looks broken.

He wants: any count — odd, even, 3, 5, 8, 12 — always looks deliberate.

## The fix — reuse the balanced-row system

The repo already has the solution: the `chunkBalancedRows` helper built for the Icon Card
section and applied to `ServicePropertyTypesSection` (max 4 per row; 5 → 3+2, 6 → 3+3,
7 → 4+3, 9 → 3+3+3…). Apply the same treatment here:

- **All cards equal size.** Remove whatever featured/col-span treatment makes the first
  card larger — that's the bug's source. If the owner ever wants a deliberate featured
  card, that's a Studio toggle for another day; default is uniform. (Note in the report
  that this changes the 8-card look too: previously-featured card becomes normal.)
- Rows chunked server-side with the shared helper — import it, don't copy it. Max 4 per
  row at `lg` (or 3 if the card design is wide — judge by eye against the current card
  width and say which you picked), 2 per row at tablet, 1 on phones, original order
  preserved.
- Equal heights within a row (flex column, "Learn more" pinned to the bottom), centred
  last row, consistent gaps.
- Cards keep everything they have now: photo, icon chip, title, description, link,
  hover treatment. This is layout-only.

## Scope check

Grep for every consumer of the section/component before editing. If `/services` (the
index page) or any city/industry page uses the same grid, they all get the fix — verify
each. The five-card sub-service band on service pages already uses the balanced helper;
don't touch it.

## Verify

1. `npx tsc --noEmit`, lint, build clean; typegen/`check:drift` clean if anything typed
   changed (layout-only likely doesn't).
2. With the live 5 services: 3+2 at desktop, no oversized card. Temporarily stub counts
   3, 4, 6, 7, 8 in the fallback data (revert after) and confirm each renders balanced.
3. 375/768/1024/1440 — no overflow, equal heights per row, links work.
4. Every consumer page checked and listed.
5. One commit.

Report: the per-row max you chose and why, the consumers found, and one line confirming
what an 8-service layout now looks like versus before.
