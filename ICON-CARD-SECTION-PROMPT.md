# Claude Code prompt — new "Icon Card" section type for service pages

## What this is

A new reusable section type in the service-page section stack, titled **"Icon Card"** in
Studio. The owner showed a reference: white cards on a dark band, each with a red square
icon chip, an uppercase heading, a paragraph, and a red "GET STARTED →" link. Build it as a
**type only** — register it so it can be added to any service/industry page from Studio,
but **do not add it to any page's content**; the owner will place it himself.

Read the existing section machinery first (`sanity/schemas/serviceSections.ts`,
`data/serviceSections.ts`, `sanity/lib/sections.ts`, `ServiceSectionRenderer.tsx`) and
follow its conventions exactly — this is the sixteenth-or-so type in an established
pattern, not an invention.

## Schema — `iconCardSection`

Section-level fields:

- `heading` (optional) + `eyebrow` (optional) — the demo has none, but the owner will want
  them sooner or later; both simply don't render when empty.
- **Background** — one control, three modes, described in owner language:
  - *Site default* (the page's normal light background)
  - *Dark navy* (the brand `navy-950` band, like the demo)
  - *Photo* — an `imageWithAlt` background image; when set it wins over the color modes and
    the section automatically applies a dark overlay so card shadows and any heading stay
    readable (reuse the hero's overlay treatment; no toggle needed here — cards on a raw
    photo always need it).
- **Default card color** — a preset palette, not a free hex field: White, Off-white, Navy,
  Red. Presets keep every choice on brand tokens and let the component pair each background
  with the correct text/icon colors automatically (navy/red cards get white text, light
  cards get ink text). A free color picker would let a well-meaning editor create unreadable
  white-on-yellow — don't offer one.
- `cards[]` — array, minimum 1, **no maximum**. Each card:
  - `icon` — the standard `navIcons` key picker (same as other sections)
  - `title` (required), `description` (required)
  - `ctaLabel` + `ctaHref` — optional, both-or-none (use the existing `ctaPair` validation
    convention; internal `/path` or full URL per the existing href field helper)
  - `cardColor` — optional per-card override of the section's default, same palette

## Layout — the row-balancing rule (the owner was specific)

Maximum **4 cards per row**, and rows must be **balanced**, not greedy:

- 1–4 cards → one row of n
- 5 → 3 + 2 (NOT 4 + 1)
- 6 → 3 + 3, 7 → 4 + 3, 8 → 4 + 4, 9 → 3 + 3 + 3, 10 → 4 + 3 + 3 …

That is: `rows = ceil(n / 4)`, then distribute `n` across rows as evenly as possible with
earlier rows getting the extra card. A plain CSS `flex-wrap` gives 4+1 for five cards, so
**chunk the rows server-side** (a tiny pure function — unit-test it inline or in the
verify step for n = 1..10) and render each row as a centred flex/grid row. Cards in the
same row share equal width and stretch to equal height (CTA pinned to the bottom of the
card, like the icon-card pattern already used elsewhere).

Responsive: the per-row math applies at `lg`+. At tablet cap rows at 2 cards, phones 1 per
row, in original order — no balancing needed below `lg`, just wrap.

## Component — `IconCardSection.tsx`

- Card: `rounded-2xl` (the demo's cards are square-cornered — keep the site's rounded
  corners instead; site consistency beats the demo mock), `shadow-card`, generous padding;
  red icon chip (`bg-red-600` with white icon, like the demo) on light cards, and on navy/red
  cards flip the chip treatment so it stays visible (white/10 chip, white icon).
  Title in the heading font; description muted; CTA styled like the existing
  "Get Started →" links with the arrow, hover shift, visible focus ring.
- Section spacing, `Container`, `Reveal` stagger — match neighbouring sections.
- Unique DOM ids from `_key` (duplicates in the stack are legal).
- Background photo: `<Image fill>` with the hotspot-aware crop pipeline; remember the width
  rule on grid items and that the container must have real height (`relative` + padded
  content, not an empty absolute box).

## Wiring

Union entry in the schema; interface in `data/serviceSections.ts`; validation case in
`sanity/lib/sections.ts` (minimum to render: at least one card with a title — malformed
cards are dropped individually with the section surviving, and the drop is logged like the
other cases); renderer mapping; GROQ projection for service AND industry stacks in
`sanity/queries.ts`. `npm run typegen` + `npm run check:drift` clean, regenerated types
committed. **No dataset writes, no fallback-data additions** — the type exists, no page
uses it until the owner adds it in Studio.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. Row math: assert the chunking function for n = 1..10 matches the table above.
3. In a local Studio draft on one service page (discard after): add an Icon Card section
   with 5 cards → renders 3+2 at 1440px; 2-per-row at 768; 1-per-row at 375. Try dark navy
   background + white cards, then a photo background → overlay present, text readable.
   Per-card color override works; a card with no CTA renders without a dangling link.
4. Every existing page renders unchanged (the type is additive).
5. Studio shows "Icon Card" in the add-section menu with sensible field descriptions.
6. One commit.

Report: the chunking function's output for 1–10, which background/card-color combinations
you verified for contrast, and confirmation nothing was added to any page or dataset.
