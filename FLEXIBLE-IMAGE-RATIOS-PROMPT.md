# Claude Code prompt — flexible image ratios site-wide: any upload fits, with an optional per-image frame-ratio control in Studio

## What the owner wants

Two things, everywhere a CMS image renders on the site:

1. **Any image he uploads must fit its frame cleanly** — square, tall portrait, wide
   landscape, whatever. Never stretched, never letterboxed, never a collapsed box, and never
   a blind centre-crop that cuts a technician's head off.
2. **An optional ratio control in Studio per image slot** — by default each slot keeps the
   ratio the design intended, but he can override it ("make this one square", "show this one
   uncropped") without touching code.

## Ground rules — read the current state first

- Check whether `SQUARE-ABOUT-IMAGE-PROMPT.md` was executed: does `resolvePhoto` in
  `sanity/lib/image.ts` already support a crop/aspect argument with `.fit("crop")`? If yes,
  **generalise that mechanism** — do not build a parallel one. If no, this prompt subsumes
  it: build the mechanism described here and apply it to the serviceAbout square as one of
  the call sites.
- `sanity/schemas/fields.ts` has the shared `imageWithAlt` helper; nearly every image field
  in the repo is built from it. That is the single place the new Studio control goes —
  extend the helper, and every slot (serviceSections, homePage sections, cityPage,
  aboutPage, contactPage, trustLogo excepted — see below) gets it for free. Verify with a
  grep that all content image fields really do go through the helper; convert any stragglers
  to it rather than special-casing them.
- Read `CLAUDE.md` + vendored Next docs. Next 16.2.11, Tailwind v4 `@theme`, no
  `tailwind.config`. Check `@sanity/image-url` types in `node_modules` before using builder
  methods.

## The design

### 1. Studio control — extend `imageWithAlt`

Add one optional field to the helper, `frameRatio`, a radio/dropdown with plain-language
options:

- **Designed for this spot (default)** — the component's own ratio; empty value.
- **Square (1:1)**
- **Landscape (4:3)**, **Wide (16:9)**
- **Portrait (3:4)**
- **Original — show the whole image uncropped** — the frame adopts the upload's own ratio.

Field description in owner language: "How this photo's frame is shaped on the page. Leave on
the default unless the photo looks wrong in its spot. Whatever you choose, drag the hotspot
circle (click the image → Edit hotspot) over the part that must stay visible."

Individual call sites may pass an option to hide `frameRatio` where an override could break
a composition (see §3).

### 2. Rendering — one pipeline, hotspot-aware

Extend `resolvePhoto` so every call site passes its **design ratio** and the function
returns, on the `CmsPhoto` it already produces:

- `url` built with **`.fit("crop")` + width + height derived from the effective ratio**, so
  Sanity's CDN applies the editor's hotspot/crop and the browser never has to blind-crop.
  Effective ratio = editor's `frameRatio` override if set, else the call site's design ratio.
- For **Original**: no crop — `fit("max")` as today — and the intrinsic ratio parsed from
  the asset `_ref` (the ref encodes dimensions: `image-<hash>-1254x1254-png`; parse it, don't
  fetch metadata). **Clamp what layouts must absorb**: cap the rendered frame between 2.4:1
  and 1:1.6; an image outside the cap renders at the nearest capped ratio with hotspot crop,
  and the dry, honest field description warns about extreme panoramas/towers.
- `ratio` (a number or `"w/h"` string) returned alongside `url` + `alt`, so components can
  set the frame from data.
- Existing callers that pass nothing keep today's exact behaviour — `fit("max")`, no ratio —
  so nothing regresses by default. The alt-guard, `logImageSkipped`, and undefined-return
  contract are untouched.

Components change from hardcoded `aspect-[4/3]`-style classes to
`style={{ aspectRatio: photo?.ratio ?? "<design default>" }}` on the frame (keep
`overflow-hidden rounded-2xl` etc.), with `object-cover` on the `<Image>` and a `sizes` prop
that still reflects the layout width. `ImagePlaceholder` inherits the frame, so empty slots
keep the design ratio.

### 3. Where the override is allowed — a judgement pass, not a blanket switch

Go slot by slot (services/industry sections, homepage sections, about/contact/city pages)
and classify:

- **Free slots** — standalone image bands where any sane ratio works (serviceAbout primary,
  caseStudy, emergency, evolution/about-page photos…): full `frameRatio` control.
- **Composition slots** — frames load-bearing for a layout: the hero collage overlap, the
  `ServiceHeroSection` tall banner (remember its width-on-the-grid-item fix — a ratio
  override there interacts with `justify-self-end`; test it specifically), anything
  absolutely positioned against a sibling. For these either hide `frameRatio` or restrict
  its options to ratios the composition survives. Decide per slot and list the decisions in
  the report.
- **Not in scope**: `trustLogo` images (the tile strip has its own object-contain system),
  reviewer avatars (none exist by policy), and the map iframe.

Also update each image field's Studio description so the owner knows the control exists —
this feature is invisible if only the code knows about it.

### 4. Layout resilience

A taller frame changes column heights. After wiring, sweep every page at 375/768/1024/1440
with deliberately hostile test images (a 1:3 tower, a 3:1 panorama, a tiny 200px square) set
via a local Studio session on the **serviceAbout primary** and one homepage slot: nothing
overlaps, badges stay pinned correctly, `lg:items-center` grids still read sanely, no
`<Image fill>` zero-height regressions (watch the console for the "fill and height 0"
warning). Do not publish test edits to the production dataset — use drafts and discard, and
say what you did.

## Do not

- Do not touch `getGoogleReviews` or the reviews/testimonials system.
- Do not change `trustLogo` rendering.
- Do not introduce a second image-resolution path — one `resolvePhoto`, one helper.
- Do not make "Original" bypass the clamp.
- No dataset writes beyond discarded local drafts.

## Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run typegen`,
   `npm run check:drift` — clean; regenerated `sanity.types.ts` committed.
2. With **no** overrides set anywhere: every page renders pixel-identical to before (the
   default path must be a no-op). Spot-check homepage, one service page, one industry page,
   partners, careers.
3. Hostile-image sweep from §4, plus: portrait upload + top hotspot → head stays in frame at
   every ratio option; "Original" on a mildly tall image → whole image visible, no crop.
4. Studio: `frameRatio` appears on free slots with the plain-language description, hidden or
   restricted on composition slots.
5. One commit.

## Report back

- The slot classification table: free / restricted / hidden, with one-line reasons.
- What `resolvePhoto`'s signature became and confirmation the default path is byte-identical
  URLs to before.
- The clamp bounds you shipped and what a 1:3 tower actually renders as.
- Anything that needed a per-component fix during the hostile sweep.
