# Claude Code prompt — build out the Commercial Plumbing page

## Goal

Fill the `/commercial` page with a real, complete section stack: copy, structure, and an FAQ
band. All of it editable in Sanity like every other page.

**Keep it short.** The owner explicitly does not want a long page. Target **7 bands plus a
closing CTA** — the stack is specified below and is the ceiling, not a starting point. If the
existing service-page template is shorter, follow the template rather than padding to match
this list.

## Relationship to the earlier task

`NAV-LINKS-AND-COMMERCIAL-PAGE-PROMPT.md` created the `commercialPage` singleton with a
single placeholder banner. Handle both states:

- **If that task has run** — the schema, fetcher, route, Studio entry and seed script already
  exist. This task replaces the placeholder default with the real stack and adds the FAQ set.
  The existing seeder refuses to run on a non-empty `sections[]`, so if the owner has already
  confirmed it, you'll need the same **append-or-replace** handling described below.
- **If it has not run** — do that task's plumbing first (schema, fetcher, route, Studio entry,
  seed script, `data/commercialPage.ts`), then this content. Say which path you took.

## Mirror the existing service page

The owner's instruction: *"build in a similar way like we already make services page."*

So **audit an existing `/services/[slug]` page first** and report its exact section stack —
which types, in which order. Then build `/commercial` on **the same rhythm using the same
section types from the shared library**. Do not invent a new page shape, do not create new
section types, and do not design a bespoke layout. If a band below has no matching type in the
library, say so and use the closest existing one rather than adding another type.

Report the service-page stack you found and the mapping you used.

## On the competitor reference

The owner supplied a screenshot of a national competitor's commercial page **as a structural
reference only**. All copy below is original and written for Fred's Plumbing.

**Do not fetch, scrape, or visit the competitor's site**, and do not reuse any of their
phrasing, headings, or list wording. Everything you need is in this prompt. If you think a
section needs copy that isn't here, write it in the site's existing voice and flag it in your
report as newly written — do not go looking for source material.

## Claims discipline — non-negotiable

This is a licensed trade. Every claim on this page must be one the business can stand behind:

- **Do not invent** response times, years in business, technician counts, number of properties
  served, certifications, awards, or insurance limits.
- **Do not upgrade** a claim — "approved vendor" never becomes "certified", "licensed" never
  becomes "master-certified".
- The licence number **RMP 44890** is verified against `data/site.ts` and Site Settings. Use it
  exactly.
- Phone and email come from config, not typed inline.
- **No `AggregateRating`, `Review`, or `@type: "Review"` structured data anywhere.** If you add
  a reviews band, it renders existing testimonial content only — no review markup.
- Two service lines below warrant a flag in your report so the owner can confirm with the
  client before this goes live: **backflow testing and certification** (Texas requires a
  licensed BPAT to certify) and **gas line work** (requires the appropriate endorsement). The
  same claims already ship in the Multi-Family FAQ, so they're consistent with the site — but
  say so plainly rather than letting them pass silently a second time.

---

# The section stack

## 1. Banner hero

**H1:** Commercial Plumbing Services in the Dallas–Fort Worth Metroplex

**Intro:** Fred's Plumbing keeps commercial buildings running across DFW — from a single
storefront to a multi-tenant property. We handle repairs, replacements, code compliance work
and 24/7 emergencies, and we schedule around your operating hours wherever we can.

Background photo: leave the existing banner image behaviour; the owner sets it in Studio.

## 2. Intro band with photo

Use the same photo-plus-copy band the service pages use (the collage type — remember the
small overlapping photo is optional and must not render a placeholder when empty).

**Heading:** Plumbing problems shouldn't close your doors

**Body:**

> A failed water heater, a backed-up main, or a leak above a tenant space costs a business far
> more than the repair itself. Fred's Plumbing works with owners, property managers and
> facility teams across the Metroplex to get systems back in service quickly — and to keep
> them from failing in the first place.
>
> Our crews work in occupied buildings every day. We diagnose with camera inspection and leak
> detection rather than guesswork, so the problem gets found on the first visit and the fix is
> the right one.

## 3. Services grid

Use the icon-card / services grid type with balanced rows (5 cards render 3+2, not 4+1).
**Eight cards:**

| Title | Copy |
| --- | --- |
| Drain & Sewer Cleaning | Hydro jetting and cabling for kitchen lines, floor drains and main sewer stoppages. |
| Water Heaters | Repair, replacement and installation for commercial tank and tankless systems. |
| Backflow Prevention | Installation, testing and certification to keep your building compliant. |
| Grease Traps & Interceptors | Pumping, cleaning and scheduled service for restaurants and food service. |
| Leak Detection | Locating slab, supply and concealed leaks without unnecessary demolition. |
| Camera Inspection | Video inspection of sewer and drain lines to confirm the cause before work starts. |
| Gas Line Services | Installation, repair and pressure testing for commercial gas piping. |
| Re-Pipes & Fixtures | Partial and full re-pipes, PRV replacement and commercial fixture installation. |

**Heading:** Commercial plumbing services we provide

## 4. Emergency band

**Heading:** 24/7 emergency response across DFW

**Body:**

> Plumbing emergencies don't wait for business hours. Fred's Plumbing answers around the clock
> for burst lines, sewer backups, water heater failures and anything else that can't wait until
> morning. Call and we'll get a technician moving.

CTA: the phone number from config, plus a link to the contact page. **No response-time figure**
— the business hasn't committed to one yet (this is the same open item flagged in the
Multi-Family FAQ).

## 5. Property types we serve

Use the same cards/grid pattern as the property-type or industries band.

**Heading:** Commercial properties we serve

**Intro:** If you own or manage a commercial building in the Metroplex, we can help.

Items: Retail & shopping centers · Office buildings · Restaurants & food service · Senior care
& assisted living · Mixed-use developments · Warehouses & light industrial

Where a link target exists (senior care and assisted living already have `/multifamily/[slug]`
pages), link the card. Do **not** create new pages for the ones that don't.

## 6. Reviews band

Reuse the existing testimonial section exactly as other pages use it. Real reviews only, shown
verbatim — **never** edit, shorten or paraphrase a customer's words. No review structured data.
No reviewer profile photos hotlinked from googleusercontent.com.

If the existing testimonial band on service pages is already configured a particular way,
match it rather than configuring a new variant.

## 7. FAQ band

Use the `faqBand` section type shipped in commit `906a2a5`, in **shared set** mode, referencing
a **new** `faqSet` document:

- Internal title: **Commercial FAQs**
- Public heading: **Frequently Asked Questions**

Create the set with the five questions below. Do **not** add them to the Multi-Family set, and
do **not** copy the questions inline into the page — the whole point of the referenced set is
one edit updating every page that uses it.

Match whatever accordion styling `faqBand` ends up with — a separate task may be changing it to
the rotating `+` on cards used by `ServiceFaqSection`. Do not fork the component.

### The five questions — use exactly this copy

**What types of commercial properties do you service?**

We serve commercial and institutional properties across DFW, including retail and shopping
centers, office buildings, restaurants and food service, senior care and assisted living
facilities, and mixed-use developments. If you manage or own a commercial building in the
Metroplex, we can help.

**Can you minimize downtime and disruption to our business?**

Yes. We schedule around your operating hours where possible, including after-hours and weekend
work, and we come equipped to diagnose and resolve issues in as few visits as possible. Camera
inspection, leak detection, and hydro jetting let us find the actual problem the first time
rather than guessing, which limits both cost and downtime.

**Do you handle backflow testing, grease traps, and code-compliance work?**

Yes. We handle backflow prevention installation, testing, and certification, grease trap and
interceptor service, gas line work, and the compliance documentation these require. Staying
current on backflow and grease trap requirements keeps you compliant with local authorities and
avoids fines or shut-offs.

**Can you take on both emergency repairs and larger scheduled projects?**

Both. We respond 24/7 to commercial plumbing emergencies — leaks, stoppages, water heater
failures — and we also handle planned work like re-pipes, fixture replacements, PRV and water
heater installations, and tenant build-outs. For larger projects we provide a clear scope and
estimate up front.

**Are you licensed and insured for commercial work?**

Yes. Fred's Plumbing is licensed by the State of Texas (RMP 44890) and fully insured, with
certificates of insurance available on request. All work meets applicable state and municipal
plumbing codes.

## 8. Closing CTA

Whatever CTA band the service pages already end with. Phone and contact link from config.

---

## Seeding

`scripts/seed-commercial-page.ts` (or extend the existing commercial seeder), same safety spec
as every other seeder: dry-run by default, `--confirm` to write, patches published **and**
draft, never deletes a document or asset, prints the stale-Studio-tab warning.

Handle the case where the owner has **already confirmed** the placeholder stack: the script
must not silently clobber it. Either detect the single placeholder band and replace it, or
refuse with a clear message telling him what to do. Say which behaviour you implemented and
why.

Create the `Commercial FAQs` set if absent; **refuse to overwrite** one that already has items.

`data/commercialPage.ts` carries the same stack as the fallback so the page renders fully
before seeding.

## Navigation

**Do not add the nav link yourself** — the owner adds it in Studio: title `Commercial`, href
`/commercial`, no dropdown items. Repeat those exact values in your report.

## SEO

Real `metadata` — title, description, canonical. Indexable. Add to `sitemap.xml`. **No
structured data.**

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean;
   regenerated `sanity.types.ts` committed. **No verification scaffolding left in `app/`** — a
   previous task shipped a broken harness route and failed the Vercel build.
2. `/commercial` renders the full stack on the fallback path before seeding.
3. 375 / 768 / 1024 / 1440. The eight-card services grid balances correctly at every width, and
   the six property-type cards do too.
4. Page length: confirm it's comparable to an existing service page, not materially longer.
   State the band count for both.
5. FAQ: five `<details>` items, keyboard reachable, and the band reads from the **referenced**
   set — confirm the typegen output shows a resolved `faqSet`, not a `_ref`.
6. Every other page unchanged, including the Multi-Family FAQ set.
7. Dry run prints a sane plan; nothing written without `--confirm`.
8. One commit; nothing uncommitted left behind.

## Report

The existing service-page stack you mirrored and how each band maps onto it; any copy you wrote
that wasn't supplied here; the backflow-certification and gas-line claims flagged for client
confirmation; how the seeder handles an already-confirmed placeholder stack; the band count
comparison; the dry-run plan, the confirm command, the stale-tab reminder, and the exact nav
values for the owner to type.
