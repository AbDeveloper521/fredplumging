# Claude Code prompt — service pages: remove the vendor logo strip, badge strip fits 6 in one row

Two small changes, both visible in the owner's screenshot of a service page.

## 1. Vendor logos come off the service pages

Above the new "Licensed, certified, and affiliated" band, service pages still show the
**vendor platform tile strip** (VendorCafe, Compliance Depot, Vendor Nexus, NetVendor,
RealPage). That render comes from `ServiceTrustSection`'s `showLogos` block (the
`TrustLogoStrip` under the trust band) — confirm, then **remove that strip from the service
pages entirely**:

- Delete the logo-strip render from `ServiceTrustSection` (and any other service-page
  section that renders `TrustLogoStrip` — grep for consumers; industry pages share these
  sections and should lose it too, since the same duplication exists there).
- The `showLogos` field: keep it in the schema but make it inert, OR remove it from schema +
  mapper + types cleanly. Choose based on dataset reality: check read-only whether any
  published section sets it — if removal would produce unknown-fields noise on published
  documents, keep the field with an updated description ("No longer used — vendor logos now
  appear only on the homepage") and note it in the report. No dataset writes.
- The homepage `TrustBar` and the compliance band keep the vendor strip exactly as-is —
  that is now the vendors' only home, which is the owner's intent.

## 2. The badge strip shows all six in ONE row on desktop

Currently the six badges wrap 5 + 1 (TDLR drops to a second line). Fix the
`AssociationBadgeStrip` layout:

- At `lg`+ the row must fit **six** slots in one line: shrink the slot boxes and gaps until
  they fit the `Container` width — roughly `h-12 lg:h-14`, slot max-width ~`10rem`, gaps
  `gap-x-8` — tune by eye, but the acceptance test is: with these six real badges, one row
  at 1024px and 1440px, no wrap, no horizontal scroll, every badge legible.
- Below `lg`: 3×2 at tablet, 2- or 3-per-row on phones — wrapped, centred, all visible.
- Don't hardcode "6": the layout should stay a centred wrapping row that happens to fit six
  at desktop sizes — if the owner adds a seventh it wraps gracefully rather than shrinking
  to unreadability. Note this behaviour in the report.
- The NMSDC hexagon is much taller than the wordmark logos — keep vertical centring and
  `object-contain` so it doesn't dominate; if it visually overpowers at the shared height,
  a slightly tighter per-slot max-width is fine. No cropping.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. A service page: no vendor tiles anywhere; badge band shows all six in one row at 1024
   and 1440; wraps neatly at 768 and 375.
3. Homepage: TrustBar and compliance band unchanged (vendor tiles still there).
4. Industry pages: vendor strip gone there too, badge strip present and correct.
5. One commit.

Report: where the vendor strip was being rendered from, what you did with `showLogos`, the
final slot sizing, and what happens visually when a 7th badge is added.
