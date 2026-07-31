# Claude Code prompt — make the homepage copy editable from Sanity (`homePage` singleton)

## 0. The situation, precisely

The owner is right: the homepage has no schema of its own. `app/(site)/page.tsx` renders
fourteen sections. The **collections** are already CMS-driven — trust logos, services,
industries, testimonials, FAQs — and the **business facts** (phone, email, licence, cities)
come from `siteSettings` via `getSite()`. That is why changing a service image in Studio
already updates the homepage.

But the **copy** of nine sections is hardcoded inside the components:

| Section | Hardcoded today (verify each — line numbers drift) |
|---|---|
| `HeroSection` | headline, subcopy, trust-indicator bullets (`trustIndicators` array), photo slot |
| `AboutSection` | "Commercial Plumbing Expertise Since 1996", paragraphs, `highlights` array, `metrics` array, badge title/subtitle, two photo slots |
| `EmergencySection` | heading, copy, `benefits` array, photo slot |
| `WhyChooseUsSection` | "Dependable Service Without the Guesswork", intro, `features` array (icon + title + description) |
| `ProcessSection` | "A Straightforward Service Process", the `steps` array |
| `ComplianceSection` | "Approved Across Leading Property Management Systems", copy, `complianceItems` array |
| `CaseStudySection` | "Responsive Plumbing Support That Protects Your Property", `storyBlocks`, photo slot |
| `ServiceAreaSection` | heading + intro (note: the heading currently renders "Dallasâ€“Fort Worth" — a mojibake'd en dash; see §4) |
| `FinalCTASection` | "Schedule Commercial Plumbing Service Today", supporting copy, reassurance line |

The task: a **`homePage` Sanity singleton** covering that copy, wired through the standard
fetcher-plus-fallback pattern, with the current hardcoded text becoming the fallback data —
so the site renders identically before the owner ever publishes the document.

Read first: `sanity/schemas/siteSettings.ts` and `sanity/lib/getSite.ts` (the singleton
pattern to copy), `sanity/schemas/serviceSections.ts` + `sanity/schemas/fields.ts` (field
helpers — reuse `imageWithAlt`, don't hand-roll), each section component above in full, and
`CLAUDE.md` + the vendored Next docs. Next 16.2.11, Tailwind v4 via `@theme`, no
`tailwind.config`.

## 1. Schema design — one singleton, grouped by section

`sanity/schemas/homePage.ts`: a singleton document with **one object field per section**,
named to match the component (`hero`, `about`, `emergency`, `whyChooseUs`, `process`,
`compliance`, `caseStudy`, `serviceArea`, `finalCta`). Use Sanity **fieldsets or groups** so
the Studio shows nine collapsible panels — a wall of forty flat fields is unusable for a
non-technical owner.

Per-section fields mirror exactly what is hardcoded — headings, paragraphs, and the arrays
(each array item: icon key + title + description where the component has them). Guidance:

- **Icons**: the arrays use `lucide-react` icons via `navIcons`. Store the icon as a string
  key validated against the `navIcons` keys (same approach the nav schema uses — check it),
  with a sensible Studio description. An unknown key falls back to a default icon at render,
  never crashes.
- **Photos**: every slot that currently renders `ImagePlaceholder` gets an `imageWithAlt`
  field plus the `photoSubject` fallback-string convention used by `serviceSections`. Photo
  URL resolution goes through `resolvePhoto` server-side like everywhere else.
- **Numbers that age**: `AboutSection`'s `metrics` array almost certainly contains a
  years-in-business figure. Anything derivable from `siteSettings.foundedYear` must be
  **derived, not stored** — do not create a second place for the years number to go stale.
  Metrics that are genuinely manual (crews, properties served) become editable fields.
- **What does NOT go in this schema**: trust logos, services, industries, testimonials,
  FAQs, phone/email/licence/cities. Those already have homes. If a section mixes both (e.g.
  `ComplianceSection` renders copy + the logo strip), only the copy moves; the strip keeps
  reading `getTrustLogos()`. Add a field description pointing the editor to the right place
  ("Logos are managed under Trust Logos") so nobody hunts for them here.
- Validation: required on headings the layout cannot survive losing; optional elsewhere.
  Remember the lesson from the section-drop investigation — `rule.required()` accepts
  whitespace; use the trim-aware custom validation if the repo added one, and keep the
  renderer resilient (missing field → fallback copy for that field, never a vanished band).

Register in `sanity/schemas/index.ts` and the Studio structure as a singleton next to Site
Settings, titled "Home Page".

## 2. Data + fetcher + wiring

- `data/homePage.ts` — typed fallback carrying the current hardcoded copy **verbatim** (this
  copy is already client-approved; fix mojibake per §4 but do not rewrite a single claim).
  The interfaces live here, mirrored by the schema, same as `data/site.ts` ↔ `siteSettings`.
- `sanity/lib/getHomePage.ts` — modelled on `getSite()`: cached fetch, cache tag `homePage`
  (the document `_type`, so `/api/revalidate` picks it up — confirm that route needs no
  change), thrown error → fallback via `logFallback`. For a **singleton**, follow whatever
  incomplete-document merging `getSite` does — per-field fallback so a half-filled document
  doesn't blank half the homepage; match the existing behaviour exactly and say in the
  report what that behaviour is.
- GROQ projection in `sanity/queries.ts`.
- `app/(site)/page.tsx` adds `getHomePage()` to the existing `Promise.all` and passes each
  section its props.
- The nine components become prop-driven. **Check each component's other call sites first**
  (`grep` before editing): if a section is also rendered on another page (Partners, Careers,
  city pages…), keep those pages working — either pass the same homepage content or keep
  the current copy as the prop default. No other page may change appearance. List every
  other call site you found in the report.
- `npm run typegen` + `npm run check:drift` clean; regenerated `sanity.types.ts` committed.

## 3. What the owner will and won't see — say it in the report

Until he opens `/studio` → Home Page and publishes, the site serves the fallback text
(pixel-identical to today). The Studio document starts empty; consider `initialValue`s
matching the fallback copy so his first edit starts from the real text instead of blank
fields — do this if the singleton pattern in this repo supports it cleanly, and say whether
you did.

## 4. A real bug to fix while you are in there

`ServiceAreaSection` renders "Proudly Serving the Dallasâ€“Fort Worth Metroplex" — the
"â€“" is a UTF-8 en dash read with the wrong encoding (mojibake) in the hardcoded string.
Fix it to a proper "–" in the fallback data as part of the migration, and grep the repo for
other `â€` occurrences (`grep -rn "â€" components data app`) — fix any you find in copy you
are already migrating, list the rest in the report without touching them.

## 5. Do not

- Do not touch `getGoogleReviews`, the reviews import scripts, or the testimonials system.
- Do not restructure, redesign, or "improve" any section's layout — this is a copy-source
  migration, pixel-identical output.
- Do not add `AggregateRating`/review markup anywhere.
- Do not write to the Sanity dataset; schema + code only.
- Do not duplicate data that lives in `siteSettings` (phone, cities, years) into `homePage`.

## 6. Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm run typegen`,
   `npm run check:drift` — all clean.
2. `npm run dev` → homepage renders **identically to before** (fallback path; screenshot or
   diff text content if in doubt), except the fixed en dash. 375px / 768px / 1024px / 1440px,
   no console errors.
3. Every other page that shares one of the nine components is unchanged — list and check
   each.
4. `/studio` loads; Home Page singleton appears with nine grouped panels; publishing a test
   edit to one heading in a local Studio session updates localhost. (Do not publish anything
   to the production dataset — if the local Studio writes to the shared dataset, skip the
   publish test and say so.)
5. One commit.

## 7. Report back

- The field map: for each of the nine sections, what became editable and what stayed derived
  or collection-driven.
- Other call sites of the nine components and how each was kept unchanged.
- Whether `initialValue`s were set; what `getSite`-style incomplete-document behaviour you
  matched.
- Every `â€` mojibake found, fixed or flagged.
- One line for the owner: where to click in Studio to edit each homepage band.
