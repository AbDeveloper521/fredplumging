# Claude Code prompt — association/certification badge strip on every service page, full colour

## The two logo groups — keep them separate

The site now shows two different kinds of third-party logos and they must not mix:

1. **Vendor platforms** (VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, RealPage) —
   already handled by the `trustLogo` documents and rendered by `TrustLogoStrip` (white
   tiles, grayscale-until-hover) on the homepage TrustBar and the compliance band.
2. **Associations & credentials** (NMSDC Certified MBE, Minority Owned Business, AAGD —
   Apartment Association of Greater Dallas, Fort Worth Apartment Association, Texas State
   Board of Plumbing Examiners, TDLR) — the owner wants these as a **new band on every
   service page**, and unlike the vendor strip they should render **in full colour, no
   grayscale, no dimming** ("brighten"). Certification badges dimmed to grey read as
   decoration; at full colour they read as credentials, which is the point.

## Use the existing system — do not build a second logo pipeline

`trustLogo` documents already carry a `category` field validated against
`TRUST_LOGO_CATEGORIES` in `data/navigation.ts`. Check what categories exist:

- If a fitting category (e.g. `association` / `credential`) exists, use it.
- If not, add one — schema options list + the `TRUST_LOGO_CATEGORIES` allow-list + typegen.
  Give it a clear Studio title like "Association / certification badge" with a description:
  "Badges in this category appear automatically in the credentials strip on every service
  page."

That is the whole "automatic" mechanism the owner asked for: **he uploads a logo in Studio →
Trust Logos → sets the category → it appears on every service page.** No per-page editing.
Say exactly this in your report so he knows the workflow.

## The new component

`components/sections/AssociationBadgeStrip.tsx` (server component):

- Filters `getTrustLogos()` output to the association category. Empty result → renders
  nothing (section hides, standard behaviour).
- Light band (`bg-white` or `bg-offwhite` — match what sits above it), optional small
  centred heading — something factual like "Licensed, certified, and affiliated" is fine,
  but keep it one short line and put it in the fallback data, not hardcoded prose claims.
- Logos rendered **full colour at rest**: `object-contain` inside even fixed-height slots
  (`h-14`–`16`, width auto with a max), generous gap, centred row, wrapping to two rows on
  mobile rather than horizontal scroll (badges are credentials — all should be visible).
  **No grayscale, no opacity filter, no invert.** A subtle uniform treatment (consistent
  slot height, vertical centring) is what makes mixed badge shapes look tidy — same lesson
  as the tile strip, minus the tiles unless mixed backgrounds demand them; decide by eye
  and say which you chose.
- Alt text comes from the uploaded image's alt as usual; the resolver's alt-guard stays.

## Placement

Rendered by the **service page template** (both the sections path and the legacy
`CmsDetailPage` path), automatically on every service page — directly **above the
Google-map band** at the bottom, matching the owner's WordPress reference where the badges
close the content. Not added to the homepage, industry, or city pages in this task — note
in the report that it's one line to add later if he wants it there.

## Rules

- Never download the badge images yourself — AAGD, TDLR, TSBPE, NMSDC logos are third-party
  marks; only the owner's own uploads go in, via Studio.
- Do not change `TrustLogoStrip` or the vendor strips' styling — the grayscale treatment
  there stays.
- Cache: same `trustLogo` tag; confirm no `/api/revalidate` change is needed.
- `npm run typegen` + `npm run check:drift` clean.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. With no association-category logos in the dataset, service pages render unchanged (band
   absent, no gap artifacts).
3. Add one via a local Studio draft (discard after): the badge appears on every service
   page, full colour, above the map band, correct on 375/768/1024/1440.
4. Homepage TrustBar and compliance band unchanged.
5. One commit.

Report: the category key used (existing or new), the exact Studio workflow for the owner
(where to click, which category to pick), the styling decision (bare row vs tiles), and
confirmation the vendor strips are untouched.
