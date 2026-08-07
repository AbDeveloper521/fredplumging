# Claude Code prompt — site-wide business identity audit: name, email, domain, phone

## The correct values

These are confirmed by the business owner. Everything on the site must match them:

| Item | Correct value |
| --- | --- |
| Email | `contact@fredsplumbing.com` |
| Website | `https://fredsplumbing.com` |
| Phone | `972-564-9081` / `tel:+19725649081` |
| Service area | Dallas–Fort Worth Metroplex |

Anything else currently in the codebase — `service@fredsplumbingdfw.com`,
`fredsplumbingdfw.com`, `fredsplumbingservices.com`, or any other variant — is **wrong** and
must be corrected.

## The job

Sweep the **entire repository** for business identity values that are wrong, inconsistent,
or hardcoded where they should be config-driven. Fix them all, and leave the site with a
single source of truth so this can't drift again.

This is a find-and-fix audit, not a redesign. No layout changes, no copy rewrites beyond the
identity values themselves.

---

## Part 1 — Audit and report before you change anything

Grep the whole repo (including `data/`, `app/`, `components/`, `sanity/`, `scripts/`,
`public/`, `*.json`, `*.md`, `*.ts`, `*.tsx`, and any JSON-LD or metadata) for every one of
these, and produce a table of **file : line : current value : proposed value** before you
start editing:

**Email variants** — `service@`, `info@`, `contact@`, `@fredsplumbing`, `@fredsplumbingdfw`,
`@fredsplumbingservices`, and any `mailto:` anywhere.

**Domain variants** — `fredsplumbing.com`, `fredsplumbingdfw.com`,
`fredsplumbingservices.com`, `fredplumging.vercel.app`, `fredsplumbing.vercel.app`, plus any
bare `https://` constant used as a site URL.

**Business name variants** — search case-insensitively for all of these and report the count
of each:
- `Fred's Plumbing`
- `Fred's Plumbing Service` (singular)
- `Fred's Plumbing Services` (plural)
- `Freds Plumbing` (no apostrophe)
- `Fred Plumbing`
- `fredplumging` (the misspelling that exists in the repo/Vercel URLs)

Also check **which apostrophe character** is used — a typographic `'` (U+2019) versus a
straight `'` (U+0027). Mixed apostrophes in the same brand name across a site is a subtle
but real quality problem. Pick one (typographic `'` is correct for rendered copy) and
normalise, **except** inside code identifiers, URLs, and JSON-LD `name` fields where a
straight apostrophe may be safer — say what you decided.

**Phone variants** — `972-564-9081`, `(972) 564 9081`, `(972) 564-9081`, `9725649081`,
`+19725649081`, and every `tel:` href.

**Founding year** — there is a known live inconsistency: a hero chip renders
"Serving DFW Since 1993" while the About page and heritage copy say the business was founded
in **1996**, and `data/site.ts` carries `foundedYear: 1996` with a stale
`yearsInBusiness: "27+"` (which would now be 30). Find every place a year or a
years-in-business figure is rendered and report them all.

**Do not guess which founding year is correct.** Report the conflict, correct everything to
`1996` (the value in config and in the client's own About copy — 1993 appears to be the
outlier), and flag it clearly so the owner can confirm with the client. If he says 1993, it
becomes a one-value change afterwards.

---

## Part 2 — Fix, with a single source of truth

1. **`data/site.ts` becomes canonical.** Update it to the correct values in the table above.
   `yearsInBusiness` should be **derived** from `foundedYear` at render time, not stored as
   a stale string — a hardcoded "27+" is guaranteed to be wrong every January. Compute it.
2. **Every hardcoded duplicate gets replaced with a reference to that config.** If a
   component has the email or phone typed inline, it imports it instead. Report how many
   inline duplicates you removed — that number is the real measure of whether this sticks.
3. **Site URL becomes environment-driven.** Introduce (or correct) a single site-URL constant
   sourced from an env var such as `NEXT_PUBLIC_SITE_URL`, falling back to
   `https://fredsplumbing.com`. Use it for `metadataBase`, canonicals, Open Graph URLs,
   `sitemap.xml` and `robots.txt`. Add it to `.env.example` with the **real public domain**
   as the example value (this is a public URL, not a secret — but still never put real
   tokens in that file).

   > **Important caveat to state in your report:** canonical tags and sitemap entries
   > pointing at `https://fredsplumbing.com` are only correct once DNS actually resolves
   > there. If the site is still served from the Vercel preview domain, publishing canonicals
   > that point at a domain that doesn't resolve will hurt indexing. Make it env-driven so
   > the owner can flip it at cutover, and tell him explicitly which value to set in Vercel
   > and when.

4. **Business name — pick one and normalise.** The legal pages and much of the client's copy
   use "Fred's Plumbing Service"; the logo, nav and footer use "Fred's Plumbing". Both are
   defensible. Recommend: **"Fred's Plumbing"** as the everyday brand name used in nav,
   footer, headings and metadata, and leave "Fred's Plumbing Service" **untouched wherever
   it appears inside the client's own legal copy**, since that's the client's formal wording
   in a legal document. Report the split you applied and how many instances moved.

   The misspelling `fredplumging` (in the GitHub repo name and Vercel URL) is **not**
   something you can fix from the codebase — flag it in your report as an owner action, since
   renaming a repo and a Vercel project has deployment consequences.

5. **Sanity Site Settings.** If email/phone/URL live in a Sanity settings document as well as
   `data/site.ts`, they must agree. Check the dataset **read-only** and report any drift —
   remember Sanity wins over code at runtime, so a stale Sanity value silently overrides a
   corrected file. If the Sanity document holds a wrong value, do **not** patch the dataset
   in this task; report the exact field and value so the owner fixes it in Studio, or supply
   it as a dry-run/`--confirm` script following the usual seeder safety spec.

6. **JSON-LD / structured data.** Correct the organisation `url`, `email` and `name` fields
   wherever LocalBusiness / Organization markup exists. Do **not** add any new structured
   data, and under no circumstances add `AggregateRating` or `Review` markup.

---

## Part 3 — Remove the accessibility link from the footer

The footer carries an accessibility link/widget the owner wants gone.

- Find it first and **say exactly what it is** before removing: a plain "Accessibility" text
  link, a link to an accessibility statement page, or a third-party accessibility-overlay
  widget (a floating circular button injected by a script).
- Remove the link from the footer. If it's an injected overlay widget, remove the script tag
  and any related config too, and confirm no other page loads it.
- If it points at a **route that exists in the app**, report the route — the owner should
  decide whether that page is also deleted or just unlinked. **Do not delete a page** in this
  task; unlink only.
- Check the footer for other dead or placeholder links while you're in there and list them,
  but only fix the ones this task and the legal-pages task cover.

> Worth stating plainly in your report: removing an accessibility **overlay widget** does not
> make the site less accessible — those overlays are widely regarded as ineffective and are
> themselves a common source of complaints. What matters is that the site's own semantics
> stay sound. So while you're here, confirm you have **not** broken anything real: skip link,
> focus rings, heading order, alt text, and colour contrast should all be exactly as they
> were. Say so explicitly.

---

## Scope guards

- **Do not touch** `getGoogleReviews` or its 86400 cache — billed Google Places API.
- **Do not alter any review or testimonial text.** Those are real customers' verbatim words.
  If a review quote happens to contain a business name variant, **leave it exactly as
  written** — you do not edit a customer's quote. Report any you found.
- **Do not** modify `.env.local` or print any secret value. Secrets may only ever be reported
  as present/missing.
- No verification scaffolding left in `app/` — a previous task shipped a broken harness route
  and failed the Vercel build.

---

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean;
   regenerated types committed.
2. **Re-run every grep from Part 1 and paste the results.** The wrong values must return
   zero hits outside of (a) customer review text and (b) anything you deliberately left and
   explained. This is the proof the sweep was complete — do it and show it.
3. Every `mailto:` and `tel:` link on the site opens the correct address/number — check the
   header bar, footer, contact page, city pages and the legal pages.
4. 375 / 768 / 1024 / 1440; footer looks right with the accessibility link gone (no orphaned
   separator `|`, no odd gap where it used to sit).
5. No console warnings; no broken links.
6. One commit; nothing uncommitted left behind.

## Report

The full before/after audit table; the count of inline duplicates you replaced with config
references; the name-normalisation split you applied; what the accessibility link actually
was and what you removed; the founding-year conflict flagged for client confirmation; any
Sanity Site Settings drift the owner must fix in Studio; the DNS/canonical caveat and exactly
what to set in Vercel and when; and the re-run grep output proving zero remaining hits.
