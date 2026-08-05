# Claude Code prompt — make `/about/partners` fully editable via a section stack

## Goal

The Partners page (`app/(site)/about/partners/page.tsx`) is hand-built: its hero copy,
platform explanations, credential list, onboarding steps and FAQ selection are hardcoded in
the page file, `data/` constants and section components. Convert it to the same editable
section-stack system as the service pages, homepage and About page: a `partnersPage`
singleton with `sections[]` the owner can edit, reorder, hide, duplicate and extend in
Studio.

**Follow the About-page conversion as the playbook** — read how `aboutPage.sections`, its
mapper, renderer, fallback and `scripts/seed-about-sections.ts` were built, and mirror all
of it, including the lessons that were learned the hard way:

- The seeder handles every dataset state (no doc / empty doc / partial), patches published
  **and** draft in one transaction, refuses on non-empty `sections[]`, verifies any
  leftover fields are content-free before unsetting, and can never delete a document or
  asset. Dry-run default, `--confirm` to write, owner runs confirm.
- Warn in the script output AND the report: close stale Studio tabs before confirming — a
  stale tab pressing Publish overwrites the seeded document (this exact accident happened
  with the About page).

## Step 1 — audit

Read the Partners page end to end and list every band and where its content lives today.
Expected bands (verify against the code, don't trust this list): dark hero with eyebrow /
heading / intro + credential chips; the vendor-platforms explainer (`PartnerPlatformsSection`
with the per-platform copy); the credentials/compliance band (`PartnerCredentialsSection`);
vendor onboarding steps (`VendorOnboardingSection`); the vendor FAQ (`vendorFaqs` from
`data/faqs.ts` via the FAQ section); testimonials; closing CTA. Note in the report:

- What stays **collection-driven** (trust logos via `getTrustLogos`, testimonials, possibly
  the FAQ docs) — those sections' stack items hold heading overrides + `hidden` only, with
  Studio descriptions pointing at where the collection lives.
- What derives from `siteSettings` (licence number etc.) — stays derived.
- The standing copy rules still bind: platform copy must not upgrade claims ("approved
  vendor" never becomes "certified"), no vendor logos fetched from anywhere, verbatim
  review quotes.

## Step 2 — the conversion

1. `sanity/schemas/partnersPage.ts` — singleton with `sections[]`. Reuse existing section
   types wherever a band matches one; create Partners-specific types only where nothing
   fits (`partnerPlatforms`, `partnerCredentials`, `vendorOnboarding` are likely). Include
   the generic library types in the union (Icon Card, map band if it's a type) so the owner
   can extend the page. Register in the schema index + Studio structure next to About Page.
2. `data/partnersPage.ts` — ordered default stack carrying the current copy **verbatim**;
   page renders pixel-identically before any Studio edit.
3. Mapper (`sanity/lib/partnersSections.ts` style-matched to the others: malformed →
   dropped with logged warning, `hidden` skipped) + renderer with `_key`-derived ids.
4. `sanity/lib/getPartnersPage.ts` with cache tag `partnersPage` (confirm `/api/revalidate`
   and Live need no change), GROQ projection, fetcher fallback on thrown error only.
5. `scripts/seed-partners-sections.ts` per the safety spec above. There is also an existing
   `scripts/seed-partners.ts` in the repo — check what it does first; do not duplicate or
   conflict with it, and say in the report how the two relate.
6. `npm run typegen` + `npm run check:drift` clean; regenerated types committed.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. Fallback path: `/about/partners` renders pixel-identical (diff text content), at
   375/768/1024/1440, no console warnings.
3. Seeder dry run prints a sane plan against the live dataset; nothing written.
4. After a local draft test (discard): reorder, hide one section, add an Icon Card — all
   reflected; no duplicate-id/key warnings.
5. Every other page unchanged; `/studio` shows Partners Page in the sidebar.
6. One commit (include the seeder and any leftover uncommitted scripts from the About work
   if they're still untracked).

## Report

The audit table (band → content source before/after); section types the Partners stack
accepts; how `seed-partners.ts` and the new seeder relate; the dry-run plan and the exact
confirm command; the stale-Studio-tab warning repeated where the owner will see it.
