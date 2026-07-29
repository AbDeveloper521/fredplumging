# Claude Code prompt — make the trust-logo strip bigger and better balanced

## Where

`components/ui/TrustLogoStrip.tsx` — one component, rendered in two places:
the **ServiceTrustSection** ("Trusted Maintenance Professionals…") on every service and
industry page, and the homepage **TrustBar**. Changing it improves both, which is intended.
Logos come from Sanity `trustLogo` documents via `getTrustLogos`; the owner has already
uploaded real logo images. Do not touch the fetcher, the schema, or the data.

## What is wrong today

Each uploaded logo renders as `<Image … className="h-9 w-auto opacity-70 grayscale …">`.
Three problems, visible in the owner's screenshot:

1. **Too small.** 36–40px tall reads as an afterthought under a full section.
2. **Same-height sizing makes mixed logos look uneven.** A compact squarish mark
   (VendorCafe) and a wide wordmark (NetVendor) forced to one height end up wildly different
   visual sizes. Height-only sizing is the wrong normaliser for a logo row.
3. **Some uploads have baked-in backgrounds.** The "Vendor Nexus" logo is a dark grey
   rectangle; Compliance Depot and RealPage sit on white boxes. On the `bg-offwhite` section
   these stray rectangles are what actually makes the strip look scrappy — bigger alone will
   make that worse, not better.

## The fix — uniform tiles

Replace the bare-image row with a row of **uniform white tiles**, one per logo:

- Each `<li>` becomes a fixed-size card: roughly `h-20 w-40 lg:h-24 lg:w-48`, `bg-white`,
  `rounded-xl`, a hairline `border border-grey-300/60`, subtle `shadow-card`, content centred
  with padding (`px-5 py-4` or similar — tune it by eye).
- The logo image fills the tile's content box with `object-contain`: switch the `<Image>` to
  `fill` inside a `relative` inner div, or keep width/height props with
  `h-full w-full object-contain` — whichever is cleaner, but **every logo must stay
  undistorted and fully visible inside an identical box**. That is what makes mixed shapes
  and baked-in background rectangles read as a tidy, even row: the white tile absorbs the
  white boxes, and the dark-boxed logo becomes a contained rectangle instead of a random blob.
- Keep the grayscale-with-hover-color treatment, but soften it: `grayscale opacity-80` at
  rest, full colour and full opacity on hover/focus-within, with the existing transition.
- Wordmark fallback (logos with no uploaded image) gets the same tile so the row stays even;
  centre the text in it.
- Keep the mobile behaviour: horizontal snap-scroll on small screens, centred row from `sm:`
  up. Tiles keep a fixed width so the scroll strip still works — check that the last tile
  isn't clipped and that `pb-2` still clears the scrollbar.
- If a logo has a `url`, do NOT add links — the current strip is non-interactive and stays
  that way; hover color is decoration, not affordance.

Bump the `resolvePhoto` width in `getTrustLogos` from `400` to `800` so the larger tiles
aren't upscaling a small asset (that call site only — nothing else).

## Sanity-side note for the report

The real long-term fix for the baked-in backgrounds is re-exporting those logos as
transparent PNG/SVG. Add one sentence to the `logo` field description in
`sanity/schemas/trustLogo.ts` recommending transparent-background files, and tell the owner
in your report **which of the currently uploaded logos have opaque backgrounds** so he knows
which ones to replace. Do not attempt to edit the images yourself and do not fetch new logo
files from vendor sites — they are third-party trademarks; only the owner's own uploads go in.

## Do not

- Do not change `ServiceTrustSection.tsx` or `TrustBar.tsx` beyond what spacing needs —
  the strip component is the change.
- Do not add a carousel/marquee animation.
- Do not touch `getGoogleReviews`, and no review structured data anywhere.

## Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build` clean.
2. `npm run dev` → a service page and the homepage: strip is visibly larger, all five tiles
   identical in size, no logo distorted or cropped, dark-boxed logo looks contained, hover
   brings colour back.
3. 375px (scroll works, nothing clipped), 768px, 1024px, 1440px.
4. A logo with no image still renders its wordmark tile at the same size.
5. One commit.

Report in two or three sentences: what tile size you settled on, and which uploaded logos
have opaque backgrounds the owner should re-export as transparent.
