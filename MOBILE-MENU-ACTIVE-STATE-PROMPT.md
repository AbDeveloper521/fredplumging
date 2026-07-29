# Claude Code prompt — clean up the mobile menu's active/expanded states

## The problem

`components/layout/MobileMenu.tsx`. Open the mobile menu while on a service page, e.g.
`/services/plumbing`, and look at the Services group:

- The **Services** parent row gets `bg-white/6` because `isSectionActive` matches
  `/services/*`.
- The **Plumbing** child row gets its own `bg-white/6` because `isExactActive` matches.

So two stacked translucent pills light up at once, and because the child list is only
indented with `pl-4` and has no vertical breathing room from the parent row, the two rounded
pills sit flush against each other and read as one broken, overlapping blob. The owner's
screenshot shows exactly this. He wants the menu neat and clean.

This is a **styling-only** task. Do not change the navigation data, the accordion logic, the
label-navigates / chevron-expands split (that is deliberate and good), the focus handling,
the body-scroll lock, or anything outside this component. `navActive.ts` stays as it is —
both helpers are correct; the problem is what the styles do with them.

## The fix — one highlight, two different vocabularies

The rule to implement: **the filled pill belongs to the current page only.** A parent whose
*section* is active gets a marker, not a fill, so the two states can never be confused or
visually collide.

**1. Parent row.** Remove the `bg-white/6` fill from the section-active state. Instead mark
it with a small red accent: a `2px`-wide rounded red bar (`bg-red-500`) hugging the left
edge of the row, plus keeping the label white. Inactive parents stay as they are. Keep
`aria-current` exactly as it is — this changes paint, not semantics. Hover behaviour is
unchanged.

**2. Child rows.** The exact-active child keeps a fill — it is "you are here" — but make it
look intentional rather than accidental: `bg-white/8`, and give its icon chip the red
treatment (`bg-red-600/15` behind the already-red icon) so the active row is unmistakably
distinct from a hover. Inactive children unchanged.

**3. Separate the layers.** Give the expanded children container its own quiet surface so
the group reads as parent-plus-panel instead of pills touching pills:

- Wrap the child `<ul>`'s visible content in a rounded container — `rounded-xl bg-white/3`
  (or a hairline `border-white/8` if the tint is invisible on `navy-950` — check on a real
  phone-width screen, not just devtools) with a little inner padding.
- Add `mt-1` between the parent row and the panel, and `mb-2` after it, so collapsed
  neighbours don't shift oddly when a group opens.
- Keep the indent modest — the current `pl-4` plus container padding may be too much at
  375px; the child descriptions must not wrap to three lines. Tune it.
- **The open/close animation must stay smooth.** The accordion animates via
  `grid-rows-[0fr]` → `grid-rows-[1fr]` with an `overflow-hidden` inner. Margins or padding
  *outside* the overflow-hidden element will jump instead of animating — keep any new
  vertical spacing inside the animated wrapper (or on elements that already animate), and
  verify the transition still glides with no end-of-animation snap. `motion-reduce` variant
  must keep working too.

**4. The expanded-but-inactive case.** When a visitor expands a group they are *not* inside,
nothing should look "selected" — the panel surface appears, the chevron rotates, and that is
all. Verify this case explicitly; it is the one that usually regresses.

## Do not

- Do not touch `DesktopNav.tsx`, `MegaPanel.tsx` or `NavListPanel.tsx`. Desktop is fine. If
  you notice the same double-highlight exists on desktop, mention it in your report — do not
  fix it unasked.
- Do not change `NavFeaturedCard`, the header row, or the pinned Request Service button.
- Do not add new dependencies or animation libraries.

## Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build` clean.
2. `npm run dev` at 375px and 414px widths. Walk through, listing what you saw:
   - On `/services/plumbing`, open the menu: Services shows the red left bar (no fill),
     Plumbing shows the single filled pill. Exactly one filled element in the whole list.
   - Navigate to `/services` itself: Services shows the red bar; no child is filled.
   - Expand About Us while on a Services page: About Us panel opens with no active styling
     anywhere inside it; Services keeps its red bar.
   - Collapse/expand each group twice: animation smooth both directions, no layout jump,
     no clipped shadow or border at the animation end.
   - Keyboard: tab through the open menu; every row and chevron shows a visible focus ring;
     Escape still closes.
3. Check the menu on a page outside every group (e.g. `/`): nothing marked active.
4. One commit.

Report in two or three sentences: what surface treatment you used for the expanded panel,
and whether the desktop mega-menu has the same double-highlight (do not fix it).
