# Claude Code prompt — build the Dallas city page (`/areas-we-serve/dallas`)

## 0. Orientation

`app/(site)/areas-we-serve/dallas/page.tsx` is currently a `PagePlaceholder`. Replace it with a
real page modelled on the owner's WordPress Dallas page (copy transcribed in §2).

**Build it as a reusable city template, not a one-off.** `app/(site)/areas-we-serve/fort-worth/page.tsx`
is also a placeholder and will be requested next, with the same shape and different copy. So the
deliverable is: a `CityPage` template component (or a small set of sections) driven entirely by
data, a `data/cities.ts` fallback with the Dallas entry, and a Sanity `cityPage` document type
keyed by slug — then the Dallas route renders the template with the Dallas data. **Do not build
the Fort Worth page** — leave its placeholder untouched, but confirm in your report that adding
Fort Worth later is data-plus-one-route, no new components.

Read before writing: `app/(site)/about/partners/page.tsx` (page-shell conventions: dark hero,
grid + radial washes, eyebrow rule, `Container`, SVG wave), the section components in
`components/sections/` (reuse before writing new — see §3), and `CLAUDE.md` plus the vendored
Next docs at `node_modules/next/dist/docs/01-app/`. Next 16.2.11; Tailwind v4 via `@theme` in
`app/globals.css` — **no `tailwind.config` file exists, do not create one.**

Check `data/navigation.ts` for how the Areas We Serve menu links to this route — the href is
already there; nothing in navigation changes.

## 1. Non-negotiable rules

- **Copy**: typography and grammar may be corrected; claims may not be upgraded or invented.
- **Images**: do not download or hotlink anything from the WordPress site or stock libraries.
  Every photo slot uses `ImagePlaceholder` with a descriptive label; the owner uploads real
  photos via Sanity later.
- **Association/licence badges** (the AAGD, Fort Worth Apartment Association, TDLR row at the
  bottom of the reference): these are third-party trademarks — never download or embed them.
  Render that row through the existing `TrustLogoStrip` fed by `getTrustLogos()` — the owner
  already uploads logos there. If the strip's current logos are vendor platforms rather than
  associations, just render the strip as-is and note in your report that he can add the
  association logos in Studio.
- **Reviews**: the "What Our Clients Say" band must use the existing `TestimonialsSection` and
  the real Google reviews already integrated. Never invent, shorten or paraphrase a review
  quote. No `AggregateRating` / `Review` structured data anywhere.
- Do not touch `sanity/lib/getGoogleReviews.ts` or its cache.

## 2. The copy, transcribed from the owner's reference

The screenshot is low-resolution; I transcribed carefully but the small paragraphs may have
small errors. Use this copy, fix typography only (en dashes, hyphens in "multi-family",
"long-lasting"), and list in your report any sentence you had to guess so the owner can check.

**Hero** — eyebrow "Fred's Plumbing", H1 **"Plumbing Services in Dallas, Texas"**:

> Fred's Plumbing provides dependable multi-family and commercial plumbing solutions throughout
> Dallas. Our team is known for fast response, professional service, and long-lasting results
> that support the needs of property managers and facility owners across the city.

**Services band** — heading **"Reliable Plumbing Services in Dallas"**, five cards:

- *Plumbing* — Full-service plumbing solutions for multi-family and commercial properties
  across Dallas–Fort Worth. We handle repairs, installations, replacements, and system upgrades
  with a focus on reliability, safety, and long-term performance.
- *Drain & Sewer* — Professional drain cleaning, sewer inspections, and repairs using advanced
  hydro jetting and camera technology. Our team resolves blockages, backups, and damaged lines
  quickly to prevent disruptions and costly damage.
- *Specialty Services* — Expert support for complex plumbing systems including boilers,
  backflow, and gas. Our technicians are trained to handle high-demand systems while
  maintaining compliance and efficiency.
- *Maintenance* — Preventive maintenance programs designed to protect your plumbing systems,
  reduce emergency calls, and extend equipment life. Our preferred customer plans provide
  routine inspections, priority service, and consistent system care.
- *Emergency Repairs* — Available 24/7 for burst pipes, leaks, and urgent repairs, we deliver
  immediate response when your tenants or facilities need it most.

Each card links to the matching existing service page ("Get Started →"). Resolve the five
hrefs against the real service slugs in the repo/Sanity — do not guess URLs; check what exists
and report any card that has no matching service page.

**Why choose us** — heading **"Why Choose Us in Dallas"**:

> Property managers across Dallas rely on Fred's Plumbing for consistent quality, fast
> response, and long-lasting results. Our team brings decades of experience to every project
> and uses advanced equipment to ensure accurate diagnostics and dependable repairs. We
> understand the demands placed on plumbing systems in high-occupancy environments, and we are
> committed to providing service that keeps your residents safe and your property operating
> smoothly.

**Reviews** — heading "What Our Clients Say" (the existing testimonials component).

**Heritage band** — heading **"Serving Dallas with Integrity and Expertise Since 1996"**:

> Fred's Plumbing has supported multi-family and commercial properties in Dallas for nearly
> three decades. Our team is committed to delivering safe, efficient, and reliable plumbing
> solutions that meet the needs of property managers, real estate investors, and facility
> owners.

> We combine experience, advanced tools, and a focus on long-term performance to ensure every
> project is handled with care. From emergency repairs to large-scale system upgrades, we are
> here to support your property with dependable service you can trust.

With the 24/7 Plumbing Emergency Service badge treatment (the red badge composition already
exists in `AboutSection` / `ServiceAboutSection` — reuse it).

**Communities band** — heading **"Proudly Serving Dallas and Surrounding Communities"**:

> We support properties throughout Dallas and nearby areas including Highland Park, University
> Park, Richardson, Garland, Mesquite, Irving, and other surrounding neighborhoods. Wherever
> your property is located in the Dallas region, our team is ready to assist.

The named communities are the client's own list — keep them exactly; do not add cities. A
"Contact Us" button to `/contact` closes the band.

**Badge strip + final CTA** — the `TrustLogoStrip` row (per §1), then the standard closing CTA
band used elsewhere.

That is the whole page — roughly six bands plus the strip. Do not add an FAQ, a map embed, or a
neighborhood link farm. There is no street address; DFW/Dallas is a service area (see §5).

## 3. Reuse before you build

Audit `components/sections/` first and reuse whatever fits: `ServicesSection` or the service
card pattern for the five cards; `TestimonialsSection` for reviews; the badge collage from
`AboutSection`/`ServiceAboutSection` for the heritage band; `TrustLogoStrip` for badges;
`FinalCTASection` or `ServiceFinalCtaSection` to close. Only write a new component where
nothing generalises cleanly, and say in your report which you reused vs. wrote. Generalising an
existing section is fine **only if** every existing page that uses it renders pixel-identically
afterwards — verify, don't assume.

## 4. Sanity schema (build it, do not connect it)

Standing rule: schemas written now, populated later. Follow the fetcher-plus-fallback pattern
exactly.

- `sanity/schemas/cityPage.ts` — a **document type with a slug** (not a singleton): city name,
  hero heading + intro, the five service cards (title, description, link), why-choose heading +
  body, heritage heading + paragraphs + photo slots (use `imageWithAlt` from
  `sanity/schemas/fields.ts`), communities heading + body + community names array, and a toggle
  for showing the logo strip. Register in `sanity/schemas/index.ts` and the Studio structure.
- `data/cities.ts` — typed fallback array with the Dallas entry carrying the §2 copy verbatim.
- `sanity/lib/getCityPage.ts` — fetch by slug with the existing cached-fetch helper and the
  cache tag `cityPage` (document `_type`, matching how `/api/revalidate` resolves tags —
  confirm that route needs no change). Thrown error → static fallback; successful-but-empty →
  no fallback. Log via `logFallback` / `logEmpty`.
- GROQ projection in `sanity/queries.ts`.
- `npm run typegen` + `npm run check:drift` clean; commit the regenerated `sanity.types.ts`.

The Dallas route itself stays a static route file (`areas-we-serve/dallas/page.tsx`) that calls
`getCityPage("dallas")` — do not convert the section to a `[slug]` catch-all in this task, and
do not touch the Fort Worth placeholder.

## 5. SEO

- `metadata`: title like "Plumbing Services in Dallas, TX | Fred's Plumbing", a description
  naming multi-family and commercial plumbing in Dallas, `alternates.canonical:
  "/areas-we-serve/dallas"`.
- `BreadcrumbJsonLd`: Home → Areas We Serve → Dallas.
- No `PostalAddress` (there is no street address — do not invent one), no map embed. If you add
  any service-area markup, it is `areaServed` on the existing Organization/Service shape only.
- **No `AggregateRating`, `review`, or `@type: "Review"` anywhere** — even though the page
  shows real Google reviews. Self-serving review markup risks a manual action. Site-wide rule.
- Check `app/sitemap.ts`: `/areas-we-serve/dallas` may already be listed — confirm, don't
  duplicate.
- The copy is unique to Dallas, which is what keeps this from being a doorway page. When Fort
  Worth is built later it must not be this text with the city name swapped — note that in the
  schema field description for the intro ("write city-specific copy — do not copy another
  city's text") so future editors see it.

## 6. Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run typegen`, `npm run check:drift`
   — all clean.
2. `npm run dev` → `/areas-we-serve/dallas` at 375px, 768px, 1024px, 1440px. No console errors
   or warnings; nothing overlaps; the mobile call bar covers nothing.
3. All five service-card links resolve to real pages (click each).
4. Reviews band renders the real Google reviews; quotes match `data/` exactly.
5. `/areas-we-serve`, `/areas-we-serve/fort-worth` and every other page unchanged.
6. `/studio` loads; City Page appears with a Dallas-ready schema; no drift.
7. Heading hierarchy: one `h1`, sequential `h2`s. Keyboard-tab the page; visible focus
   throughout.
8. One commit.

## 7. Report back

- Which existing sections you reused vs. what you wrote new, and confirmation every reusing
  page is pixel-identical.
- The five service-card link targets you resolved, and any card with no matching page.
- Any transcribed sentence you were unsure of, so the owner can check it against WordPress.
- Confirmation Fort Worth later = one data entry + one route file.
- Whether the trust-logo strip currently holds association logos or only vendor platforms.
