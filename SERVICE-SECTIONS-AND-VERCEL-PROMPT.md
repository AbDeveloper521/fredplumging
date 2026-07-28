# Claude Code prompt — fix the vanishing service section, then make Vercel update instantly

Two problems, in this order. **Part A is a content-correctness bug and comes first** — there
is no point making production update faster if what it publishes is a page with a missing
section.

---

## 0. Orientation — read this before touching anything

### What is already known (do not re-derive it)

Read these three files in the project root first. They are the accumulated findings from
earlier passes and they are accurate:

- `PRODUCTION-INSTANT-UPDATES.md` — the production analysis and the three-step plan.
- `SANITY-IMAGE-AUDIT.md` — the image/alt findings and the cache-tag audit.
- `WEBHOOK-SETUP.md` — how the publish webhook is meant to be created.

**Important correction to your own assumptions:** commit `747107e` ("i hope production
problem has been solved") changed **only two markdown files** — it added
`PRODUCTION-INSTANT-UPDATES-PROMPT.md` and `PRODUCTION-INSTANT-UPDATES.md`. Verify this
yourself with `git show --stat 747107e`. Steps 2 and 3 of the plan in
`PRODUCTION-INSTANT-UPDATES.md` §3 were **written down but never implemented**:
`sanity/lib/cacheOptions.ts` still returns `revalidate: 86400`, `next.config.ts` still has
no `cacheComponents`, and there is no `defineLive` / `<SanityLive>` anywhere in the repo.
So production is still on a 24-hour timer with no webhook. That is Part B's job.

### The deployment, now known precisely

| Fact | Value |
|---|---|
| Host | Vercel |
| Production URL | `https://fredplumging.vercel.app` |
| Studio | `https://fredplumging.vercel.app/studio` — same deployment, `/studio` route |
| The page in question | `https://fredplumging.vercel.app/studio/structure/services;service-plumbing` |

Note the spelling: the Vercel project is **`fredplumging`** (missing the `b`). Every URL you
write into docs, webhooks or CORS settings must use that exact host — a webhook pointed at
`fredplumbing.vercel.app` will silently 404 forever.

### Read before writing any cache code

1. `.claude/skills/sanity-live-cache-components/SKILL.md` (a copy also exists at
   `.agents/skills/sanity-live-cache-components/`) plus all four reference files:
   `reference/live-helpers.md`, `reference/three-layer-pattern.md`,
   `reference/dynamic-segments.md`, `reference/layouts.md`. This skill targets
   `next-sanity` v13 + Next 16 Cache Components, which is exactly this stack. **Where the
   skill and this prompt disagree, the skill wins.**
2. The vendored Next.js docs at `node_modules/next/dist/docs/01-app/`. Next 16 changed the
   caching APIs and recalled-from-training spellings are unreliable. `cacheOptions.ts` and
   `app/api/health/sanity/route.ts` already cite the exact doc path they were written from —
   keep that convention for anything new.

### Hard constraints (breaking any of these is worse than the bug)

- Never log, return or commit a secret value. `SANITY_API_READ_TOKEN`,
  `SANITY_API_WRITE_TOKEN` and `SANITY_REVALIDATE_SECRET` may only ever be reported as a
  boolean "present / missing".
- **Keep the static-fallback semantics in every `sanity/lib/get*.ts`**: a *thrown* fetch
  falls back to `data/*.ts` and logs via `logFallback`; a *successful but empty* result stays
  empty so deleted content cannot resurrect. This survives every change below or the change
  does not ship.
- Keep alt-text enforcement and `logImageSkipped`.
- **Leave `sanity/lib/getGoogleReviews.ts` completely alone** — billed Google Places API.
- Keep `/api/revalidate` and its mandatory signature verification.
- Keep `/api/health/sanity` working and secret-gated (404, not 401, in production).
- Public visitors keep seeing **published** content with **stega disabled**.
- Never run a blanket delete against the Sanity dataset. `scripts/seed-reviews.ts` has a
  known blanket-delete footgun — do not run it, do not imitate it.
- Every numbered step below is **its own commit**, in order, so any one can be reverted alone.

---

# PART A — the top banner disappears when a photo is added

## A1. The symptom, and the cause — which is now confirmed

The site owner reported:

> "when I applied an image on the service page for top banner, the section removed instantly"

He was editing at `/studio/structure/services;service-plumbing`. Then his dev console produced
the decisive evidence:

```
[browser] Image with src "https://cdn.sanity.io/images/hmuhko9b/production/
d551a1da…-1024x1536.png?w=1600&fit=max&auto=format" has "fill" and a height value of 0.
This is likely because the parent element of the image has not been styled to have a set height.
```

**That warning is the bug, and it is a CSS bug, not a data bug.** Here is the mechanism, and
it is worth reading carefully because it explains why the image is what triggers it.

`components/sections/ServiceHeroSection.tsx` line 180:

```tsx
<Rise delay={0.2} className="hidden lg:block lg:justify-self-end">
  <div className="relative aspect-[3/4] w-full max-w-[440px] rotate-1 …">
    {section.photo ? <Image src={…} fill … /> : <ImagePlaceholder … />}
```

The `Rise` wrapper is a **grid item** in `lg:grid-cols-[1.05fr_0.95fr]`, and
`lg:justify-self-end` overrides the default `stretch` — so the item is sized **shrink-to-fit**
rather than filling its track. Its width is therefore indefinite, which means the inner div's
`w-full` has nothing to resolve against and falls back to its own content's intrinsic size.

- With `<ImagePlaceholder>`, the box has real in-flow content (icon, caption text), so the
  intrinsic width is non-zero and the box renders normally.
- With `<Image fill>`, the image is **absolutely positioned** and contributes **nothing** to
  intrinsic size. Width computes to `0` → `aspect-[3/4]` turns that into height `0` → the
  entire right-hand column of the banner collapses to nothing.

So uploading a photo removes the only thing that was giving the box a size. "I applied an
image and the section disappeared" is a literally accurate description of what the CSS does.

**Confirm this against the two places that got the same pattern right**, which is the
strongest evidence that this one is simply a mistake rather than a deliberate difference:

| File | Class on the grid item | Correct? |
|---|---|---|
| `components/sections/HeroSection.tsx:137` | `lg:w-full lg:max-w-[520px] lg:justify-self-end` | ✅ width is on the grid item |
| `components/sections/FinalCTASection.tsx:73` | `lg:justify-self-end lg:w-full lg:max-w-[500px]` | ✅ width is on the grid item |
| `components/sections/ServiceHeroSection.tsx:180` | `hidden lg:block lg:justify-self-end` | ❌ **no width at all** — width sits on the child instead |

### Step A0 — fix it (do this first; it is small, certain, and its own commit)

Move the width constraint onto the grid item so it is definite, matching the two working
sections. Keep the `hidden lg:block` responsive behaviour and keep `aspect-[3/4]`,
`rotate-1`, the rounded border and the shadow exactly as they are — this is a sizing fix, not
a redesign. Verify the fix on a wide viewport with a photo set **and** with no photo set;
both must render at identical dimensions.

Note that `hidden` (display:none) below `lg` also produces this same console warning
harmlessly, since a display:none parent has zero height by definition. Do not chase that one
— confirm the fix by looking at the rendered banner at ≥1024px, not by the console alone.

**While you are here, sweep for the same pattern elsewhere.** Any `<Image fill>` or
absolutely-positioned content whose sizing ancestor is shrink-to-fit (`justify-self-*`,
`self-start`, a flex item without `w-full`, an inline-block) has the same latent failure and
will collapse the moment a real photo replaces a placeholder. Check at minimum
`ServiceAboutSection.tsx:31`, `ServiceAreaCmsSection.tsx:78`,
`ServicePropertyTypesSection.tsx:29`, `IndustriesSection.tsx:98` and
`CmsDetailPage.tsx:132`. Fix any that are affected, and list the ones you checked and cleared
so the sweep is auditable.

### Step A0b — the deprecation warning in the same log

```
The default export of @sanity/image-url has been deprecated.
Use the named export `createImageUrlBuilder` instead.
```

`sanity/lib/image.ts` line 2 does `import imageUrlBuilder from "@sanity/image-url"`. The
installed version is `2.1.1` and it does export `createImageUrlBuilder` by name — verified in
`node_modules/@sanity/image-url/lib/index.d.ts`, where the default export is explicitly
marked `@deprecated`. Switch to the named import. Purely cosmetic today, but it is noise in
every log the owner reads, and noise in a log is how a real warning gets missed. Fold it into
the same commit or give it its own; either is fine.

## A2. The second, separate problem — silent section dropping

Step A0 very likely explains everything the owner saw. It does **not** explain away what is
below, which is a real latent fault found while investigating and which will bite eventually
if it has not already. Do the audit regardless of how convincing A0 looks — the whole point
is that this failure mode is invisible, so "it looks fine now" is not evidence.

Read `sanity/lib/sections.ts` in full before doing anything else. These facts are confirmed:

**Fact 1 — sections are dropped silently, by design.** `toSection()` returns `null` the
moment any field it considers required is missing, and `toSections()` filters those nulls out
without a word:

```ts
// sanity/lib/sections.ts
const heading = str(raw.heading);
if (!heading) return null;
// …
case "serviceHero": {
  const subheading = str(raw.subheading);
  const secondaryCtaLabel = str(raw.secondaryCtaLabel);
  const secondaryCtaHref = str(raw.secondaryCtaHref);
  if (!subheading || !secondaryCtaLabel || !secondaryCtaHref) return null;
```

Every one of the thirteen section types has the same all-or-nothing gate. The file's own
header comment sanctions it: *"malformed or incomplete sections are dropped — a broken
section must never crash a page."* The intent was right; the implementation trades a crash
for something arguably worse — a page that is quietly wrong, with **zero diagnostic output
anywhere**. Nobody can debug this from a log because there is no log.

**Fact 2 — the photo itself cannot be the direct cause.** Trace it:
`photoOf(raw, "photo")` → `resolvePhoto()`. The worst either can do is return `undefined`,
which sets `photo: undefined` on the section. `ServiceHeroSection.tsx` handles that — it
renders `<ImagePlaceholder>` instead of `<Image>`. And the GROQ projection
`sections[]{ ..., photo{ asset, hotspot, crop, alt }, … }` yields `null` for sections that
have no `photo` at all, which `photoOf` also handles. **So uploading an image is a trigger,
not the cause.** Something about that Studio edit left a *sibling* field failing the gate.
Find out what. Do not fix a theory.

**Fact 3 — the blast radius is larger than one section.** `toSections()` returns `undefined`
when *no* section survives, and `app/(site)/services/[slug]/page.tsx` branches on exactly
that:

```ts
if (!service.sections) {
  // legacy CmsDetailPage layout
```

So a document whose sections all fail the gate does not render an empty page — it silently
falls back to a completely different, much plainer layout. Include that in what you check.

## A3. If the audit does show dropped sections — ranked causes

Only relevant if step A4's audit actually finds drops. Each is falsifiable against the real
dataset; do not assume any of them.

1. **Whitespace-only sibling field.** The CMS gate and the render gate disagree.
   `sanity/schemas/serviceSections.ts` validates with `rule.required()`, which accepts a
   string of spaces or a lone newline. `str()` in `sections.ts` calls `.trim()` and rejects
   it. So `subheading: "\n"` publishes cleanly and then drops the entire section at render
   time. A Studio edit that touches a field and leaves whitespace behind produces exactly the
   reported symptom.
2. **The sibling field was never set on this document.** The hero may have been rendering
   from a state that predates one of these fields being added to the schema, and the act of
   editing-and-republishing wrote the document in its current (incomplete) shape for the
   first time. Compare the published document's `_updatedAt` and field set against a service
   whose hero still renders.
3. **The edit landed on a draft, or on a different field than intended.** A Service has a
   document-level `photo` (used only on the homepage card) *and* six separate image fields
   inside `sections[]`. Confirm which one was actually written, and confirm the published
   perspective — the site reads `perspective: "published"`.
4. **`_key` loss on the array item.** If the Studio patch dropped or duplicated the section's
   `_key`, `key(item, index)` falls back to `section-${index}` and React keys collide across
   re-renders. Less likely to remove a section outright, but cheap to check.
5. **Alt-text validation interaction.** `imageWithAlt` in `sanity/schemas/fields.ts` raises an
   error-level `rule.custom` when an asset is set without `alt`. Establish whether the
   document was publishable in that state and what actually got published.

## A4. Reproduce it and record the truth

Write a **read-only** diagnostic script — `scripts/audit-sections.ts`, run with
`sanity exec scripts/audit-sections.ts` — that:

- fetches every `service` and every `industry` document with the same GROQ projection the
  site uses (import `SERVICE_BY_SLUG_QUERY` / the sections projection rather than
  re-typing it, so the audit cannot drift from production);
- runs each document's raw `sections` array through the **real** `toSections()`;
- prints, per document: the slug, every section's `_type` and `_key` in order, whether it
  **survived** or was **dropped**, and for every drop the exact field names that were empty
  and their raw values rendered visibly (`JSON.stringify`, so `"\n"` and `""` and `null` are
  distinguishable on screen);
- ends with a summary line: total documents, total sections, total dropped, and a loud banner
  for any document where *every* section was dropped (that one is silently falling back to
  the legacy layout).

It must not write, patch, publish or delete anything. Read-only.

Run it. Put the raw output in a new file `SERVICE-SECTIONS-AUDIT.md` in the project root,
with a short plain-English summary at the top that the site owner can act on: which pages are
currently missing sections, and exactly which field in the Studio he needs to fill to bring
each one back. Name the Studio field *titles* he sees ("Second button text"), not the schema
field names, since that is what is on his screen.

**Commit this as step A1 before changing any behaviour.** The audit is valuable on its own and
must stay revertible-independent of the fix.

## A5. Fix the class of problem, not the instance

Now change the design. Three things, one commit each.

### Step A2 — sections degrade instead of vanishing

`toSection()` should drop a section only when it genuinely cannot render — which for almost
every type means "no heading". Everything else should degrade:

- **`serviceHero`**: `heading` is the only truly load-bearing field (it is the page's H1).
  Render without the subheading paragraph, without the secondary CTA button, without the
  credentials strip. `ServiceHeroSection.tsx` already conditionally renders `credentials` and
  `photo`; extend the same treatment to `subheading` and the secondary CTA pair (the button
  renders only when **both** label and href are present — a labelled button going nowhere is
  worse than no button).
- Apply the same principle to every other type: a `whatsIncluded` with zero items or a
  `processSteps` with zero steps is genuinely un-renderable and should still be dropped, but a
  missing `intro` or a missing CTA label should not take the whole section with it.

Go through all thirteen types deliberately and decide, per type, the minimum set that makes
the section meaningful. Write that decision as a one-line comment above each gate, so the
next person does not have to reverse-engineer the intent the way you just did.

Update the type definitions in `data/serviceSections.ts` to match (fields that became
optional must be optional in the type), then update each affected component in
`components/sections/` to handle the newly-optional fields. `npx tsc --noEmit` is the
enforcement mechanism here — if a component does not compile, that is the type system telling
you it assumed a field that can now be absent. Fix it properly; do not reach for `!` or `as`.

### Step A3 — every drop is logged, loudly

Add `logSectionDropped` to `sanity/lib/fallbackLog.ts`, matching the existing
`logFallback` / `logEmpty` / `logImageSkipped` house style (same banner formatting, same
server-only, same behaviour in dev and prod). It must report: the document type and slug, the
section `_type` and `_key`, the array index, and the specific field names that were empty —
followed by one sentence a non-developer can act on, naming the Studio field titles.

`toSection()` cannot see the parent document from where it sits, so thread an identifying
context through `toSections(value, context)` the way `photoOf` already threads context into
`resolvePhoto`. `getServices` / `getIndustries` pass `service "plumbing"` etc.

The same information must also surface in `/api/health/sanity`, alongside the existing image
report: a per-document list of sections kept and dropped with the reason. That endpoint is
how the owner checks production without a terminal, and this is precisely the kind of failure
he cannot otherwise see.

### Step A4 — close the gap at the CMS layer

Make the Studio refuse to publish what the renderer cannot use, so the failure is caught at
publish time by the person who caused it, rather than silently at render time by nobody.

In `sanity/schemas/serviceSections.ts`, the `requiredString` / `requiredText` / `internalHref`
helpers should reject whitespace-only values, not just empty ones — a trim-aware custom rule
alongside `.required()`. Then reconcile the two lists deliberately: **every field the renderer
now treats as load-bearing must be `required()` in the schema, and every field the schema
marks `required()` must be one the renderer actually needs.** Any field that is optional in
the renderer should stop being `required()` in the Studio; making an editor fill a box the
page does not use is its own small cruelty.

Write the reconciled mapping into `SERVICE-SECTIONS-AUDIT.md` as a table: section type,
field, required in Studio (yes/no), load-bearing at render (yes/no). They must agree on every
row. That table is the regression test this repo does not otherwise have.

Do **not** loosen `imageWithAlt` — alt text stays enforced.

### Step A5 — verify the sweep

Re-run `scripts/audit-sections.ts`. Every service and every industry document must report
zero dropped sections, or a dropped section with an explicit, deliberate reason recorded in
the audit file. Then load every service page and every industry page in `npm run dev` and
confirm each one renders its full stack, top banner included. List the pages you checked by
URL in the audit file — "all pages" is not a verification.

---

# PART B — make Vercel update the instant Sanity publishes

`PRODUCTION-INSTANT-UPDATES.md` §3 already lays out the correct plan. It was never executed.
Execute it now, with the Vercel specifics below folded in.

## Step B1 — the safety net (small, low-risk, its own commit)

In `sanity/lib/cacheOptions.ts`, change the production default `revalidate` from `86400` to
`60`. Keep the dev branch and the tags exactly as they are. Reconcile `getJobs`, which passes
its own `{ revalidate: 3600 }` — jobs must not end up *slower* than everything else.

Then rewrite the file's doc comment honestly, because the new behaviour has a subtlety worth
writing down. Time-based revalidation is stale-while-revalidate: once the window expires, the
**next** visitor still receives the old page while a fresh one builds in the background, and
the visitor after that sees the new content. So 60 seconds means "fresh within about a minute,
**plus one page load**" — a safety net, not instant. Say so plainly, and say plainly what it
costs: at most one Sanity query per cache tag per minute across the whole site, which for a
brochure site of this size is negligible but is not zero, and was a deliberate trade.

## Step B2 — Sanity Live (the real fix, the main work)

Follow `.claude/skills/sanity-live-cache-components/SKILL.md`. That skill is the
specification; this section only records what it cannot know about this repo.

- **`sanity/client.ts` and `sanity/lib/serverClient.ts` already exist**, with `useCdn: false`
  and `perspective: "published"`. The skill's "Migrating an existing Sanity Live setup"
  section applies: append and refactor, never replace wholesale.
- **The eleven fetchers are the hard part.** `getFaqs`, `getFooterNavigation`, `getIndustries`,
  `getJobs`, `getNavigation`, `getReviewSettings`, `getServices` (two functions), `getSite`,
  `getTestimonials`, `getTrustLogos`. Their try/catch fallback must survive verbatim,
  including the thrown-vs-empty distinction, and the `try/catch` must sit **outside** the
  `'use cache'` boundary so a transient Sanity error is never itself cached. **Migrate one
  fetcher end-to-end and prove it before touching the other ten.**
- **`cacheComponents: true` is a global switch.** `PRODUCTION-INSTANT-UPDATES.md` §4 already
  contains the impact inventory — including that `export const dynamic = "force-dynamic"` on
  `/api/health/sanity` and `export const dynamic = "force-static"` on the Studio page must be
  removed under Cache Components. Verify each row of that table against the local Next 16
  docs before acting on it; it was written from analysis, not from a build.
- **The Studio must keep working.** If enabling Cache Components breaks `/studio`, stop and
  report — do not work around it.
- **Exactly one `<SanityLive />`.** This app has two layouts: `app/layout.tsx` (root) and
  `app/(site)/layout.tsx` (marketing shell). The `(site)` route group excludes `/studio`,
  which makes it the right home — confirm the Studio route does not render a second copy.
- **Perspective and stega are prop-drilled, not hardcoded.** Grep for `perspective:
  "published"` and `stega` and route them through the skill's `getDynamicFetchOptions` and
  three-layer pattern. Published-and-no-stega must remain the outcome for ordinary visitors.
- **Keep `useCdn: false`.**
- Keep `/api/revalidate` and its signature check even once Live works. Two independent paths
  to fresh content is a feature.

## Step B3 — the Vercel-side facts, written down for the owner

Several things that block production freshness are not in this repo at all. Rewrite
`PRODUCTION-INSTANT-UPDATES.md` §1 and §5 with the now-known specifics, so the owner can work
through it in five minutes without a developer. It must cover:

1. **Vercel → the `fredplumging` project → Deployments.** Which commit is the newest
   *Production* deployment built from? Pushed and deployed are different things. If it is
   older than the commits from this task, redeploy — and untick "Use existing Build Cache".
2. **Vercel → Settings → Environment Variables**, scoped to **Production**:
   `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`,
   `SANITY_REVALIDATE_SECRET`. The two `NEXT_PUBLIC_*` values are compiled into the bundle **at
   build time** — saving them is not enough, a **redeploy** is mandatory. Say this in bold;
   it is the single most common cause of exactly this symptom.
3. **Vercel → Settings → Deployment Protection.** If Vercel Authentication or password
   protection is on for Production, Sanity's webhook POST to `/api/revalidate` is rejected
   before it ever reaches the route, and the failure looks identical to "no webhook". Either
   turn protection off for Production or add a Protection Bypass for Automation and include
   it in the webhook. Check this explicitly — it is invisible from inside the code.
4. **sanity.io/manage → project → API → Webhooks.** Create the publish webhook per
   `WEBHOOK-SETUP.md`, targeting exactly
   `https://fredplumging.vercel.app/api/revalidate`, with the secret matching
   `SANITY_REVALIDATE_SECRET` on Vercel. After creating it, publish something and confirm a
   green delivery in the webhook's Attempts log — an untested webhook is not a webhook.
5. **sanity.io/manage → API → CORS origins.** `https://fredplumging.vercel.app` must be
   listed with credentials allowed. Both the embedded Studio and the Live EventSource connect
   to Sanity from the browser on that origin.
6. **The health check:** `https://fredplumging.vercel.app/api/health/sanity?secret=…` —
   tell him never to paste that URL anywhere, since it carries the secret. Explain how to read
   `tokenPresent`, `sanityReachable`, and `_updatedAt` on a document he just published, and
   now also the new dropped-sections report from Part A.

Order these so the first "no" is the answer, and phrase every item as a question with an
unambiguous yes/no.

## Step B4 — stop rather than half-finish

A partially migrated Cache Components app is worse than an unmigrated one: the failures are
intermittent, environment-dependent, and very hard to attribute later.

If step B2 cannot reach a clean `npm run build`, a clean `npx tsc --noEmit`, a working
`/studio` and every page rendering — **revert B2's commit entirely**, keep Part A and B1, and
write a section in `PRODUCTION-INSTANT-UPDATES.md` stating exactly what blocked it: which
file, which error, and what finishing it would require. Part A plus B1 plus the webhook
already leaves production far better than it is today. Do not invent a workaround for a Cache
Components constraint you do not fully understand — report it.

---

## Housekeeping (fold into whichever commit is natural)

`git status` currently shows the skill duplicated: `.agents/skills/sanity-live-cache-components/`
is tracked-and-modified while `.claude/skills/sanity-live-cache-components/` is untracked.
Two divergent copies of the authoritative guide is a trap for the next person. Diff them,
keep one as the source of truth, and either commit or ignore the other — and say which you
chose and why.

---

## Verification — actually run these, and record the results

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — clean.
3. `npm run typegen` — regenerated, and `npm run check:drift` clean.
4. `npm run build` — succeeds, with **no** `[SANITY FALLBACK]` banner and **no**
   `[SANITY SECTION DROPPED]` banner in the log.
5. `scripts/audit-sections.ts` reports zero unexplained dropped sections.
6. The dev console is clean on a service page with a banner photo set: no `has "fill" and a
   height value of 0` warning at ≥1024px, and no `@sanity/image-url` deprecation warning.
7. `npm run dev`, then load: `/`, **every** service page, **every** industry page,
   `/about/partners`, `/about/careers`, a job detail page, `/about/testimonials`, and
   `/studio`. Every one renders; every service page shows its top banner. List them by URL.
8. `http://localhost:3000/api/health/sanity` returns `sanityReachable: true`,
   `tokenPresent: true`, the new sections report, and **no secret values anywhere in the
   payload**.
9. Publish an image change in the Studio with `npm run dev` running — it appears on the next
   refresh. Record how long it took.
10. If B2 shipped: on a production build (`npm run build && npm run start`), confirm the
    EventSource connection is open in the browser network panel and that a Studio publish
    updates the page **with no manual refresh**. This is the acceptance test for Part B — if it
    does not happen, B2 has not worked, whatever the compiler says.
11. View source on a page served by `npm run start` and confirm there are no stega markers in
    the HTML.
12. `git log --oneline` shows every step as a separate, individually revertible commit.

Finish by telling me, in the chat and in short:

- Whether step A0 (the grid-item sizing fix) fully accounts for the vanishing banner, or
  whether the audit found dropped sections as well — say which, from evidence, not guesswork.
- Which other pages were affected, and which are now fixed by code versus which still need
  the owner to fill a field in the Studio (name the page and the field).
- Whether B2 shipped or was reverted.
- The exact remaining actions only the site owner can perform, in Vercel and in
  sanity.io/manage. That list is what I act on next, so be specific and keep it short.
