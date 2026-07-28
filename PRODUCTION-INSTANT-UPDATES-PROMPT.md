# Claude Code prompt — make Sanity publishes appear instantly on the PRODUCTION site

## The problem, precisely

Image and content changes published in the Sanity Studio appear immediately on
`localhost` but not on the deployed production site. All code is committed and pushed —
`git log origin/main..HEAD` is empty — so this is **not** a missing-deployment problem
at the git level.

The cause is architectural, and it is working as currently designed:
`sanity/lib/cacheOptions.ts` returns `cache: "no-store"` in development (instant, by
construction) and `next: { revalidate: 86400 }` in production. Production's speed
depends entirely on the `/api/revalidate` webhook clearing that 24-hour cache — and
**that webhook has never been created in sanity.io/manage**, so production falls back to
a 24-hour timer.

Your job is to make production genuinely instant, and to make it impossible for this
failure mode to be invisible again.

---

## 0. Read these before writing any code

**This repo ships the authoritative guide for exactly this task. Read it first.**

1. `.agents/skills/sanity-live-cache-components/SKILL.md` and all four of its reference
   files: `reference/live-helpers.md`, `reference/three-layer-pattern.md`,
   `reference/dynamic-segments.md`, `reference/layouts.md`. This skill covers
   `next-sanity` v13 + Next.js 16 Cache Components, which is precisely this project's
   stack (`next-sanity ^13.2.2`, `next 16.2.11`). **Where the skill and this prompt
   disagree, the skill wins** — it says so itself, and it is version-specific where I am not.

2. The Next.js docs vendored in this repo at `node_modules/next/dist/docs/01-app/` —
   caching, `fetch`, `revalidateTag`, `use cache`, `cacheComponents`, route segment
   config. Next 16 changed these APIs and training-data recall of them is unreliable.
   `sanity/lib/cacheOptions.ts` and `app/api/health/sanity/route.ts` already cite the
   exact doc paths they were written from; follow that convention for anything new.

3. `SANITY-IMAGE-AUDIT.md` and `WEBHOOK-SETUP.md` in the project root — the existing
   findings. Do not re-derive them; extend them.

**Hard constraints (violating any of these makes things worse than the bug):**

- Never log, return, or commit a secret value. `SANITY_API_READ_TOKEN`,
  `SANITY_API_WRITE_TOKEN` and `SANITY_REVALIDATE_SECRET` may only ever be reported as a
  boolean "present / missing".
- **Keep the static-fallback behaviour in every `sanity/lib/get*.ts`.** A failed fetch
  still falls back to `data/*.ts` and still logs via `logFallback`; a successful-but-empty
  result still returns empty. This survives the migration or the migration does not ship.
- Keep alt-text enforcement and `logImageSkipped`.
- **Leave `sanity/lib/getGoogleReviews.ts` completely alone.** It hits the Google Places
  API, which is billed per request.
- Keep `/api/revalidate` and its mandatory signature verification, even after Live is
  working — two independent paths to fresh content is a feature, not redundancy.
- Keep `/api/health/sanity` working and secret-gated.
- Normal production visitors must continue to see **published** content only, with
  **stega disabled** — stega encodes invisible metadata into every string, and it must
  never reach a public visitor's HTML or a search-engine crawler.
- Each numbered step below is **its own commit**, in order, so any step can be reverted
  independently.

---

## 1. First, prove what production is actually doing

Do not fix a theory. Establish the facts and record them in a new file
`PRODUCTION-INSTANT-UPDATES.md` in the project root.

Locally you can determine: the current cache policy, the tag wiring, and whether
`/api/health/sanity` and `/api/revalidate` exist in the deployed commit (they do —
commit `7d66ee4`).

What you cannot determine from the repo is the state of the hosting platform. So the
first section of that file must be a short, literal checklist for the site owner, each
item phrased as a question with an unambiguous answer, covering:

- Which commit the production deployment is actually built from, and whether it is
  `7d66ee4` or later. Pushed to GitHub and deployed are different things.
- Whether `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` and
  `SANITY_API_READ_TOKEN` are set in the production environment — and that
  `NEXT_PUBLIC_*` variables are baked in **at build time**, so adding them requires a
  **redeploy**, not just a save. This trips people up constantly; say it explicitly.
- What `https://<domain>/api/health/sanity?secret=…` returns, and how to read the three
  decisive fields: `tokenPresent`, `sanityReachable`, and `_updatedAt` on a document
  that was just published.

Write it so the owner can work through it in five minutes without a developer.

---

## 2. Ship a safety net immediately (small, low-risk, commit on its own)

Before attempting the larger migration, remove the 24-hour worst case so the site is
usable today even if step 3 is deferred or reverted.

In `sanity/lib/cacheOptions.ts`, change the production default `revalidate` from `86400`
to `60`, keeping the dev branch and the tags exactly as they are, and keeping the
per-call override (`getJobs` passes its own value — reconcile it so jobs are not *slower*
than everything else).

Then rewrite that file's doc comment honestly, because the new behaviour has a subtlety
worth writing down: time-based revalidation is stale-while-revalidate. After the window
expires the **next** visitor still receives the old page while a fresh one is generated
in the background; the visitor after that sees the new content. So a 60-second window
means "fresh within about a minute, plus one page load" — it is a safety net, not
instant. The webhook (`expire: 0`) and Live are what deliver actually-instant.

Also state the cost plainly in the comment: at 60 seconds this is at most one Sanity
query per cache tag per minute across the whole site, which for a brochure site of this
size is negligible — but it is not zero, and whoever reads this later should know that
was a deliberate trade rather than an accident.

Update `WEBHOOK-SETUP.md` to note that this backstop exists so nobody concludes the
webhook is optional. It is not: without it, publishes still take up to a minute plus a
reload, and the whole point of step 3 is to beat that.

---

## 3. The real fix — Sanity Live (the main work)

Follow `.agents/skills/sanity-live-cache-components/SKILL.md` to wire the Sanity Live
Content API into this app. That is what makes production updates arrive **without any
webhook and without any timer**: `<SanityLive>` holds an EventSource connection to the
Sanity Content Lake and revalidates cached content the moment a document changes.

The skill is the specification. This section only records the constraints specific to
*this* repo, which the skill cannot know:

**Do not overwrite existing files blindly.** `sanity/client.ts` already exists with
`useCdn: false` and `perspective: "published"`. `sanity/lib/serverClient.ts` wraps it
with the read token. The skill's "Migrating an existing setup" guidance applies: append,
preserve, and refactor rather than replace.

**The eleven fetchers are the hard part.** `getFaqs`, `getFooterNavigation`,
`getIndustries`, `getJobs`, `getNavigation`, `getReviewSettings`, `getServices`,
`getSite`, `getTestimonials`, `getTrustLogos` each wrap a fetch in try/catch and fall
back to a static module. When migrating them to `sanityFetch`, the fallback must survive
verbatim — including the distinction that a *thrown error* falls back but a *successful
empty result* does not. Migrate one fetcher first, prove it end to end, then do the rest.

**`cacheComponents: true` is a global switch and it will surface problems elsewhere.**
Before enabling it, inventory every place that will be affected and list them in
`PRODUCTION-INSTANT-UPDATES.md`: `generateStaticParams` (services, industries, careers
`[slug]`), `generateMetadata`, `app/sitemap.ts`, `app/robots.ts` if present, the
`export const dynamic = "force-dynamic"` on `/api/health/sanity`, the `/api/revalidate`
route, and the embedded Studio route at `/studio`. Check each against the skill's
anti-pattern list and the local Next docs. **The Studio must keep working** — if
enabling Cache Components breaks `/studio`, stop and report rather than working around it.

**Exactly one `<SanityLive />` in the tree**, and one `<VisualEditing />` if you get
that far. Note this app has two layouts — `app/layout.tsx` (root) and
`app/(site)/layout.tsx` (marketing shell). Place it per the skill's guidance and verify
the Studio route does not end up rendering a second copy.

**Perspective and stega must be prop-drilled, not hardcoded.** Grep for
`perspective: "published"` and `stega: false` and route them through the skill's
`getDynamicFetchOptions` and three-layer pattern. Published-and-no-stega must remain the
outcome for ordinary visitors — that is the same behaviour, arrived at correctly.

**Keep `useCdn: false`.** Live and the CDN cache are a bad combination here.

---

## 4. Stop rather than half-finish

A partially migrated Cache Components app is worse than an unmigrated one: the failures
are intermittent, environment-dependent, and very hard to attribute later.

So: if step 3 cannot be completed with a clean `npm run build`, a clean
`npx tsc --noEmit`, a working `/studio`, and every page rendering correctly — **revert
step 3's commit entirely**, leave steps 1 and 2 in place, and write a section in
`PRODUCTION-INSTANT-UPDATES.md` explaining exactly what blocked it, which file, which
error, and what would be needed to finish. Steps 1 and 2 already leave production far
better than it is today, and the webhook remains a complete solution on its own.

Do not invent a workaround for a Cache Components constraint you do not fully
understand. Report it instead.

---

## 5. OPTIONAL — only if steps 1–4 are green, and in its own commit

Draft Mode, Visual Editing and the Presentation tool, per the skill. This would let the
owner see an image before publishing it, and click from the live page into the field
that produces it — genuinely valuable for a non-technical client, and the largest
remaining risk surface. Draft mode must be off by default, guarded by a secret, and the
published path must be byte-identical when the draft cookie is absent.

If it looks like it will sprawl, skip it and write a paragraph describing what it would
involve. That is an acceptable outcome.

---

## 6. Verification — actually run these, and record the results

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — clean.
3. `npm run build` — succeeds, with **no** `[SANITY FALLBACK]` banner in the log.
4. `npm run dev`, then visit: `/`, a service page, an industry page, `/about/partners`,
   `/about/careers`, a job detail page, `/about/testimonials`, and **`/studio`**. Every
   one renders. The Studio loads and can edit and publish.
5. `http://localhost:3000/api/health/sanity` still returns `sanityReachable: true`,
   `tokenPresent: true`, and no secret values.
6. Publish an image change in the Studio with `npm run dev` running. It appears on the
   next refresh. Record how long it took.
7. If step 3 shipped: confirm the EventSource connection is actually open in the browser
   network panel on a production build (`npm run build && npm run start`), and that a
   publish updates the page **without a manual refresh**. This is the acceptance test for
   the whole task — if it does not happen, step 3 has not worked, regardless of whether
   it compiled.
8. Confirm production HTML contains no stega markers: view source on a page served by
   `npm run start` and confirm strings are clean.
9. `git log --oneline` shows the steps as separate, individually revertible commits.

Finish by telling me, in the chat: which step delivered the instant behaviour, whether
step 3 shipped or was reverted, and the exact remaining actions that only the site owner
can perform in the hosting console or in sanity.io/manage. Be specific and short — that
list is what I act on next.
