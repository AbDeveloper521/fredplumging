# Claude Code prompt — Careers page: match the owner's reference exactly, fully editable via a section stack

## Goal

`/about/careers` gets the same treatment as About and Partners: a `careersPage` singleton
with an editable `sections[]` stack. **And** its content changes to match the owner's
WordPress reference exactly — three bands, the text below verbatim, with a Studio-editable
background photo on the hero. Follow the About/Partners conversion playbook (schema →
mapper → renderer → fallback → seeder with dry-run/confirm, stale-Studio-tab warning in the
script output and report).

## The page — three bands, nothing else

### 1. Hero — dark, centred, background photo editable from Studio

Eyebrow "FRED'S PLUMBING", H1 **"Careers at Fred's Plumbing"**, then three paragraphs at a
readable centred measure. Background: an `imageWithAlt` field (hotspot-aware crop, wide
banner crop like the service hero) with the **dark-overlay toggle** the service hero already
has (default on; no photo → the standard navy wash). This copy is the owner's own hiring
voice — reproduce it verbatim, typography fixes only:

> Fred's is always looking to opportunistically grow our team. We treat our employees the
> way we want to be treated. They are paid well, supported, and respected. We keep them busy
> with work and provide the tools and training for them to be successful.

> Hiring priorities & ideal candidate traits: We value character and intangibles over
> certifications and tenure. We can teach the right guys how to be great multifamily
> plumbers. Intangibles generally can't be taught. We want to hire employees that will be
> plumbers and team members with us for life.

> Some core traits: Problem solvers that thrive under pressure, quiet confidence with no
> ego, strong situational awareness, ownership mindset, and respect for the trade. They take
> pride in doing the job right, have the curiosity to solve complex plumbing problems, and
> have integrity when no one is watching. We want team players that are also coachable, we
> love reliability and consistency, and we value emotional maturity and good judgment.
> Respect and communication are essential at Fred's.

*(Small-print caveat: transcribed from a screenshot — flag any word you doubt.)*

### 2. Values band — dark, three icon features

Heading **"A Company That Values Your Growth and Commitment"**. Three items (icon + title +
description), the existing `CareerValuesSection`/icon-feature pattern:

- **Supportive Career Development** — > We provide ongoing training, skill building
  opportunities, and a work environment that helps you grow professionally and advance
  confidently.
- **Strong Team Culture** — > Our team works together with respect, reliability, and clear
  communication, creating a workplace where everyone feels valued and supported.
- **Meaningful Impact** — > Every service call helps protect homes, businesses, and
  communities. Your work makes a real difference and contributes to our reputation for
  quality and trust.

### 3. Job openings — collection-driven

Heading **"Work With a Company That Invests in Your Success"**. The job cards keep coming
from the existing `jobPosting` documents (title, Full Time badge, description, Apply Now) —
the stack item holds the heading + `hidden` only, with a Studio description pointing at the
Job Postings collection. Do not duplicate job content into the page document. The job
descriptions visible in the reference should already match the `jobPosting` docs/fallbacks
from the careers build — verify and report any divergence rather than editing job text
unasked. All existing JobPosting structured-data gating (no address → no JSON-LD) stays.

That is the whole page — if the current page renders extra bands (traits, hiring process,
CTA band), they leave the default stack but their **section types stay registered** so the
owner can re-add them in Studio with one click. The generic library types (Icon Card, etc.)
are in this stack's union too.

## Conversion mechanics (the established playbook — brief)

- `careersPage` singleton schema + `sections[]`; register in index + Studio structure.
- `data/careersPage.ts` default stack with the copy above verbatim; page renders this
  before any Studio edit.
- Mapper + renderer per the existing pattern (malformed dropped + logged, hidden skipped,
  `_key` ids); fetcher with cache tag `careersPage` (confirm `/api/revalidate`/Live fine).
- `scripts/seed-careers-sections.ts` — same safety spec as the About/Partners seeders
  (handles all dataset states, drafts included, refuses on non-empty sections, no deletes,
  dry-run default). Owner runs `--confirm`.
- `/about/careers/[slug]` job detail pages unchanged.
- `npm run typegen` + `npm run check:drift` clean; types committed.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. `/about/careers` renders the three bands with the exact copy above (diff, don't eyeball),
   at 375/768/1024/1440; hero shows navy wash (no photo yet) with legible text; job cards
   render from the collection; Apply links work.
3. Seeder dry run sane; local Studio draft test (discard): reorder/hide/add-Icon-Card all
   work; hero photo upload + overlay toggle work.
4. Job detail pages and every other page unchanged.
5. One commit.

## Report

Any transcription doubts; what left the default stack but remains re-addable; any
divergence between the reference's job text and the jobPosting docs; the confirm command;
the reminder to close Studio tabs before confirming; and where the owner uploads the hero
background photo in Studio.
