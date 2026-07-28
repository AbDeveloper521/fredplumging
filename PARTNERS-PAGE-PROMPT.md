# Partners page — build `/about/partners`

Run this in Claude Code from the project root. It replaces the
`PagePlaceholder` at `app/(site)/about/partners/page.tsx` with a real page, in
the same Copper & Slate language as the service and multi-family pages, and
wires the content into Sanity so the client can maintain it.

**Before you start:** `scripts/seed-reviews.ts` exists but has not been run yet
— the dataset is still holding the pre-launch placeholder testimonials. This
page renders a reviews section, so run
`sanity exec scripts/seed-reviews.ts -- --confirm` first, or the reviews band
here will show the old invented quotes.

---

## Context

`/about/partners` is the vendor-compliance page. Its job is to convince a
property manager that onboarding Fred's Plumbing as an approved vendor will not
cost them a week of paperwork chasing. The client's current WordPress version
is a stack of five alternating logo/paragraph rows for VendorCafe, Compliance
Depot, Vendor Nexus, NetVendor and RealPage, followed by a Google-reviews
carousel.

The content is right. The presentation is not — the rows are five identical
white boxes with no hierarchy, the logos sit at inconsistent scales, and there
is nothing that tells the reader *what this means for them*.

The closest precedent in this repo is `app/(site)/about/testimonials/page.tsx`,
which you built last. Match it: dark hero with the grid + radial-gradient
composition, the wave SVG divider into white, content bands, then
`FinalCTASection`. Read that file before writing anything.

Also read `CLAUDE.md`, and the relevant guide under
`node_modules/next/dist/docs/01-app/` before writing Next.js code — this is
Next 16.2.11 and the App Router APIs differ from what you may have memorised.

---

## 1. Content model — extend `trustLogo`, do not create a new document type

`sanity/schemas/trustLogo.ts` already models exactly the entity this page is
about: a vendor system with a name, an optional logo image and a display order.
VendorCafe already exists there and appears in the homepage trust bar and the
compliance strip. Creating a second `vendorPlatform` type would force the client
to maintain VendorCafe in two places and let the two copies drift.

Extend `trustLogo` with these optional fields. Keep `name: "trustLogo"` — the
document type id cannot change without a dataset migration — but retitle it to
**"Partners & Vendor Systems"** in both the schema `title` and `structure.ts`.

| field | type | notes |
| --- | --- | --- |
| `headline` | string | The card heading, e.g. "Verified Vendor On VendorCafe". Optional; falls back to `Approved vendor on ${name}`. |
| `blurb` | text, rows 3 | The paragraph. **This field is the switch** — see below. |
| `category` | string, list | `vendor-portal` \| `compliance-network` \| `association` \| `credential`. `initialValue: "vendor-portal"`. Used for grouping and for the pill label. |
| `url` | url | Optional outbound link to the client's public vendor profile. `scheme: ["https"]`, `allowRelative: false`. |
| `verified` | boolean | `initialValue: true`. Drives the "Verified vendor" pill. |

**The derived rule:** an entry that has a `blurb` gets a full card on
`/about/partners`. An entry without one appears only in the homepage trust bar
and the compliance logo strip, as today. This mirrors the pattern already in
this schema — "if no logo image is added, the name itself is shown as a styled
wordmark" — so no extra visibility toggle is needed. Say this plainly in the
`blurb` field description so the client understands that writing a paragraph is
what promotes a logo onto the Partners page. That keeps Greystar, Yardi, AAGD
and TDLR as strip-only entries without anyone having to configure anything.

Update the preview `subtitle` to show the category and whether the entry has a
blurb, so the list in the Studio is legible at a glance.

Then thread the new fields through:

- `data/navigation.ts` — extend the `TrustLogo` interface with the five new
  optional fields. Every existing consumer (`TrustBar`, `ComplianceSection`)
  must keep compiling untouched; these are additive and optional.
- `STATIC_TRUST_LOGOS` — add the five platforms from section 2 below with their
  full copy, and leave the existing strip-only entries as they are. Order them
  10, 20, 30… with the five platforms first.
- `sanity/queries.ts` — extend `TRUST_LOGOS_QUERY` to project the new fields.
- `sanity/lib/getTrustLogos.ts` — map them. Validate `category` against the
  allowed union and drop an unknown value rather than passing it to the UI.
- `npm run typegen` to regenerate `sanity.types.ts`.

---

## 2. The copy

This is the client's own marketing text, transcribed from their live site. Use
it as the `blurb` content in `STATIC_TRUST_LOGOS`.

**Important distinction from the reviews work:** customer review quotes are
untouchable. This is *the client's own* copy, so you may fix typography and
plain grammatical errors — "multi family" → "multi-family", the en dash in
"Dallas–Fort Worth", curly apostrophes, the doubled preposition in the RealPage
paragraph. Do **not** change or upgrade any claim. If the source says
"approved vendor", it stays "approved vendor" — you must not promote it to
"certified" or "licensed by". These are third-party compliance statuses and
overstating one is a real problem for the client.

**1 · VendorCafe** — category `vendor-portal`
Headline: Verified Vendor On VendorCafe
> We are an approved vendor on VendorCafe, allowing property managers to review documentation and process invoices quickly. Our active status ensures smooth coordination and full compliance for multi-family and commercial properties throughout the Dallas–Fort Worth Metroplex.

**2 · Compliance Depot** — category `compliance-network`
Headline: Approved Provider On Compliance Depot
> Fred's Plumbing maintains full compliance through Compliance Depot to streamline vendor verification for property managers. Our documentation, insurance, and certifications are kept current to ensure fast approval and dependable service for every community.

**3 · Vendor Nexus** — category `vendor-portal`
Headline: Trusted Partner On Vendor Nexus
> We are a verified vendor on Vendor Nexus, giving property managers confidence that our team meets required standards for safety, performance, and documentation. This partnership helps simplify communication and speeds up scheduling.

**4 · NetVendor** — category `compliance-network`
Headline: Certified Vendor On NetVendor
> Our partnership with NetVendor ensures our insurance, background checks, and compliance records remain fully up to date. Property managers who rely on NetVendor can trust that our team is qualified, approved, and ready to respond quickly.

**5 · RealPage** — category `vendor-portal`
Headline: Verified Partner On RealPage
> Fred's Plumbing is a trusted vendor within the RealPage network, offering streamlined coordination for service requests and RealPage documentation. This partnership supports efficient operations for apartment communities and commercial properties across the region.

Leave `url` undefined on all five — we do not have the client's public profile
links, and inventing one is worse than omitting it.

---

## 3. Logos — do not go and find them

`public/logos/` contains only `freds-plumbing-logo.png`. Do **not** download the
VendorCafe, Compliance Depot, Vendor Nexus, NetVendor or RealPage logos from the
web, and do not reproduce them as inline SVG or data URLs. They are third-party
trademarks we have no licence to redistribute, and the client's permission to
display them on their own site does not transfer into this repo.

`trustLogo` already degrades gracefully to a styled wordmark when no image is
uploaded, and the cards must look deliberate in that state — not like a broken
image. Design the logo tile so the wordmark version is the default that ships,
and the uploaded image is the upgrade.

Add a short block to `public/logos/README.txt` naming the five files the client
should drop into the Studio (`vendorcafe.png`, `compliance-depot.png`,
`vendor-nexus.png`, `netvendor.png`, `realpage.png`), with a note that
transparent PNG at roughly 400px wide works best.

---

## 4. New component — `components/sections/PartnerPlatformsSection.tsx`

The core of the page. Server component, no client boundary.

Props: `{ partners: TrustLogo[]; id?: string }`. Return `null` when `partners`
is empty — same guard as `TestimonialsSection`.

Layout: one row per partner, alternating so the logo tile sits left on even
indices and right on odd, collapsing to a single column below `lg` with the
logo tile always first. Use a real `<ul>` / `<li>` so the count is announced;
each partner heading is an `<h3>` under the section's `<h2>`.

Card treatment, using the existing tokens — do not invent new colours:

- `rounded-2xl border border-grey-100 bg-white p-8 shadow-(--shadow-card)` on
  `bg-offwhite` section background, `lg:p-10`
- a red left accent that appears on hover/focus-within
  (`border-l-4 border-l-transparent hover:border-l-red-600 transition-colors`)
  so the stack has motion without five permanent red bars
- the logo tile: a `rounded-xl border border-grey-100 bg-offwhite` square,
  centred content, `size-32` at `lg`. Image path uses `next/image` with
  `width={200} height={48} className="h-10 w-auto"`. Wordmark fallback uses
  `font-heading text-xl font-extrabold tracking-tight text-navy-900`.
- the verified pill: only when `verified` is true —
  `rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600`, with a
  `BadgeCheck` icon from lucide, label derived from `category`
  ("Vendor portal", "Compliance network", "Trade association", "Credential").
- headline `text-[22px] font-extrabold tracking-tight text-navy-900 sm:text-[26px]`,
  blurb `mt-4 text-[16px] leading-relaxed text-grey-700`
- when `url` exists, a text link with `ArrowUpRight`, `target="_blank"`,
  `rel="noopener noreferrer"`, and a visually hidden "(opens in a new tab)".

Wrap each row in `<Reveal delay={Math.min(i, 5) * 0.06}>`.

Section heading via `SectionHeading` with `eyebrow="Vendor Compliance"` and
`title="Approved Across the Systems Property Managers Already Use"`, plus a
short lead paragraph. Pass `titleId` so `aria-labelledby` resolves.

---

## 5. New component — `components/sections/VendorOnboardingSection.tsx`

The piece the client's page is missing: what being an approved vendor actually
buys the reader. A four-up grid on a dark band, using the same
`bg-navy-950` + `bg-grid-dark` + radial-gradient composition as
`ComplianceSection`, so the page alternates dark → light → dark rather than
running five white boxes in a row.

Four points, icons from lucide (`FileCheck2`, `ShieldCheck`, `Clock4`,
`ClipboardList`):

1. **Onboarding without the paperwork chase** — our insurance certificates,
   licensing and W-9 are already filed in the portals you use, so approval is a
   lookup rather than a request.
2. **Coverage that stays current** — general liability, workers' compensation
   and our Texas Master Plumber licence are renewed and re-uploaded before they
   lapse, not after a system flags them.
3. **Dispatch that starts the same day** — an approved vendor record means an
   emergency call becomes a truck rolling, not a compliance ticket.
4. **Documentation that closes the work order** — invoices, photos and service
   notes land in your system in the format it expects.

Write these as real sentences; do not compress them into three-word bullets.
Keep the claims aligned with what `ComplianceSection`'s `dashboardRows` already
asserts (general liability, TX Master Plumber licence, workers' compensation,
W-9 and vendor onboarding docs, background-check programme) — those two blocks
must not contradict each other.

---

## 6. Rebuild `app/(site)/about/partners/page.tsx`

Delete the `PagePlaceholder`. Model the file on
`app/(site)/about/testimonials/page.tsx`.

Data:

```ts
const [site, trustLogos, testimonials, profile] = await Promise.all([
  getSite(),
  getTrustLogos(),
  getTestimonials(),
  getReviewSettings(),
]);
const partners = trustLogos.filter((logo) => Boolean(logo.blurb));
```

Section stack, in order:

1. **Hero** — dark, `pt-[120px] pb-16 lg:pt-[190px] lg:pb-24`, eyebrow
   "About Us", `<h1>` **"Fully Compliant and Approved Across Leading Vendor
   Systems"** (the client's own H1 — it is the term property managers search
   for, keep it), the intro paragraph rewritten from their existing one, and a
   row of three inline credentials (the state licence number,
   `${site.yearsInBusiness} years in DFW`, "24/7 dispatch"). Close with the same
   wave `<svg>` divider used on the testimonials page.

   The licence number is **not** in the site content yet. Add
   `licenseNumber: string` to the `Site` interface in `data/site.ts` with the
   value `"RMP 44890"` — taken from the client's own live footer, so it is their
   claim, not ours — mirror it as a field on the `siteSettings` schema and the
   `SITE_QUERY`, and read it through `getSite()`. Do not hardcode it in the page
   component; the footer will want it too.
2. `<VendorOnboardingSection />`
3. `<PartnerPlatformsSection partners={partners} id="partner-platforms" />`
4. **Compliance credentials band** — reuse `<ComplianceSection logos={trustLogos} />`
   *only if* it reads as additive here rather than as a repeat of the homepage.
   Look at both pages side by side and decide; if it repeats, build a lighter
   variant that keeps the dashboard panel and drops the checklist, and say in a
   comment why you split it.
5. `<TestimonialsSection ... />` with
   `heading="What Property Managers Say About Working With Us"`,
   `titleId="partner-reviews-heading"`,
   `filterTags={["commercial-plumbing", "apartments"]}`, `limit={4}`,
   `showAllLink` left at its default. Pass `site` and `profile`.
6. **FAQ** — three vendor-onboarding questions (below), rendered with
   `<ServiceFaqSection section={...} id="partner-faq" />`. Build the section
   object to match the `ServiceFaqSection` interface in `data/serviceSections.ts`
   (`_type`, `_key`, `heading`, `faqs[]` with `_key`/`question`/`answer`,
   optional `background`). Set `background: "offwhite"`.
7. `<FinalCTASection site={site} />`

SEO: update the exported `metadata` (title, description, `alternates.canonical`),
render `<BreadcrumbJsonLd items={[Home, About Us, Partners]} />`, and
`<FaqJsonLd faqs={...} />` built from the **same** strings rendered in step 6.

**Do not add `AggregateRating`, `Review` or `@type: "Review"` anywhere.** Google
does not permit self-serving review markup on a business's own entity; it is
ineligible for rich results and risks a structured-data manual action. The 5.0
and the 133 stay in visible copy only, via `GoogleRatingBadge`.

---

## 7. FAQs

Add these to the end of the `faqs` array in `data/faqs.ts`. That file's `Faq`
interface is just `{ question, answer }` — there is no `order` field, so array
position is the order. They are also useful on the homepage FAQ, so put them in
the shared file rather than inlining them on the page.

- **Which vendor compliance systems is Fred's Plumbing registered with?** —
  answer names the five platforms and points at this page.
- **How long does vendor approval take if we use a portal you're already in?** —
  answer: our documentation is already on file, so approval is usually a
  same-day lookup rather than a new onboarding cycle.
- **Can you provide certificates of insurance naming our property as additional
  insured?** — answer: yes, issued through the portal or direct from our
  carrier; give the contact route without promising a turnaround time we cannot
  verify.

Keep the answers to two or three sentences and do not state a specific coverage
dollar amount — we have not verified one.

---

## 8. Seeding and drift

- Extend the `trustLogo` block in `scripts/seed-content.ts` so a fresh seed
  writes the new fields. Keep its existing deterministic `_id` convention.
- `scripts/check-fallback-drift.ts` — extend the trust-logo query projection to
  include the new fields so drift between Sanity and
  `STATIC_TRUST_LOGOS` is still detected. Run `npm run check:drift` after
  seeding and confirm trust logos print `✓`.
- Check `app/api/revalidate/route.ts`. The existing `trustLogo` cache tag
  (`TRUST_LOGO_TAG` in `sanity/lib/getTrustLogos.ts`) should already cover this
  page, since the partner cards come from that same fetcher — confirm that
  rather than assuming it, and add the tag if the route does not already handle
  the type. If you add `licenseNumber` to `siteSettings`, the `siteSettings`
  tag covers it.

While you are in `data/site.ts`: `foundedYear` is 1996 but `yearsInBusiness` is
`"27+"`, which was right a few years ago and is now understating the business by
three years. Flag it in your report — do not change it without asking, because
"27+" may be deliberate copy the client signed off on.

---

## 9. Constraints

- Tailwind v4, CSS-first. There is **no** `tailwind.config` file; tokens live in
  the `@theme` block in `app/globals.css`. Use existing tokens only.
- Every animation must respect `prefers-reduced-motion` — use `<Reveal>` and
  `.animate-rise`, which already handle it.
- Server components by default. Neither new section needs a client boundary;
  do not add `"use client"`.
- No new dependencies.
- Do not touch `data/testimonials.ts`, `TestimonialCard.tsx` or anything else
  in the reviews layer. Those quotes are real customers' words and are frozen.

---

## 10. Verify

Run `npm run lint` and `npm run build` — both clean, no new warnings.

Then start the dev server and check, by looking, not by reasoning about the
code:

1. `/about/partners` renders all five platforms, alternating, with wordmarks
   rather than broken images, and the page reads dark → light → dark rather
   than five identical white boxes.
2. The homepage trust bar and compliance strip are visually unchanged — the
   schema extension must not have altered them.
3. Resize to 375px: the alternating rows collapse cleanly, the logo tile stays
   first, nothing overflows horizontally.
4. Tab through the page — focus is visible on every link, the verified pills are
   not focusable, and the outbound-link affordance (if any `url` is set) is
   announced.
5. View source: exactly one `FAQPage` block, no `AggregateRating`, no `Review`.
6. Temporarily blank `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local`, restart,
   and confirm the page still renders all five partners from
   `STATIC_TRUST_LOGOS` rather than crashing or showing an empty band. Restore
   the env var afterwards.

Report what you changed, and anything you skipped and why.
