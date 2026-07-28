# Service-sections audit

*Written 2026-07-29. Produced by `scripts/audit-sections.ts` (read-only — run
any time with `npx sanity exec scripts/audit-sections.ts`). Companion to
`SERVICE-SECTIONS-AND-VERCEL-PROMPT.md`.*

## Summary for the site owner — what you need to do

**Nothing is currently missing.** Every section on every service and industry
page is publishing and rendering. The "top banner disappeared when I added a
photo" problem was a styling bug in the website code (the photo box lost its
width the moment a real photo replaced the placeholder) — it is fixed, and the
photo you uploaded on the Plumbing page will now show. No field in the Studio
needs filling to bring anything back.

Three service pages have no page-builder sections at all and use the older,
plainer layout instead. That is how they were built — nothing broke — but if
you want them to match the Plumbing page, they each need their **Sections**
list filled in the Studio:

| Page | Status |
|---|---|
| /services/commercial-plumbing | No sections — legacy layout (by design, not a failure) |
| /services/senior-care-facilities | No sections — legacy layout (by design, not a failure) |
| /services/student-housing | No sections — legacy layout (by design, not a failure) |

All other pages (5 services with sections, 4 industry pages) render their full
section stack, top banner included.

## The vanishing-banner verdict, from evidence

- The audit found **zero dropped sections** across all 12 documents and 91
  sections — including the `plumbing` service the owner was editing, whose
  `serviceHero` (with its photo) is kept.
- The console warning `Image … has "fill" and a height value of 0` identified
  the real cause: the hero photo box is a grid item with
  `lg:justify-self-end` (shrink-to-fit) and no width of its own; a `fill`
  image is absolutely positioned and contributes no intrinsic size, so with a
  real photo the box computed to 0×0 and the whole right column vanished.
  Fixed by moving `lg:w-full lg:max-w-[440px]` onto the grid item, matching
  `HeroSection.tsx` and `FinalCTASection.tsx` which already did it right.
- Conclusion: **the CSS fix fully accounts for the symptom.** The
  silent-section-dropping design was a real latent fault (fixed separately —
  sections now degrade instead of vanishing, and any drop is logged), but it
  had not yet fired in the production dataset.

## Shrink-to-fit sweep — every `<Image fill>` ancestor checked

| File | Verdict |
|---|---|
| `components/sections/ServiceHeroSection.tsx:180` | ❌ **The bug** — fixed (width now on the grid item) |
| `components/sections/ServiceAboutSection.tsx` | ✅ grid item, default stretch; nested collage boxes size from `w-[46%]` of a definite parent |
| `components/sections/ServiceAreaCmsSection.tsx` | ✅ grid item, default stretch |
| `components/sections/ServicePropertyTypesSection.tsx` | ✅ card media inside `<li>` grid items (stretch) |
| `components/sections/IndustriesSection.tsx` | ✅ explicit `h-60` height |
| `components/layout/CmsDetailPage.tsx` | ✅ grid item, default stretch (`items-start` affects only the block axis) |
| `components/ui/ServiceCard.tsx` | ✅ `min-h-*` + stretch width on the card link |
| `components/sections/HeroSection.tsx:137` | ✅ already correct (`lg:w-full lg:max-w-[520px] lg:justify-self-end`) |
| `components/sections/FinalCTASection.tsx:73` | ✅ already correct |
| `components/sections/PartnerPlatformsSection.tsx:64` | ✅ `justify-self-end` but fixed `size-28`/`size-32` box, non-fill Image |
| `components/sections/WhyChooseUsSection.tsx:64` | ✅ `self-start` is block-axis only; inline size still stretches |

## Studio-required vs render-load-bearing reconciliation

*(Filled in by the degrade-instead-of-vanish change — the two columns must
agree on every row. This table is the regression test for the gate logic.)*

<!-- RECONCILIATION_TABLE -->

## Raw audit output — 2026-07-29, before any behaviour change

```
━━ service "commercial-plumbing" (updated 2026-07-28T18:05:30Z)
   no sections array — renders through the legacy CmsDetailPage layout.

━━ service "emergency-plumbing" (updated 2026-07-28T16:00:37Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] serviceAbout (seed-about) — kept
   ✓ [2] processSteps (seed-process) — kept
   ✓ [3] whatsIncluded (seed-included) — kept
   ✓ [4] serviceTrust (seed-trust) — kept
   ✓ [5] serviceFaq (seed-faq) — kept
   ✓ [6] serviceTestimonials (seed-reviews) — kept
   ✓ [7] relatedServices (seed-related) — kept
   ✓ [8] finalCta (seed-final) — kept

━━ service "drain-sewer" (updated 2026-07-28T18:09:36Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] serviceAbout (seed-about) — kept
   ✓ [2] whatsIncluded (seed-included) — kept
   ✓ [3] signsYouNeed (seed-signs) — kept
   ✓ [4] processSteps (seed-process) — kept
   ✓ [5] serviceTrust (seed-trust) — kept
   ✓ [6] serviceFaq (seed-faq) — kept
   ✓ [7] serviceTestimonials (seed-reviews) — kept
   ✓ [8] relatedServices (seed-related) — kept
   ✓ [9] finalCta (seed-final) — kept

━━ service "maintenance" (updated 2026-07-28T18:11:18Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] serviceAbout (seed-about) — kept
   ✓ [2] whatsIncluded (seed-included) — kept
   ✓ [3] comparisonTable (seed-table) — kept
   ✓ [4] processSteps (seed-process) — kept
   ✓ [5] serviceTrust (seed-trust) — kept
   ✓ [6] serviceFaq (seed-faq) — kept
   ✓ [7] serviceTestimonials (seed-reviews) — kept
   ✓ [8] relatedServices (seed-related) — kept
   ✓ [9] finalCta (seed-final) — kept

━━ service "specialty-services" (updated 2026-07-28T13:51:07Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] serviceAbout (seed-about) — kept
   ✓ [2] whatsIncluded (seed-included) — kept
   ✓ [3] processSteps (seed-process) — kept
   ✓ [4] serviceTrust (seed-trust) — kept
   ✓ [5] serviceFaq (seed-faq) — kept
   ✓ [6] serviceTestimonials (seed-reviews) — kept
   ✓ [7] relatedServices (seed-related) — kept
   ✓ [8] finalCta (seed-final) — kept

━━ service "plumbing" (updated 2026-07-28T18:48:24Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] serviceAbout (seed-about) — kept
   ✓ [2] whatsIncluded (seed-included) — kept
   ✓ [3] signsYouNeed (seed-signs) — kept
   ✓ [4] processSteps (seed-process) — kept
   ✓ [5] comparisonTable (seed-table) — kept
   ✓ [6] serviceTrust (seed-trust) — kept
   ✓ [7] serviceTestimonials (seed-reviews) — kept
   ✓ [8] propertyTypes (seed-properties) — kept
   ✓ [9] serviceFaq (seed-faq) — kept
   ✓ [10] serviceArea (seed-area) — kept
   ✓ [11] relatedServices (seed-related) — kept
   ✓ [12] finalCta (seed-final) — kept

━━ service "senior-care-facilities" (updated 2026-07-27T22:11:50Z)
   no sections array — renders through the legacy CmsDetailPage layout.

━━ service "student-housing" (updated 2026-07-27T22:11:50Z)
   no sections array — renders through the legacy CmsDetailPage layout.

━━ industry "apartments" (updated 2026-07-28T13:51:07Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] propertyTypes (seed-classes) — kept
   ✓ [2] whatsIncluded (seed-included) — kept
   ✓ [3] signsYouNeed (seed-signs) — kept
   ✓ [4] serviceAbout (seed-about) — kept
   ✓ [5] serviceTrust (seed-trust) — kept
   ✓ [6] serviceFaq (seed-faq) — kept
   ✓ [7] propertyTypes (seed-siblings) — kept
   ✓ [8] serviceTestimonials (seed-reviews) — kept
   ✓ [9] finalCta (seed-final) — kept

━━ industry "condos" (updated 2026-07-28T13:51:07Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] signsYouNeed (seed-signs) — kept
   ✓ [2] whatsIncluded (seed-included) — kept
   ✓ [3] comparisonTable (seed-table) — kept
   ✓ [4] serviceAbout (seed-about) — kept
   ✓ [5] serviceTrust (seed-trust) — kept
   ✓ [6] serviceFaq (seed-faq) — kept
   ✓ [7] propertyTypes (seed-siblings) — kept
   ✓ [8] serviceTestimonials (seed-reviews) — kept
   ✓ [9] finalCta (seed-final) — kept

━━ industry "assisted-living" (updated 2026-07-28T13:51:07Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] serviceAbout (seed-about) — kept
   ✓ [2] whatsIncluded (seed-included) — kept
   ✓ [3] processSteps (seed-process) — kept
   ✓ [4] signsYouNeed (seed-signs) — kept
   ✓ [5] serviceTrust (seed-trust) — kept
   ✓ [6] serviceFaq (seed-faq) — kept
   ✓ [7] propertyTypes (seed-siblings) — kept
   ✓ [8] serviceTestimonials (seed-reviews) — kept
   ✓ [9] finalCta (seed-final) — kept

━━ industry "nursing-homes" (updated 2026-07-28T13:51:07Z)
   ✓ [0] serviceHero (seed-hero) — kept
   ✓ [1] serviceAbout (seed-about) — kept
   ✓ [2] whatsIncluded (seed-included) — kept
   ✓ [3] comparisonTable (seed-table) — kept
   ✓ [4] processSteps (seed-process) — kept
   ✓ [5] serviceTrust (seed-trust) — kept
   ✓ [6] serviceFaq (seed-faq) — kept
   ✓ [7] propertyTypes (seed-siblings) — kept
   ✓ [8] serviceTestimonials (seed-reviews) — kept
   ✓ [9] finalCta (seed-final) — kept

════════════════════════════════════════════════════════════════════════
SUMMARY: 12 documents, 91 sections, 0 dropped.
```
