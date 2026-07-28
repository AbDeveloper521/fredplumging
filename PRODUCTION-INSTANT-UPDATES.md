# Production instant updates — facts, owner checklist, and plan

*Written 2026-07-28. Companion to `SANITY-IMAGE-AUDIT.md` (what was wrong with
images) and `WEBHOOK-SETUP.md` (how to create the publish webhook).*

The symptom: publishes appear instantly on `localhost` but not on the deployed
site. The repo is fully pushed (`git log origin/main..HEAD` is empty), so this
is a hosting/runtime question, not a missing-code question.

---

## 1. Owner checklist — five minutes, no developer needed

Work through these in order. Each has a yes/no answer; stop at the first "no"
— that is the problem.

**Q1. Is production actually running the latest code?**
Open the hosting dashboard (e.g. Vercel → the project → Deployments) and look
at the commit hash on the newest *Production* deployment. Is it `7d66ee4` or
newer? Pushed to GitHub and deployed are **different things** — a push does
nothing until the host builds and promotes it. If the hash is older, press
"Redeploy" (or merge/promote) and re-check.

**Q2. Are the three Sanity variables set in the production environment?**
Hosting dashboard → Settings → Environment Variables. All three must exist
for **Production**:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`

⚠️ The two `NEXT_PUBLIC_*` values are baked into the site **at build time**.
Adding or fixing them and clicking Save is **not enough** — you must trigger a
**redeploy** afterwards or the running site never sees them. This catches
people constantly.

**Q3. What does the health check say?**
Load `https://<production-domain>/api/health/sanity?secret=<SANITY_REVALIDATE_SECRET>`
in a browser (never share that URL — it contains the secret). Read three
fields:

- `tokenPresent` — must be `true`. If `false`, Q2 failed: the token is missing
  on the host, and **no Sanity content can ever reach production**.
- `sanityReachable` — must be `true`. If `false`, the `error` field says why
  (wrong project ID, revoked token, network).
- `_updatedAt` on the document you just published — publish something in the
  Studio, reload the health URL, and check that document's `_updatedAt`
  changed to just now. If it did, Sanity has your change and any remaining
  delay is caching (Q4). If it didn't, the publish didn't land (wrong dataset,
  or the change is still an unpublished draft).

**Q4. Does the publish webhook exist in sanity.io/manage?**
[sanity.io/manage](https://sanity.io/manage) → project → API → Webhooks. Is
there a webhook pointing at `https://<production-domain>/api/revalidate` with
a green recent delivery in its Attempts log? If not, follow
`WEBHOOK-SETUP.md`. This is a step only you can perform — no code change can
create it.

---

## 2. What the code says (established locally, 2026-07-28)

- Commit `7d66ee4` (current `main`, fully pushed) contains both
  `/api/health/sanity` and `/api/revalidate`. If production runs this commit,
  both URLs work.
- **The 24-hour delay is by design, and the design's fast path was never
  activated.** Every Sanity fetch is cached with `revalidate: 86400` (24 h) in
  production (`sanity/lib/cacheOptions.ts`). The thing meant to beat that
  timer — the Sanity publish webhook hitting `/api/revalidate` — **has never
  been created in sanity.io/manage**. So production always waits out the
  timer. Localhost is instant because the same file disables caching entirely
  in development.
- The cache-tag wiring itself is correct: all nine tags match webhook
  `_type`s, verified in `SANITY-IMAGE-AUDIT.md`.

## 3. The fix, in three independently revertible steps

1. **This document** (fact-finding, no behaviour change).
2. **Safety net:** production `revalidate` drops from 24 hours to 60 seconds.
   Even with nothing else done, production is at worst ~a minute plus one
   reload behind the Studio. See the honest caveats in
   `sanity/lib/cacheOptions.ts`.
3. **The real fix — Sanity Live:** migrate data fetching to `next-sanity`'s
   `defineLive`/`sanityFetch` with Next.js Cache Components, per the
   repo skill `.claude/skills/sanity-live-cache-components/`. The deployed
   site then holds a live connection to Sanity and refreshes cached content
   the moment a publish happens — no webhook, no timer, no reload-twice.
   The webhook remains as a second, independent freshness path.

## 4. Cache Components impact inventory (step 3 pre-flight)

Enabling `cacheComponents: true` is global. Surfaces in this repo it touches,
checked against the skill's anti-pattern list and the vendored Next 16 docs:

| Surface | Impact | Action |
|---|---|---|
| `sanity/lib/get*.ts` (10 files, 11 fetch fns) | `fetch` `next.revalidate` options replaced by `'use cache'` + `cacheLife`/`cacheTag` | Inner `'use cache'` helper per query; fallback try/catch stays outside the cache boundary so errors are never cached |
| `generateStaticParams` (services, multifamily, careers `[slug]`) | Still supported; calls fetchers | No change needed — the Sanity fetch happens inside a `'use cache'` helper |
| `generateMetadata` (root layout + pages), `app/sitemap.ts`, `app/robots.ts` | Must not do uncached IO | Same — fetchers' cache boundary covers them; `robots.ts` fetches nothing |
| `app/api/health/sanity/route.ts` | `export const dynamic = "force-dynamic"` **removed in Next 16 when Cache Components is on** | Delete the export; GET handlers reading the request are dynamic by default |
| `app/studio/[[...tool]]/page.tsx` | `export const dynamic = "force-static"` likewise removed | Delete the export; the Studio page has no data access and still prerenders |
| `app/api/revalidate/route.ts` | `revalidateTag(tag, {expire: 0})` unchanged under Cache Components | Keep; fetchers pass their tag via `sanityFetch`'s `tags` option so the webhook still lands |
| `app/(site)/layout.tsx` | Gets the single `<SanityLive>` (route group excludes `/studio`, so the Studio never renders it) | Layout awaits only `draftMode()` — the one dynamic API allowed in a prerendered layout |
| `next.config.ts` `experimental.serverComponentsHmrCache` | Applied to `fetch()`; `sanityFetch` under Cache Components doesn't go through that path | Removed together with the migration (dev freshness now comes from Live events) |
| `sanity/lib/getGoogleReviews.ts` | Uses raw `fetch` with `next.revalidate` — a legacy option under Cache Components | **Left alone** (hard constraint). `GOOGLE_PLACES_API_KEY` is unset, so the function returns `null` before ever fetching; if the key is ever added, this file must be revisited — noted here so it isn't a surprise |

## 5. What only the site owner can do (nothing in this repo can)

1. Verify/press **deploy** so production runs the latest commit (Q1).
2. Set `SANITY_API_READ_TOKEN` (+ the two `NEXT_PUBLIC_*` vars) in the
   production environment, then **redeploy** (Q2).
3. Create the **publish webhook** in sanity.io/manage per `WEBHOOK-SETUP.md`
   (Q4) — still worth doing even after Sanity Live ships, as the independent
   second path.
4. In sanity.io/manage → API → CORS origins: make sure the production domain
   is listed (with credentials allowed). The Studio at `/studio` and the Live
   connection both talk to Sanity from the browser on that domain.
