# Claude Code prompt — compliance band: strip it back to heading + paragraph + logo strip

## What to change

The homepage **"Fully Compliant and Approved Across Leading Vendor Systems"** band
(`ComplianceSection`, `homeCompliance` in the stack) currently renders four things. The
owner wants only the first and last kept:

**Remove entirely:**
- the checklist of compliance items (Licensing documentation, Insurance verification,
  Background requirements, Vendor portal compliance, Service documentation,
  Property-specific coordination)
- the CTA button under it ("Discuss vendor requirements" or similar)
- the whole right-hand **"Vendor Compliance Status"** dashboard panel (the mock card with
  "In good standing", Verified/Current/On file/Active rows) — this is the
  `ComplianceDashboardPanel` component; check whether it is used anywhere else before
  deleting the component itself. If unused elsewhere, delete it; if used, leave the
  component and just stop rendering it here.

**Keep and re-layout:**
- the red eyebrow ("VENDOR-READY AND FULLY COMPLIANT"), the heading, and the paragraph —
  now spanning the **full container width** instead of the left half. Two-column grid goes
  away. Choose centred or left-aligned by eye against the neighbouring bands and say which;
  keep the paragraph to a readable measure (~70ch) even at full width so it doesn't run
  edge to edge as one long line.
- the vendor logo strip below, exactly as it is now (still filtered to vendor-platform
  categories from Trust Logos).

Band spacing should tighten to suit the shorter content — no large empty gap where the
panel used to be.

## Schema side

The removed pieces have fields in `homeCompliance` (the items list, the CTA pair). Check
the dataset read-only first:

- If no published document has content in them, remove the fields from the schema, the
  mapper, GROQ and types cleanly.
- If the live document does carry values, keep the fields but stop rendering them, and
  report it — do not create unknown-field warnings or destroy content the owner typed.

Either way `data/homePage.ts` drops those values from the default stack. `npm run typegen`
and `check:drift` clean; regenerated types committed.

## Check other pages

Grep for `ComplianceSection` / `homeCompliance` consumers. If any other page renders this
band, it gets the same simplified layout — list every page you checked. The vendor logo
strip on other pages is untouched.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen, `check:drift` — all clean. (The
   build must pass — a previous commit shipped a broken route; do not leave scaffolding.)
2. Homepage: band shows eyebrow + heading + paragraph full width, then the vendor logos;
   no checklist, no button, no status panel; spacing looks intentional at 375 / 768 / 1024
   / 1440.
3. Every other page unchanged; the badge strip and other logo strips unaffected.
4. One commit, nothing uncommitted left behind.

## Report

What happened to `ComplianceDashboardPanel` (deleted or kept for another consumer); whether
the removed fields were dropped from the schema or only unrendered, and why; the alignment
choice for the full-width text; and every consumer page you checked.
