# Claude Code prompt — simplify every service page to the owner's reference layout, with the exact reference text

## What the owner asked for

His WordPress plumbing page (screenshot transcribed below) is the model. Every service page
should follow the same **simple** structure — a centred hero over a background photo, then a
short run of sections, nothing extra. Styling may be more creative than the reference, but
**the text must be exactly what is transcribed here — no additions, no rewrites**. Typography
fixes only (en dashes, "multi-family"). Headings in the reference are Title Case banners;
keep the site's existing heading style rather than copying WordPress's ALL-CAPS card titles.

The service pages already use the `sections[]` stack (Sanity-driven, with `data/` fallbacks
and a validated renderer). This task is therefore mostly **content + one redesign**, not new
architecture. Reuse existing section types wherever they fit; only build something new if no
type matches, and say so in the report.

## Part 1 — hero redesign (applies to ALL service and industry pages)

Restyle `ServiceHeroSection` to match the reference's first section: a **full-width
background photo** (the section's photo field; `ImagePlaceholder`-equivalent dark navy wash
when no photo is set), darkened with a navy/black gradient overlay so text passes contrast,
with **centred content**: red-rule eyebrow "FRED'S PLUMBING", the H1, and the subheading
paragraph at a readable measure (~65ch max). Keep the section's existing CTA fields working
if present in the data — render them as centred buttons under the paragraph; the reference
shows none, so they simply won't render where unset.

- The background image uses the hotspot-aware pipeline (`resolvePhoto` crop support) — a
  background hero is the worst case for blind cropping.
- Kill the old two-column hero layout entirely for this section type; one hero style
  everywhere. Remember the old bug: no width-less `justify-self` grid items, and no
  `<Image fill>` inside a box that can measure zero. Test with and without a photo.
- Check `min-h` behaviour on mobile — the reference hero is a shallow banner, not 100vh.

## Part 2 — the plumbing page gets the reference content, exactly

Target: the `service` document with slug `plumbing` (and its fallback entry in `data/`).
Map each reference band to the best existing section type; the stack becomes exactly this,
in this order, and nothing else:

1. **Hero** — H1: `Plumbing Services in the Dallas–Fort Worth Metroplex`. Subheading:
   > Fred's Plumbing provides high-quality plumbing solutions for multi-family and
   > commercial properties throughout the Dallas–Fort Worth Metroplex. From complex system
   > installations to routine repairs, our licensed plumbers deliver precise, reliable work
   > that keeps your property running smoothly.

2. **About** (`serviceAbout` — collage + 24/7 badge + copy + CTA). Heading:
   `About Our Plumbing Services`. Paragraphs:
   > Since 1996, Fred's Plumbing has been trusted by property managers, facility owners, and
   > investors throughout the Dallas–Fort Worth Metroplex. Our technicians are fully
   > licensed, insured, and trained to meet the highest safety and quality standards.

   > We handle every aspect of plumbing repair and installation for large-scale residential
   > and commercial buildings. Whether replacing pipes, repairing leaks, or upgrading
   > outdated systems, we use advanced tools and proven methods to deliver long-lasting
   > performance.

   CTA: `Contact Us` → `/contact`.

3. **Sub-service cards** — three cards, each with a photo slot and a `Get Started →` link.
   Use the closest existing card section type (check `ServicePropertyTypesSection` /
   `WhatsIncludedSection` before writing anything new). Cards:
   - `Slab Leak Repair` — > Our advanced leak detection and repair techniques prevent
     structural damage and save you from costly water loss beneath concrete foundations.
   - `Piping Services` — > From copper to PEX systems, our team repairs, replaces and
     installs plumbing pipes for projects across DFW.
   - `Commercial Installs & Replacements` — > We handle plumbing equipment installations and
     replacements for multi-unit buildings, offices, and commercial properties, providing
     efficient, code-compliant service every time.
   Card links: point at the matching existing service/industry pages if they exist; if a
   card has no matching page, link to `/contact` and flag it in the report — do not invent
   routes.

4. **Trust band** (`serviceTrust` — heading + three icon features + the logo strip toggle
   OFF here; the badges come at the end). Heading:
   `Trusted Plumbing Professionals Across the DFW Metroplex`. Items:
   - `Proven Experience` — > Over 30 years of delivering reliable plumbing solutions to
     commercial and multi-family properties across Dallas and Fort Worth.
   - `Fast Response Times` — > Our 24/7 emergency service ensures you get immediate help
     whenever you need it.
   - `Advanced Technology` — > We use modern equipment for diagnostics, leak detection, and
     repairs to ensure precision and minimize disruption.

5. **Reviews** — the existing Google-reviews strip ("What Our Clients Say"), exactly as the
   service pages already render it. Verbatim quotes, no markup, untouched system.

6. **Heritage band** — a second `serviceAbout`-style band (duplicates are legal in the
   stack), dark treatment like the reference if the type supports it or via the closest
   dark band type. Heading: `Trusted Commercial Plumbers Serving the DFW Metroplex Since
   1996`. Paragraphs:
   > Founded in 1996, Fred's Plumbing has built a reputation for professionalism,
   > reliability, and precision workmanship. We specialize in providing plumbing services
   > for property management companies, facility owners, and real estate investors who value
   > fast, dependable results.

   > By combining advanced techniques with top-quality materials, we deliver plumbing
   > systems that meet the demands of high-occupancy properties and complex infrastructure.
   > Every project reflects our dedication to safety, efficiency, and lasting performance.

   CTA: `Contact Us` → `/contact`.

7. **Service-area band** (`serviceArea` type). Heading: `Proudly Serving the Entire
   Dallas–Fort Worth Metroplex`. Body:
   > Fred's Plumbing serves commercial and multi-family clients across Dallas, Fort Worth,
   > Arlington, Irving, Plano, Garland, Grand Prairie, and surrounding areas. Wherever you
   > manage property in North Texas, our experienced team is ready to help.
   City list verbatim — do not add or remove cities. CTA: `Contact Us`.

8. **Badges strip** — the existing `TrustLogoStrip` row, then the map band + footer that
   already close every service page. No FAQ, no process, no comparison table, no final-CTA
   form section — "no extra section" is the instruction.

Transcription caveat: the screenshot is small; the About card paragraphs marked as quotes
above were read carefully, but flag in the report any sentence you had to squint at so the
owner can check it against WordPress. The floating accessibility-widget buttons in the
reference are a WordPress plugin — do not build them.

### How the content lands

The live pages read Sanity first, so changing fallbacks alone changes nothing in
production. Same discipline as before:

- Update the plumbing entry in the `data/` fallbacks to this exact stack.
- Write `scripts/apply-simple-service-template.ts` (`sanity exec`): **dry-run by default,
  writes only with `--confirm`**, patches only `service` documents' `sections` arrays,
  preserves image asset refs already on matching sections (the owner has uploaded photos —
  carry them into the corresponding new sections rather than dropping them), never deletes
  a document, never touches other types. For sections being **removed** from a page, the
  dry run must list exactly what content would disappear, per service.

## Part 3 — the other service pages

Same template, their own content. For every other `service` document: keep sections whose
types are in the template's set (hero, about, cards, trust, reviews, heritage, area),
reorder to the template order, and **list — do not silently delete — any section that falls
outside the template** (FAQ, process, comparison, etc.). The dry run prints, per service,
"keeps / reorders / would remove", and the owner decides with `--confirm`. Their text is not
touched — only plumbing gets new text. Industry/multifamily documents: hero redesign applies
(shared component), stacks untouched.

## Do not

- No invented text anywhere — if a template slot has no content for some service, the
  section renderer already knows how to skip; leave it absent rather than writing filler.
- No review markup, no `getGoogleReviews` changes, no dataset writes outside the script.
- Do not remove section *types* from the schema — pages the owner may build later can still
  use them.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. Fallback path: `/services/plumbing` renders the eight bands above in order, text
   matching this file word-for-word (diff it, don't eyeball). 375/768/1024/1440, no console
   warnings, hero legible over both a photo and the no-photo wash.
3. Every other service page renders with the redesigned hero and no layout breakage.
4. Dry run of the script prints a complete per-service plan; nothing written.
5. One commit.

## Report

The section-type mapping you chose for bands 3 and 6; the per-service "would remove" list
from the dry run; any transcription doubts; the confirm command for the owner.
