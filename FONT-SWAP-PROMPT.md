# Claude Code prompt — swap the site typeface: Montserrat headings, Roboto Condensed body

## What the client asked for

- **Headings:** Montserrat
- **Body text:** Roboto Condensed

Both are Google Fonts. The current heading font is Manrope. The client has seen the site and
does not like the current typeface, so this is a decision already made — implement it.

But implement it in a way that makes the **next** change a one-line edit, because the font
has now been changed more than once and it should never again require touching more than a
single file.

## The architecture — read this before editing

The project is **Tailwind CSS v4** with a CSS-first `@theme` block in `app/globals.css`.
**There is no `tailwind.config.js`/`.ts` file** and you must not create one. Font families
are theme variables in that `@theme` block, not JS config.

Fonts are loaded with `next/font/google` (currently Manrope) in the root layout. Keep that
approach — it self-hosts the font files, eliminates a render-blocking request to Google, and
sets up the automatic fallback metric adjustment that keeps layout shift down.

### The one-line switch

Define exactly two semantic tokens and route everything through them:

- `--font-heading` → Montserrat
- `--font-body` → Roboto Condensed

Every heading, every paragraph, every button and label resolves to one of those two. Nothing
in the codebase should name "Montserrat" or "Roboto Condensed" anywhere except the single
`next/font` import block in the root layout. Changing the typeface again then means editing
that one block and nothing else.

If the existing setup uses a different token name (`--font-sans`, `--font-display`), keep the
existing names rather than inventing new ones if they already mean heading/body — say which
you kept and why. Consistency with what's there beats my naming.

## What to do

1. **Audit first.** Report where the current font is defined and every place a font family is
   referenced: the root layout `next/font` import, the `@theme` block in `app/globals.css`,
   any `font-*` utility classes, any inline `style={{ fontFamily }}`, any CSS module, and —
   easy to miss — **any Open Graph image generation** (`next/og` / `ImageResponse` fetches
   font files separately and will silently keep the old font or fall back to a default). List
   them all before changing anything.
2. **Load both families** via `next/font/google` in the root layout:
   - `subsets: ["latin"]` only. Do not pull extended Latin/Cyrillic — this is a
     Dallas–Fort Worth plumbing site and every extra subset is dead weight on mobile.
   - `display: "swap"`.
   - Assign each to a CSS variable (`variable: "--font-heading"` / `"--font-body"`), and
     apply both variable classes to the `<html>` element.
   - Both are **variable fonts** with a wide weight axis. Load the weight *range* you
     actually use rather than a long list of static weights — check what the site uses
     (likely 400/500/600/700/800) and report the final payload difference versus Manrope in
     KB. If the total went up meaningfully, say so plainly.
   - Leave `adjustFontFallback` at its default (on). It matters more than usual here — see
     the note on condensed metrics below.
3. **Wire the `@theme` block** so `--font-heading` and `--font-body` are the theme values, and
   make body copy default to `--font-body` and `h1`–`h6` (plus any display/eyebrow styles) to
   `--font-heading`.
4. **Sweep for orphans.** Anywhere a component hardcodes a family or reaches past the tokens,
   fix it. Report the count.

## Optical adjustments — do not skip this part

A font swap that only changes the family name always looks worse than it should, because the
old sizing was tuned for the old font. Montserrat and Roboto Condensed have very different
metrics from Manrope. Budget real attention here:

**Montserrat (headings)**
- It is a geometric sans with a large x-height and generous letter width. At display sizes
  its default tracking looks loose. Apply negative letter-spacing on large headings —
  start around `-0.02em` for h1/hero, easing to `0` by h4 — and check it by eye.
- Default line-height will look too airy on multi-line headings. Tighten it (roughly
  1.1–1.15 for hero, 1.2–1.3 for section headings).
- Montserrat runs **wider** than Manrope at the same size. Check every heading that currently
  sits near a wrap point — hero headline, card titles, nav items, button labels — for new
  wrapping or overflow. This is where breakage will show up. List every place you adjusted.
- The uppercase red eyebrows ("VENDOR-READY AND FULLY COMPLIANT" etc.) need generous
  letter-spacing in Montserrat or they read as a solid block. Check them specifically.

**Roboto Condensed (body)**
- Condensed faces set **narrower**, so at the same nominal size the text will look smaller
  and denser than Manrope did. Nudge the base body size up slightly and increase line-height
  a touch to compensate. Report the values you landed on.
- Your text measure is currently tuned in `ch` units in places (the legal pages spec uses
  ~70ch). A `ch` measure with a condensed font produces a *physically narrower* column and
  more characters per line than intended — re-check that paragraphs still read comfortably
  and adjust the measure if they don't.
- Check small text hardest: form labels, helper text, footer links, card meta, the trust-badge
  captions. Condensed text at small sizes is where legibility is lost first. Confirm contrast
  still passes WCAG AA at the final sizes.

**Both**
- Verify the **numerals** — phone numbers appear all over this site (header bar, footer,
  every CTA). Check `972-564-9081` renders cleanly and doesn't look cramped in condensed.
- Check the logo is unaffected — it's an image asset and should not change. Confirm.
- **Sanity Studio has its own typography.** Do not touch it. Confirm `/studio` is unchanged.

## One honest note to pass to the client

Implement exactly what was asked. But include this in your report so the owner can relay it
if he wants to:

> Roboto Condensed was designed as a **space-constrained display face** — it's excellent for
> headings, navigation, labels, data tables and anywhere horizontal room is tight. It is not
> designed for long-form body reading; at paragraph length and small sizes, condensed
> letterforms measurably slow reading and tire the eye. On this site that mainly affects the
> service-page copy and the two new legal pages, which are long text runs.
>
> A common compromise that keeps the client's intended look: **Montserrat headings + regular
> Roboto body**, with Roboto **Condensed** kept for navigation, buttons, eyebrows, badges and
> card labels. It reads as the same design language while keeping paragraphs comfortable.

Because everything routes through `--font-body`, offering that variant afterwards is a
one-line change — which is the point of doing it this way. **Do not implement the compromise
now.** Build what was asked; just make the alternative cheap.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean.
   **No verification scaffolding left in `app/`** — a previous task shipped a broken harness
   route and failed the Vercel build. Do not create preview/compare routes; if you need to
   eyeball variants, do it in a scratch branch you do not commit, or with devtools.
2. Walk **every page type** at 375 / 768 / 1024 / 1440 and report what you checked: homepage,
   a service page, `/services`, `/areas-we-serve` and a city page, `/multifamily`, About,
   Partners, Careers, Testimonials, Contact, and the legal pages if they exist yet.
3. Specifically hunt for: headings that now wrap to an extra line, buttons whose label no
   longer fits, nav items that push the header layout, card titles that overflow their box,
   and any two-line hero that now looks unbalanced.
4. No layout-shift regression on first paint — confirm the fallback metric adjustment is
   active and the page doesn't visibly reflow when the webfont lands.
5. No console warnings. No requests to `fonts.googleapis.com` at runtime (they should be
   self-hosted by `next/font`) — check the network tab and confirm.
6. One commit; nothing uncommitted left behind.

## Report

The audit list of every place a font was referenced; the token names you used and the exact
one-line change needed to swap fonts again; the payload difference in KB versus Manrope; the
letter-spacing, size and line-height values you settled on for each family and why; every
place text re-wrapped or overflowed and what you did about it; confirmation that the logo and
`/studio` are untouched; and the note above passed through verbatim for the client.
