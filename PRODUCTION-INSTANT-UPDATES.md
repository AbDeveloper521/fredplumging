# Production instant updates — facts, owner checklist, and plan

*Written 2026-07-28. Companion to `SANITY-IMAGE-AUDIT.md` (what was wrong with
images) and `WEBHOOK-SETUP.md` (how to create the publish webhook).*

The symptom: publishes appear instantly on `localhost` but not on the deployed
site. The repo is fully pushed (`git log origin/main..HEAD` is empty), so this
is a hosting/runtime question, not a missing-code question.

---

## 1. Owner checklist — five minutes, no developer needed

The site lives on Vercel, project **`fredplumging`** (note the spelling —
there is no `b` before the `u`), at `https://fredplumging.vercel.app`. Every
URL below uses that exact host; a webhook or CORS entry typed as
`fredplumbing.vercel.app` will silently fail forever.

Work through these in order. Each has a yes/no answer; **stop at the first
"no" — that is the problem.** Items Q2, Q4 and Q5 are also *blocking
prerequisites* for the instant-updates (Sanity Live) code: until they are
"yes", publishes will not appear instantly no matter what the code does.

**Q1. Is production running the latest code?**
[vercel.com](https://vercel.com) → the `fredplumging` project →
**Deployments**. Does the newest deployment marked *Production* show the
newest commit from this repo? Pushed to GitHub and deployed are **different
things** — a push does nothing until Vercel builds and promotes it. If it is
older: press **Redeploy**, and in the redeploy dialog **untick "Use existing
Build Cache"**, then re-check.

**Q2. Are all four variables set for Production, and was there a redeploy
afterwards?**
Vercel → `fredplumging` → **Settings → Environment Variables**, scope
**Production**. All four must exist:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `SANITY_REVALIDATE_SECRET`

⚠️ **The two `NEXT_PUBLIC_*` values are compiled into the site at build
time. Saving them is not enough — you must redeploy afterwards or the
running site never sees them.** This is the single most common cause of
"works on localhost, not in production".

**Q3. Is Deployment Protection off (or bypassed) for Production?**
Vercel → `fredplumging` → **Settings → Deployment Protection**. Is Vercel
Authentication / password protection **disabled** for the Production
environment? If it is on, Sanity's webhook POST to `/api/revalidate` is
rejected before it ever reaches the site, and the failure looks identical to
"no webhook at all". Either turn protection off for Production, or create a
**Protection Bypass for Automation** token and add it to the webhook's
custom headers. This is invisible from inside the code — only this dashboard
shows it.

**Q4. Does the publish webhook exist, and is its Attempts log green?**
[sanity.io/manage](https://sanity.io/manage) → this project → **API →
Webhooks**. Is there a webhook pointing at exactly
`https://fredplumging.vercel.app/api/revalidate`, with its secret matching
`SANITY_REVALIDATE_SECRET` on Vercel? Create it per `WEBHOOK-SETUP.md` if
not. Then **test it**: publish any small change in the Studio and open the
webhook's **Attempts** log — is the newest delivery a green **200**? An
untested webhook is not a webhook. (401 = secrets don't match; 400 = a
projection was set that shouldn't be; nothing arriving = Q3.)

**Q5. Is the production domain a CORS origin in Sanity?**
[sanity.io/manage](https://sanity.io/manage) → this project → **API → CORS
origins**. Is `https://fredplumging.vercel.app` listed, with **Allow
credentials** ticked? Both the embedded Studio at
`https://fredplumging.vercel.app/studio` and the site's live-update
connection talk to Sanity from the browser on that origin — without this
entry the browser blocks them.

**Q6. What does the health check say?**
Load
`https://fredplumging.vercel.app/api/health/sanity?secret=<SANITY_REVALIDATE_SECRET>`
in a browser. **Never paste that URL anywhere — it contains the secret.**
Read four things:

- `tokenPresent` — must be `true`. If `false`, Q2 failed: the token is
  missing on Vercel, and **no Sanity content can ever reach production**.
- `sanityReachable` — must be `true`. If `false`, the `error` field says why
  (wrong project ID, revoked token, network).
- `_updatedAt` on a document you just published — publish something in the
  Studio, reload the health URL, and check that document's `_updatedAt`
  changed to just now. If it did, Sanity has your change and any remaining
  delay is caching. If it didn't, the publish didn't land (wrong dataset, or
  the change is still an unpublished draft).
- `sections` on each service/industry document — every entry should say
  `dropped: []`. If a section is listed under `dropped`, the page is
  publishing but that section is not rendering; the `fillInStudio` list
  names the exact Studio fields to fill to bring it back.

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

These are the checklist items from §1, as actions, in the order to do them.
Items 2 and 4 are **blocking** for Sanity Live — until they are done, the
instant-update connection cannot open in production at all.

1. **Deploy the latest commit** (Q1): Vercel → `fredplumging` →
   Deployments → Redeploy, unticking "Use existing Build Cache".
2. **Set the four environment variables** for Production (Q2), then
   **redeploy again** — the `NEXT_PUBLIC_*` pair only takes effect at build
   time. *(Blocking for Live: `SANITY_API_READ_TOKEN`.)*
3. **Check Deployment Protection** (Q3): off for Production, or add a
   Protection Bypass for Automation to the webhook.
4. **Add the CORS origin** (Q5): `https://fredplumging.vercel.app` with
   credentials allowed, in sanity.io/manage → API → CORS origins.
   *(Blocking for Live and for the embedded Studio.)*
5. **Create and test the publish webhook** (Q4) per `WEBHOOK-SETUP.md`,
   targeting `https://fredplumging.vercel.app/api/revalidate` — still worth
   having after Sanity Live ships, as the independent second freshness path.
   Confirm a green 200 in the Attempts log after publishing something.
6. **Read the health check** (Q6) and keep its URL private.
