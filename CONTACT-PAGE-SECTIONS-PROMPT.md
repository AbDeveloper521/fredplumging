# Claude Code prompt — make the Contact page fully section-editable

## Goal

`/contact` is still hand-built. Convert it to a `sections[]` stack on the **shared section
library**, exactly like About, Partners, Careers, the city pages and the three index pages — so
the owner can edit, reorder, duplicate, hide and remove bands, and add new ones from the library.

Mirror the most recent conversion (`multifamilyIndexPage` / `commercialPage`) — that one needed
no new mapper or renderer because the shared library already covered it.

## ⚠️ Before anything else: is the lead form actually working?

`lib/validations.ts` has historically contained a **mock** `submitLead` that resolves after a
timeout and throws the submission away, while the UI shows "Request received". A previous prompt
(`CONTACT-PAGE-PROMPT.md`) specified replacing it with a real `lib/leadDelivery.ts`, but that
prompt may never have been run.

**Check this first and report it at the top of your report.** If leads are still being discarded,
that is more important than anything else in this task — say so plainly and do not bury it. Do
not attempt to fix it inside this refactor; report it and let the owner decide, because a lead
pipeline change deserves its own task and its own testing.

Either way: **whatever the form currently does, it must do identically after this refactor.** Do
not touch the server action, the validation schema, the spam/honeypot handling, the success and
error states, or the analytics events. This is a layout-editability change, not a form change.

## The form is a section — with a guard

The owner asked for full control, so the form band **is** a section type in the stack
(`contactForm`), which means it can be reordered, hidden or removed like any other. That is what
he asked for and it's the right answer.

But a Contact page with no form is a business failure, not a layout choice. So:

- Add a **document-level validation warning** (a warning, not an error — it must not block
  publish) on the contact page document: if `sections[]` contains no `contactForm` section, or
  the only one is `hidden`, show something like *"This page has no contact form — visitors can't
  submit a request."* Write the message so a non-developer immediately understands the
  consequence.
- The mapper logs it too, consistent with how malformed sections are logged.
- Do not prevent removal. Warn, don't block.

### What's editable on the form, and what isn't

**Editable in Sanity:** the band heading and intro, every field label and placeholder, the
submit button text, the consent/privacy line, the success message, and the generic error
message.

**Not editable, and deliberately so:** the field set itself, field names, validation rules,
required-ness, and the submission logic. Making those editable turns this into a form builder —
it would let the owner silently break lead capture, and it would break the server-side schema
that has to match. If he needs a new field later, that's a small dev task, not a Studio edit.
**State this reasoning in your report** so the boundary is understood rather than experienced as
a limitation.

## Contact details come from Site Settings

Phone, email, service area and any hours must resolve from Site Settings / `data/site.ts` — not
be retyped into section fields. The site has already had a three-way email/domain inconsistency;
do not create a fourth place for those values to live. If the current page hardcodes any of them,
fix that as part of this task and report it.

## What to build

1. **Audit `/contact` first** — report every band it renders today and where each piece comes
   from. Note what is hardcoded copy versus config-driven.
2. `sanity/schemas/contactPage.ts` (or extend it if a singleton already exists) — `sections[]` on
   the shared `sectionsField()` union, `hiddenField()` per section.
3. Add **`contactForm`** to the shared section library, the shared `SectionRenderer` and the
   union — so it's available on any page. A "request service" band on a service or city page is
   an obvious future want; build it once, in the library.
4. `data/contactPage.ts` — the current page's bands as the fallback stack, copy preserved
   **verbatim**. This is a restructure, not a rewrite: no new marketing copy.
5. Mapper/renderer per the existing pattern — malformed dropped and logged, `hidden` skipped,
   `_key`-derived DOM ids, duplicates legal. **Reuse the shared renderer.** Only add a section
   type if the audit finds a band nothing in the library covers, and say so rather than inventing
   one.
6. `sanity/lib/getContactPage.ts`, cache tag `contactPage`, GROQ on the shared
   `SECTIONS_PROJECTION`. Confirm `/api/revalidate` needs no change and say so.
7. Studio: keep/adjust the existing "Contact Page" entry near the other page singletons. Say what
   you did.
8. `scripts/seed-contact-sections.ts` — same safety spec as every other seeder: dry-run by
   default, `--confirm` to write, patches published **and** draft, refuses on a non-empty
   `sections[]`, never deletes a document or asset, prints the stale-Studio-tab warning.
9. `npm run typegen` + `check:drift`; regenerated `sanity.types.ts` committed. `check:drift` has
   ~89 pre-existing differences — report the before and after counts rather than claiming clean.

## Constraints

- **No verification scaffolding left in `app/`** — a previous task shipped a broken harness route
  and failed the Vercel build.
- **Do not create symlinks or directory junctions that point into the real working tree.** A
  previous task did, `git worktree remove` followed it, and it deleted packages out of
  `node_modules` and killed the dev server. If you need an isolated render, use a full separate
  checkout or don't do it.
- Structured data: leave whatever the template already emits. The bans are specifically
  `AggregateRating`, `Review` / `@type: "Review"`, and `FAQPage` — do not add those. Legitimate
  `LocalBusiness` / `BreadcrumbList` markup already on the page stays.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen` — clean; types committed.
2. `/contact` renders on the fallback path, visually identical to today, before any seeding.
3. **Submit the form end to end and confirm the behaviour is unchanged** — success state, error
   state, validation messages, and whatever happens to the submission. Say exactly what you
   observed, including if the lead goes nowhere.
4. Remove the form section in a local Studio draft and confirm the warning appears and publish is
   still permitted. Discard the draft after.
5. 375 / 768 / 1024 / 1440; no console warnings.
6. Dry run prints a sane plan; nothing written without `--confirm`.
7. Every other page unchanged.
8. One commit; nothing uncommitted left behind.

## Report

**Lead delivery status first** — real or still a mock. Then: the audit of what `/contact`
rendered and from where; confirmation that no mapper/renderer was needed beyond adding
`contactForm` to the library; which contact details were hardcoded and are now config-driven; the
exact wording of the missing-form warning; the editable-versus-fixed boundary on the form and why;
`check:drift` before/after counts; the dry-run plan, the confirm command, and the stale-tab
reminder.
