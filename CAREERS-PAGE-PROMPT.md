# Careers page — build `/about/careers`

Run this in Claude Code from the project root. It replaces the
`PagePlaceholder` at `app/(site)/about/careers/page.tsx` with a real six-section
page plus per-role detail pages, in the same Copper & Slate language as the
service, multi-family and partners pages.

Read `CLAUDE.md` first, and the relevant guide under
`node_modules/next/dist/docs/01-app/` before writing Next.js code — this is Next
16.2.11. The closest precedents in this repo are
`app/(site)/about/testimonials/page.tsx` (a bespoke About page) and
`app/(site)/services/[slug]/page.tsx` (a CMS-driven detail route with
`generateStaticParams`). This page needs both patterns.

---

## Context and the two things the client's version gets wrong

The client's WordPress careers page has the right raw material — a genuinely
good statement of hiring philosophy and three real open roles — presented in a
way that buries it:

- **The hero is three dense paragraphs.** The third one, the list of core
  traits, is the most persuasive writing on the whole site and it is sitting in
  a 6-line grey block that nobody will read to the end. It needs to be its own
  section.
- **The three value cards use the same red ribbon icon three times.** Identical
  icons on differentiated content reads as a template that nobody finished.

Everything else — the copy, the three roles, the tone — is theirs and is good.
Keep the substance, fix the structure.

---

## 0. Two hard constraints before you write anything

**There is no form backend.** `components/forms/QuoteRequestForm.tsx` submits
through `submitLead`, which is a stub — read it and see the comment: *"Swap
submitLead for a real API call when the backend is ready."* `app/api/` contains
only `revalidate/route.ts`.

So: **do not build a job application form.** A résumé upload that silently
discards the file is far worse than no form at all — a quote lead that vanishes
costs a job, an application that vanishes costs someone a career move and the
client a hire they never knew applied for. Every "Apply Now" must be a
`mailto:` link built from the CMS `applyEmail` (falling back to `site.email`)
with a prefilled subject, or an external `applyUrl` if the client supplies one.
Say so in a comment at the top of the roles component so nobody "improves" it
into a form later.

Add a line to `GO-LIVE.md` under the existing blockers: application routing is
mailto-only until a form backend exists.

**Gendered language in the source copy.** The client's hiring paragraph says
*"We can teach the right guys how to be great multifamily plumbers."* Change
`guys` to `people` when you transcribe it. In a US job advertisement, gendered
wording narrows the applicant pool and is the kind of thing an EEO complaint
points at. This is the one substantive edit you should make to the client's
copy — note it in your report so it can be raised with them, and change nothing
else about their claims.

---

## 1. Content model — new `jobPosting` document type

Unlike the partners page, this genuinely needs a new type; nothing existing
models a role. Create `sanity/schemas/jobPosting.ts` following the conventions
in `sanity/schemas/service.ts` (`defineType`/`defineField`, the shared helpers
in `fields.ts`, `orderings`, a `preview`).

| field | type | notes |
| --- | --- | --- |
| `title` | string, required | "Journeyman Plumber" |
| `slug` | slug, required | `source: "title"`, maxLength 96 |
| `employmentType` | string, list, required | Store schema.org values — `FULL_TIME`, `PART_TIME`, `CONTRACTOR`, `TEMPORARY` — with human titles in the list. `initialValue: "FULL_TIME"`. Storing the enum means the JSON-LD needs no translation table. |
| `team` | string | "Field Operations" |
| `shift` | string | "Evening shift · 4 PM – 12 AM" |
| `openings` | number, int, min 1 | The client's copy says "two" and "five" — model it as a number and render the word. |
| `summary` | text, rows 4, required | The card blurb and the meta description. |
| `responsibilities` | array of string | Rendered as a list on the detail page. |
| `requirements` | array of string | Same. |
| `compensationNote` | string | Free text only, e.g. "Competitive hourly rate plus overtime". **Never a fabricated dollar figure.** |
| `applyEmail` | string, email validation | Falls back to `site.email` when empty. |
| `applyUrl` | url, https only | Wins over `applyEmail` when set. |
| `datePosted` | date | Required for Google Jobs eligibility — see section 7. |
| `validThrough` | date | Same. |
| `open` | boolean | `initialValue: true`. A closed role stays in the CMS for its URL but drops off the listing. |
| `order` | number, int, min 0, required | Display order, in 10s. |

Register it in `sanity/schemas/index.ts` and pin a **"Careers"** list in
`sanity/structure.ts`, after "Property Types" and before "Trust Logos", ordered
by `order asc`.

Then the usual chain, matching how `service` is wired:

- `data/jobs.ts` — a `JobPosting` interface and a `jobPostings` fallback array
  holding the three real roles from section 3, with the same header-comment
  discipline as `data/testimonials.ts` (what the file is, that it is the
  fallback not the source of truth, and the rules for editing it).
- `sanity/queries.ts` — `JOB_POSTINGS_QUERY` projecting every field, filtered
  to `open == true`, ordered by `order asc`, plus a `JOB_POSTING_QUERY` by slug
  that does **not** filter on `open` (a closed role's URL must still resolve
  rather than 404 on someone who has the link).
- `sanity/lib/getJobs.ts` — `getJobPostings()` and `getJobPosting(slug)`, with
  `next: { revalidate: 3600, tags: [JOB_TAG] }`. One hour, not the 86400 used
  elsewhere: a filled role needs to come down quickly.
  On fetch failure use the `logFallback` helper and return the static array. On
  a successful **empty** result use `logEmpty` and return an empty array — the
  same reasoning as `getTestimonials`: if the client closes their last role, the
  listing must show "no openings right now", not resurrect a filled job from a
  static file and take applications for it.
- `app/api/revalidate/route.ts` — add the `jobPosting` tag.
- `scripts/seed-content.ts` — seed the three roles, deterministic `_id`s in the
  existing convention.
- `scripts/check-fallback-drift.ts` — add a `jobs (data/jobs.ts)` entry so drift
  is caught.
- `npm run typegen`.

---

## 2. Page structure — six sections plus the closing CTA

In order. Each is self-contained with its own background and vertical padding,
so the page alternates dark → light rather than running as one grey slab.

**1 · Hero** (dark)
`bg-navy-950` with `bg-grid-dark` and the radial-gradient composition from
`app/(site)/about/testimonials/page.tsx`, `pt-[120px] pb-16 lg:pt-[190px]
lg:pb-24`. Eyebrow "About Us", `<h1>` **"Careers at Fred's Plumbing"**, then
**only the first paragraph** of the client's copy as the lead:

> Fred's is always looking to opportunistically grow our team. We treat our
> employees the way we want to be treated. They are paid well, supported, and
> respected. We keep them busy with work and provide the tools and training for
> them to be successful.

Under it, an anchor button to `#open-roles` labelled with the live count —
`View ${count} open roles` — and a secondary link to the phone number. Close
with the same wave `<svg>` divider used on the testimonials page.

Paragraphs two and three move into sections 2 and 3. Do not repeat them here.

**2 · Why work here** (light, `bg-white`)
Heading "A Company That Values Your Growth and Commitment". Three cards,
client's copy verbatim:

- **Supportive career development** — We provide ongoing training, skill
  building opportunities, and a work environment that helps you grow
  professionally and advance confidently.
- **Strong team culture** — Our team works together with respect, reliability,
  and clear communication, creating a workplace where everyone feels valued and
  supported.
- **Meaningful impact** — Every service call helps protect homes, businesses,
  and communities. Your work makes a real difference and contributes to our
  reputation for quality and trust.

Three **distinct** lucide icons — `GraduationCap`, `Users`, `ShieldCheck` — in
the red tile treatment already used elsewhere. Not the same icon three times.
Title case, not the all-caps of the original.

**3 · What we look for** (dark band)
This is the section the client's page is missing, and it is the best writing
they have. Heading "What We Look For", with paragraph two as the framing lead:

> We value character and intangibles over certifications and tenure. We can
> teach the right people how to be great multifamily plumbers. Intangibles
> generally can't be taught. We want to hire employees that will be plumbers and
> team members with us for life.

Then break paragraph three into a grid of named traits — roughly eight, two or
three words each with a one-line gloss drawn from the client's own sentence:
problem solver under pressure; quiet confidence, no ego; situational awareness;
ownership mindset; respect for the trade; curiosity; integrity when no one is
watching; coachable and consistent. Close with the client's own line: *"Respect
and communication are essential at Fred's."*

Every trait must trace back to a phrase in the source paragraph. Do not add
traits the client did not name.

**4 · Open roles** (light, `id="open-roles"`)
Heading "Work With a Company That Invests in Your Success". Three-up card grid
collapsing to one column, `bg-offwhite` section on white cards —
`rounded-2xl border border-grey-100 bg-white p-7 shadow-(--shadow-card)`, with a
red top accent bar.

Each card: title as `<h3>`, a meta row of pills (employment type, team, shift
when set), `openings` rendered as "2 positions" when greater than one, the
`summary`, and two actions — a primary "Apply Now" (mailto or `applyUrl`) and a
secondary text link to the detail page, "See the full role".

Render an empty state when `jobs.length === 0`: a single centred card saying
there are no openings right now, with an invitation to send a résumé anyway to
`site.email`. The client's roles will fill; the page must not look broken when
they do.

**5 · How hiring works** (light)
A four-step process using the same visual treatment as `ServiceProcessSection`
(look at it and reuse the pattern rather than importing it — its props are
shaped for a CMS section object, not a static page).

⚠️ **This copy is invented and must be confirmed with the client before
launch.** Write it as: apply by email with a short note about your experience →
a phone conversation about the work and the shift → a ride-along or shop visit
with the crew you would join → offer and licence/documentation paperwork. Put a
`{/* PLACEHOLDER — confirm the real hiring process with the client */}` comment
directly above the array and list it in your report. Do not state a timeline in
days; we do not know it.

**6 · What customers say about our crews** (white)
Reuse `<TestimonialsSection />` with a recruiting frame rather than a sales one.
This is the strongest recruiting asset the client has and their page does not
use it at all: the Google reviews name individual technicians — David, Jeremy,
Scott, Mitch, Nathan, Matthew, William — by name, repeatedly, unprompted.

Props: `heading="Our Customers Know Our Technicians by Name"`,
`titleId="crew-reviews-heading"`, `limit={4}`, no `filterTags`, and pass `site`
and `profile` as the other pages do. Add a one-line lead above it explaining the
framing — that this is what property managers write about the people you would
be working alongside.

**7 · Closing CTA**
`<FinalCTASection site={site} />`, which is what every other page closes with.
Note in a comment that its embedded `QuoteRequestForm` is a sales form, not an
application route — if that reads wrong at the bottom of a careers page once you
see it rendered, build a lighter careers-specific CTA band instead (headline,
mailto button, phone) and say why in your report.

---

## 3. The three open roles

Transcribed from the client's live page. These are the client's own words about
their own jobs — you may fix typography (the em dashes are inconsistent, "4 PM–12
AM" needs a proper en dash and spacing) but do not change what the roles require
or promise.

**Apprentice Plumber** — `FULL_TIME`, team "Field Operations", `openings: 2`

> Fred's Plumbing is seeking two reliable, hard-working Apprentice Plumbers to
> join our growing Field Operations team. In this hands-on role, you'll assist
> in core plumbing tasks, contribute to the installation and repair of plumbing
> systems, and gain invaluable experience in the multifamily-commercial plumbing
> space. We're not just hiring workers — we're developing the next generation of
> plumbing professionals through mentorship, training, and a strong team
> culture. If you're coachable, curious, and committed to doing things the right
> way, this is the place for you.

**Journeyman Plumber** — `FULL_TIME`, team "Field Operations", `openings: 5`

> Fred's Plumbing is looking to hire five experienced Journeyman Plumbers to
> join our trusted Field Operations team. In this full-time, hands-on role,
> you'll lead multifamily plumbing projects, provide expert repairs, and ensure
> all work is completed efficiently, professionally, and to code. This is more
> than just a job — it's a long-term career opportunity with a company that
> truly values its people. If you're confident without ego, a problem-solver
> under pressure, and passionate about plumbing, we want to hear from you.

**Emergency OT Technician** — `FULL_TIME`, team "Service", `openings: 1`,
shift "Evening shift · 4 PM – 12 AM"

> Fred's Plumbing is seeking a dependable and experienced Emergency Overtime
> Plumber to support our high-volume service team during after-hours and urgent
> calls. This full-time position is ideal for a licensed Journeyman who thrives
> under pressure and is available for our evening shift (4 PM – 12 AM). If
> you're ready to be the go-to plumber when emergencies strike — and be well
> compensated for it — this is the role for you.

Leave `responsibilities`, `requirements`, `compensationNote`, `datePosted` and
`validThrough` **empty** in the fallback file. The client has not published
those details and inventing bullet points for a real job advertisement is not
something we can do on their behalf. The detail page must render cleanly with
those fields absent — that is the state that ships.

---

## 4. Detail route — `app/(site)/about/careers/[slug]/page.tsx`

Follow `app/(site)/services/[slug]/page.tsx`: `generateStaticParams()` from
`getJobPostings()`, `generateMetadata()` from the role's title and summary,
`notFound()` when the slug does not resolve.

Layout: dark hero with breadcrumbs (Home → About Us → Careers → role) and the
meta pills, then a single readable column (`max-w-[880px]`) with the summary,
the responsibilities and requirements lists when present, the compensation note
when present, a sticky-ish apply card, and a closing "other open roles" list
linking to the siblings. Reuse `Container`, `Reveal`, `Button`, `SectionHeading`.

When `open` is false, render a clearly-worded notice at the top — this role has
been filled — keep the description visible, replace the apply button with a link
back to `/about/careers`, and add `robots: { index: false }` to that page's
metadata.

---

## 5. Navigation and cross-links

"Careers" already exists in the About Us group in `data/navigation.ts`, so
nothing to add there. Do add a link to `/about/careers` from the footer's Quick
Links if the footer is static, and check whether `/about` (still a placeholder)
should link across — if it does not, leave it; that page is a separate job.

---

## 6. SEO

`metadata` on the listing page: title "Careers | Fred's Plumbing", a description
naming DFW and the trades, `alternates.canonical: "/about/careers"`.

`<BreadcrumbJsonLd items={[Home, About Us, Careers]} />` on the listing, and the
four-level version on each detail page.

---

## 7. `JobPosting` structured data — only when it is complete

Unlike review markup, `JobPosting` JSON-LD for your own roles is explicitly
supported by Google and feeds the Google Jobs experience. It is worth having.
But Google requires `title`, `description`, `datePosted`, `hiringOrganization`
and `jobLocation` with a real `PostalAddress`, and it applies manual actions to
listings whose markup does not match the visible page or whose required fields
are missing.

`data/site.ts` has `serviceArea: "Dallas–Fort Worth Metroplex"` and **no street
address**, and the fallback roles have no `datePosted`.

So: add a `JobPostingJsonLd` component to `components/seo/JsonLd.tsx` that
**returns `null` unless every required field is present** — `datePosted`, a
resolvable `PostalAddress`, and a non-empty description. Emitting nothing is the
correct behaviour today; emitting a half-populated `JobPosting` is worse than
emitting none.

To turn it on, the client needs to supply a street address and set `datePosted`
and `validThrough` per role in the Studio. Add `streetAddress`, `addressLocality`,
`addressRegion` and `postalCode` as optional fields on `siteSettings` and to the
`Site` interface so the plumbing is ready, and list "careers structured data is
off until the client supplies a business street address" in your report and in
`GO-LIVE.md`.

Set `directApply: true` only if `applyUrl` is used; a mailto route should not
claim direct apply.

---

## 8. Constraints

- Tailwind v4, CSS-first. There is **no** `tailwind.config` file; tokens live in
  the `@theme` block in `app/globals.css`. Use existing tokens only.
- Server components by default. The role cards, the traits grid and the process
  steps need no interactivity — no `"use client"` on any of them.
- Every animation goes through `<Reveal>` or `.animate-rise`, both of which
  already respect `prefers-reduced-motion`.
- No new dependencies.
- Do not touch `data/testimonials.ts` or anything else in the reviews layer.
  Those quotes are real customers' words and are frozen — you are only
  re-rendering them under a different heading.
- Do not add `AggregateRating` or `Review` markup anywhere.

---

## 9. Verify

`npm run lint` and `npm run build` — both clean, no new warnings.
`npm run check:drift` — jobs should print `✓`.

Then start the dev server and check by looking:

1. `/about/careers` renders all six sections, alternating dark and light, and
   the three roles appear with their pills and both actions.
2. Every "Apply Now" opens a mail client with the role name in the subject —
   click one and confirm. No form anywhere on the page.
3. Each of the three detail pages resolves, and renders cleanly with
   `responsibilities`, `requirements` and `compensationNote` all absent.
4. Set one role's `open` to false in the Studio (or in the fallback file): it
   disappears from the listing, its URL still resolves, shows the filled notice,
   and carries `noindex`.
5. Delete all three (or point at an empty dataset): the listing shows the empty
   state rather than an empty grid or a crash.
6. View source: no `JobPosting` block yet — that is correct until the address
   and dates exist. No `AggregateRating`, no `Review`.
7. 375px width: the role cards, the traits grid and the process steps all
   collapse cleanly with no horizontal overflow.
8. Tab through: focus visible on every card action, the meta pills not
   focusable, heading order h1 → h2 → h3 with no skips.
9. Temporarily blank `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local`, restart,
   and confirm the listing still renders the three roles from `data/jobs.ts`.
   Restore it afterwards.

Report what you changed, what you flagged, and specifically: the `guys` → `people`
edit, the placeholder hiring-process copy, and the structured-data blocker.
