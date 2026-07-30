# Claude Code prompt — build the Fort Worth city page (`/areas-we-serve/fort-worth`)

## 0. This is the second city page — do not build it from scratch

`DALLAS-CITY-PAGE-PROMPT.md` (in this repo root) established the pattern: a reusable city-page
template driven by data, a `data/cities.ts` fallback, a Sanity `cityPage` document type keyed by
slug, and a `getCityPage(slug)` fetcher. Fort Worth is the payoff for that design.

**First, check whether the Dallas prompt has been run** (does `data/cities.ts` exist? is there a
`cityPage` schema? does `/areas-we-serve/dallas` render a real page?).

- **If yes:** this task is exactly what that prompt promised — one data entry, one route file.
  Add the Fort Worth entry to `data/cities.ts` with the copy in §1, and replace the
  `PagePlaceholder` in `app/(site)/areas-we-serve/fort-worth/page.tsx` with a route that calls
  `getCityPage("fort-worth")` and renders the same template Dallas uses. **No new components, no
  schema changes.** If you find yourself editing a component, stop and reconsider — either the
  template has a Dallas-specific hardcode that should be fixed (fix it, verify Dallas is
  pixel-identical after), or you are overbuilding.
- **If no:** do the Dallas prompt first, in full, then come back to this file. Do not build Fort
  Worth as a standalone page — that creates the divergence the template exists to prevent.

All standing rules from the Dallas prompt apply unchanged: no images copied from WordPress or
stock libraries (`ImagePlaceholder` with descriptive labels everywhere); association badges only
via the existing `TrustLogoStrip`; reviews only via the existing `TestimonialsSection` with
verbatim quotes; no `AggregateRating`/`Review` markup anywhere; no invented street address; do
not touch `getGoogleReviews`.

## 1. The Fort Worth copy, transcribed from the owner's reference

Same caveats as Dallas: low-resolution screenshot, typography fixes only (en dashes,
"multi-family", "long-lasting", "high-occupancy"), claims must not be upgraded. Flag any
sentence you doubt in your report. One line was partially cut off in the source — marked below.

**Hero** — H1 **"Plumbing Services in Fort Worth, Texas"**:

> Fred's Plumbing provides professional plumbing solutions for multi-family and commercial
> properties throughout Fort Worth. Our experienced team delivers reliable service, high-quality
> workmanship, and efficient repairs that support the daily needs of property managers, owners,
> and residents across the city.

**Services band** — heading **"Reliable Plumbing Services in Fort Worth"**, five cards:

- *Plumbing* — From routine maintenance to full system installations, our team handles all
  types of plumbing projects for commercial and multi-family buildings across DFW.
  *(The opening words were clipped by an overlay in the source — "From routine maintenance" is
  a reconstruction; flag it for the owner.)*
- *Drain & Sewer* — We provide professional drain cleaning, hydro jetting, and sewer line
  repair to prevent backups and keep your property's systems flowing smoothly.
- *Specialty Services* — Our expertise extends to boiler, backflow, gas, and advanced
  diagnostics for complex plumbing challenges.
- *Maintenance* — Prevent costly downtime with scheduled maintenance plans designed to protect
  your infrastructure and ensure compliance with local codes.
- *Emergency Repairs* — Available 24/7 for burst pipes, leaks, and urgent repairs, we deliver
  immediate response when your tenants or facilities need it most.

Card links resolve to the same real service pages the Dallas cards point at.

**Why choose us** — heading **"Why Choose Us in Fort Worth"**:

> Property managers throughout Fort Worth trust Fred's Plumbing because we deliver fast
> service, clear communication, and long-lasting results. Our team has extensive experience
> with the plumbing needs of large buildings and uses advanced technology to ensure accurate
> diagnostics and efficient repairs. We focus on protecting your property, reducing downtime,
> and maintaining a safe environment for your residents.

**Reviews** — "What Our Clients Say", existing component.

**Heritage band** — heading **"Serving Fort Worth with Quality and Integrity Since 1996"**:

> Fred's Plumbing has delivered trusted plumbing solutions to the Fort Worth community for
> nearly thirty years. Our team understands the unique challenges of managing large-scale
> plumbing systems in high-occupancy properties and brings the knowledge needed to resolve
> issues quickly and correctly.

> We are committed to providing service that is safe, efficient, and built to last. Whether you
> need emergency repairs, preventive maintenance, or complex system support, we are here to
> serve your property with professionalism and care.

**Communities band** — heading **"Proudly Serving Fort Worth and Surrounding Communities"**:

> Our services extend throughout Fort Worth and into nearby areas including Arlington, North
> Richland Hills, Haltom City, Mansfield, Benbrook, and other surrounding neighborhoods.
> Wherever your property is located, our team is ready to assist with dependable plumbing
> service.

The community list (Arlington, North Richland Hills, Haltom City, Mansfield, Benbrook) is the
client's own — keep exactly, add nothing.

Note the copy is genuinely different from Dallas — different sentences, different card
descriptions, different communities. That difference is deliberate (it is what keeps these from
being doorway pages) and must survive: **do not "harmonise" the two cities' wording.**

## 2. SEO

- `metadata`: title like "Plumbing Services in Fort Worth, TX | Fred's Plumbing", a Fort
  Worth-specific description, `alternates.canonical: "/areas-we-serve/fort-worth"`.
- `BreadcrumbJsonLd`: Home → Areas We Serve → Fort Worth.
- Check `app/sitemap.ts` — the route is likely already listed; confirm, don't duplicate.
- Same prohibitions as everywhere: no review markup, no `PostalAddress`.

## 3. Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build` clean. If the schema changed at all
   (it should not have), `npm run typegen` + `npm run check:drift` clean too.
2. `npm run dev` → `/areas-we-serve/fort-worth` at 375px, 768px, 1024px, 1440px; no console
   errors or warnings; mobile call bar covers nothing.
3. `/areas-we-serve/dallas` still renders **pixel-identically** — this is the regression risk
   of a shared template; screenshot both before and after if you touched any shared code.
4. All five card links land on real pages.
5. Reviews band shows the real Google reviews, verbatim.
6. `/studio` still loads.
7. One commit.

## 4. Report back

- Whether the Dallas template was already in place, and how much this page actually took
  (the honest answer should be close to "one data entry and one route file").
- Any shared-component change you had to make, and proof Dallas is unchanged.
- The reconstructed Plumbing-card opening line, flagged for the owner to confirm.
- Any transcribed sentence you were unsure of.
