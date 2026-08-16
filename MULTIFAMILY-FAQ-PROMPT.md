# Claude Code prompt — FAQ band at the bottom of every Multi-Family page

## Goal

Add an FAQ section to the bottom of **`/multifamily` and every `/multifamily/[slug]` page**
(apartments, condos, senior care, and the rest). Six questions to start, fully editable in
Sanity — the owner must be able to change any word, add questions, remove them, and reorder
them.

## ⚠️ Read this before writing any content — two answers are unfinished

Two of the six answers the owner supplied contain **unfilled placeholders in square
brackets**:

- Q2 (emergency response): `[insert your response-time commitment — e.g., "with a technician
  typically on site within X hours for after-hours emergencies"]`
- Q5 (licensed and insured): `[insert coverage — e.g., general liability and workers' comp at
  $X limits]`

**Under no circumstances ship bracket text to a live page.** And do **not** invent a
response-time figure or an insurance limit to fill them — those are commitments a licensed
plumbing contractor is held to, and a number nobody at the business approved is worse than no
number at all. This is the same rule as never upgrading a service claim.

Use the **safe versions written out in the FAQ content section below**, which say what is true
without inventing a figure. Then flag both in your report so the owner can get the real
numbers from the client and drop them in later — which will be a one-field edit in Studio,
not a code change.

## Architecture — edit once, appears on every Multi-Family page

The important decision: these six questions are **the same on all seven-plus pages**. Do
**not** copy the same Q&As into each page's section stack — the moment the client supplies a
real response time, the owner would have to edit it seven times and would miss one.

Build it as a **shared, referenced FAQ set**:

1. **`faqSet` document type** (a small collection, not a singleton) — fields: internal
   `title` (e.g. "Multi-Family FAQs"), an optional public `heading` and `intro`, and `items[]`
   where each item is `{ question, answer }`. Both required; answer is plain text or a
   lightly-restricted Portable Text (paragraphs, bold, links — no headings, no images). Give
   the array item a `preview` showing the question so the collapsed list is readable in
   Studio.
2. **`faq` section type added to the shared section library** (`sanity/lib/sectionLibrary.ts`
   + the shared `SectionRenderer` + `sectionsField()` union), so it becomes available on
   **every** page stack, not just multifamily. The owner will want this on service pages and
   the homepage later.
3. The `faq` section supports **two modes**, and you should make the choice obvious in the
   Studio UI:
   - **Reference a shared FAQ set** (the default, and what multifamily uses) — optionally with
     a per-page `headingOverride` so one page can title the band differently without forking
     the questions.
   - **Inline items** for a page that needs its own one-off questions.
   Validate that exactly one mode is populated, with a readable error message if neither is.
4. `hiddenField()` support as usual, `_key`-derived DOM id, duplicates legal, malformed →
   dropped and logged. Same rules as every other section.
5. Fetcher/GROQ: the section projection must **resolve the reference** (`->`) so the questions
   arrive with the page in one query — do not add a second round trip. Cache tag `faqSet` so
   editing the set revalidates. **Confirm the pages that reference it also revalidate** — a
   referenced document changing does not automatically re-tag the parent page, so check how
   `/api/revalidate` and SanityLive handle this and say what you found. If editing the FAQ set
   would leave a cached multifamily page stale, fix it and explain how.

## Appending to pages that are already seeded

`/multifamily` and the property-type pages already have populated `sections[]` arrays, and
every existing seeder **refuses to run on a non-empty stack** — correctly, so it can't clobber
the owner's work. So this needs a different script:

`scripts/append-multifamily-faq.ts`

- **Append-only.** Adds one `faq` section to the **end** of each target page's `sections[]`.
  Never reorders, never edits, never removes an existing section.
- **Idempotent.** If a page already has an `faq` section, skip it and log that it was skipped.
  Running twice must not produce two FAQ bands.
- Targets: the `multifamilyIndexPage` singleton **and every** `/multifamily/[slug]` document.
  Enumerate them from the dataset rather than hardcoding a list, so a property type added
  later isn't silently missed — and report which documents it found.
- Creates the `faqSet` document if absent; **refuses to overwrite** an existing one that
  already has items.
- Dry-run by default, `--confirm` to write, patches published **and** draft, never deletes a
  document or asset, prints the stale-Studio-tab warning.

Also update `data/` fallbacks so the band renders on the fallback path before seeding — the
index page fallback and the property-type page fallback both get the FAQ band appended.

## Design

- Native `<details>` / `<summary>` accordion. It's keyboard accessible and screen-reader
  correct for free, works without JavaScript, and browser find-in-page can still reach
  collapsed content. Do not hand-roll an accordion with divs and `onClick`.
- Style the summary properly: full-width clickable row, visible focus ring, a chevron that
  rotates on open (respect `prefers-reduced-motion`), a clear divider between items, no
  default browser triangle marker.
- Answers constrained to a readable measure (~70ch), not full container width.
- Heading above the band ("Frequently Asked Questions" or whatever the owner sets), optional
  intro line, and consistent band spacing with the sections above it.
- Decide whether the first item starts open. Recommend **all closed** so the page bottom stays
  scannable — say what you chose.
- 375 / 768 / 1024 / 1440. Long answers must not overflow on mobile.

## Structured data — skip it

Do **not** add `FAQPage` JSON-LD. Google sharply restricted FAQ rich results and they are no
longer shown for ordinary commercial sites, so it would add markup weight for no benefit.
And as always: **never** add `AggregateRating`, `Review`, or `@type: "Review"` anywhere.

Mention in your report that it was a deliberate omission so nobody adds it later thinking it
was overlooked.

---

# FAQ content — use exactly this

**Set title (internal):** Multi-Family FAQs
**Public heading:** Frequently Asked Questions

### 1. Do you work directly with property management companies and approved vendor systems?

Yes. Fred's Plumbing is an active, compliant vendor across the major property management
platforms, with current insurance, background checks, and safety documentation on file. We
work directly with property managers, regional maintenance supervisors, and ownership groups,
and we can be added to your approved vendor list quickly. A certificate of insurance is
available on request.

### 2. How quickly can you respond to an emergency at one of our communities?

> **Placeholder removed.** The owner's draft had a bracketed response-time commitment here.
> Ship this version, which is true as written, and flag it for the real figure.

We provide 24/7 emergency response across the DFW Metroplex. Because we focus on multi-family
and commercial properties, our crews are used to unit floods, main-line stoppages, and
after-hours calls that can't wait until morning.

### 3. Can you handle work across multiple units and buildings, not just a single repair?

Yes. We're built for multi-unit work — from a single unit turn to a full-property re-pipe,
trap primer replacement, or riser repair across an entire building. We coordinate scheduling
with your on-site staff to keep resident disruption and unit access issues to a minimum, and
we can phase larger projects to fit your operations and budget.

### 4. How do you handle billing and invoicing for property managers?

We invoice through the systems property managers already use, with clear, itemized
documentation for every job so you can approve, track, and expense work without chasing
paperwork. We're set up for both one-off dispatch and ongoing volume across a portfolio of
communities.

### 5. Are your plumbers licensed and insured for multi-family work in Texas?

> **Placeholder removed.** The owner's draft had bracketed coverage types and dollar limits
> here. This version confirms coverage exists without stating limits nobody approved. Flag it
> for the real figures.

Yes. Fred's Plumbing is licensed by the State of Texas (RMP 44890) and carries general
liability and workers' compensation coverage; a certificate of insurance is available on
request. All work is performed to state and local plumbing code, which matters for
habitability, inspections, and protecting the owner from liability.

### 6. Do you offer preventative maintenance, or only repairs?

Both. Beyond emergency and repair work, we offer preventative maintenance — drain and sewer
jetting, water heater service, backflow testing, and system inspections — that reduces
emergency call volume and extends the life of your property's plumbing. For portfolios, a
scheduled maintenance program is usually cheaper over a year than paying per-emergency.

---

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean;
   regenerated `sanity.types.ts` committed. **No verification scaffolding left in `app/`** — a
   previous task shipped a broken harness route and failed the Vercel build.
2. **Grep the built output for `[insert`, `[Insert` and `$X`.** Zero hits. Do this and paste
   the result — it is the one check that matters most here.
3. The FAQ band renders at the bottom of `/multifamily` and every `/multifamily/[slug]` page,
   on the fallback path, before any seeding.
4. Dry run lists every document it would touch and writes nothing; run it **twice** after
   `--confirm` in a scratch context to prove idempotency (no duplicate band).
5. In a local Studio draft (discard after): edit one answer in the FAQ set and confirm the
   change appears on **more than one** multifamily page — that's the proof the shared
   reference works. Also add an item, reorder, and hide the whole band on one page.
6. Keyboard: every summary reachable and toggleable with Enter/Space, visible focus ring.
7. Every non-multifamily page unchanged.
8. One commit; nothing uncommitted left behind.

## Report

Confirmation that no bracket placeholder survives anywhere (with the grep output); both
flagged items written out so the owner can chase the client for the real response time and
insurance figures; which documents the append script found and would touch; how you handled
revalidation of pages that *reference* the FAQ set; the mode-validation message text; whether
the first item starts open; that `FAQPage` markup was deliberately omitted; the dry-run plan,
the confirm command, and the stale-tab reminder.
