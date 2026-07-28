# Why image changes weren't showing up — audit and findings

*Written 2026-07-28, after auditing the code and the local Next.js 16.2.11
documentation shipped inside this project.*

This file explains, in plain language, every place a published image change
could get stuck between the Sanity Studio and the website, what we found in
each, and what was changed.

---

## The one-URL health check (start here next time)

A diagnostic page now answers "is it working?" in one glance:

- On your computer during development: `http://localhost:3000/api/health/sanity`
- On the live site:
  `https://<production-domain>/api/health/sanity?secret=<SANITY_REVALIDATE_SECRET>`

  ⚠️ **That production URL contains the secret. Never paste it into a chat,
  email, ticket, or anywhere public.** Without the correct secret the page
  pretends not to exist (a 404), on purpose.

What to look at in its output:

- **`_updatedAt`** on each service/property type — the moment the last publish
  landed in Sanity. If it doesn't change after you press Publish, the problem
  is in the Studio (you edited a draft, or a different document). If it *does*
  change but the page doesn't, the problem is caching or the webhook.
- **`resolvedUrl`** on each image — the exact image file the site sees.
  Comparing this before/after an upload is definitive, where comparing
  pictures by eye is not.
- Each image's plain-English **`status`**: `"rendering"`, `"no image
  uploaded"`, or `"image uploaded but alt text is missing — the site is
  showing a placeholder instead"`.

---

## Findings, ranked by likelihood of causing the reported symptom

### 1. ❗ THE PRODUCTION SHOW-STOPPER: a missing token on the host

**If `SANITY_API_READ_TOKEN` is not set on the production hosting platform,
the site cannot talk to Sanity at all. Every page silently serves the built-in
backup content from the `data/` folder, and NO Sanity change — image or text —
will EVER appear in production, no matter how long you wait.** The build log
does warn (a large `[SANITY FALLBACK]` banner), but nothing on the site itself
does. This is the single most likely explanation for "it never appears at
all". The health-check URL above reports `tokenPresent: true/false` for
whichever environment you load it on — check production first.

On this development machine, all five required variables are present in
`.env.local`: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
`SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_REVALIDATE_SECRET`.
Whether they are set on the production host cannot be verified from here — it
must be checked in the hosting console.

### 2. ❗ The 24-hour wait: the webhook doesn't exist yet (production)

Every content fetch was cached for 24 hours (86,400 seconds), with a Sanity
"webhook" — a publish notification sent to
`https://<production-domain>/api/revalidate` — meant to clear that cache
instantly. **Creating that webhook is a step inside sanity.io/manage that no
code change can perform.** If it hasn't been created (GO-LIVE.md lists it as a
go-live step, and the site isn't live at its final domain yet), production
publishes take up to a full day to appear. That exactly matches "up to 24
hours". Click-by-click setup guide: **`WEBHOOK-SETUP.md`**. Important: a
webhook can never reach `localhost` — it only helps the deployed site.

A related trap now guarded against: the secret pasted into the Sanity webhook
form and `SANITY_REVALIDATE_SECRET` on the host must be byte-identical; a
stray trailing space makes every publish fail with a silent 401. The
revalidate route now logs the reason for every rejection, and visiting it in
a browser (GET) confirms it's deployed and whether the secret is set.

### 3. ❗ Editing the wrong image field (affects both localhost and production)

A Service (and a Property type) has **two kinds of image fields**, and they
show up in completely different places:

- The document-level **"Photo"** field → the card on the **homepage** only.
- The images inside the **"Page sections"** list → the images on the
  service's **own page** (banner, About collage, service-area photo, property
  cards).

Changing the homepage-card Photo and then looking at the service page (or
vice versa) shows no change — correctly — and reads exactly like "my change
never appeared". Every image field's description in the Studio now states
where that image appears. The full map:

| Field | Where you edit it in the Studio | Where it shows on the site |
|---|---|---|
| Service → Photo | Service document, below "Page sections" | Homepage "What We Do" card |
| Service → Top banner (hero) → Banner photo | Inside "Page sections" | Tall photo beside the page heading, top of the service page |
| Service → About → Main photo | Inside "Page sections" | Large collage photo in the About band |
| Service → About → Small overlapping photo | Inside "Page sections" | Smaller collage photo overlapping the main one |
| Service → Property cards → Card photo | Inside "Page sections" | Photo across the top of each property card on the service page |
| Service → Service area → Photo | Inside "Page sections" | Photo beside the city list near the bottom of the page |
| Property type → Photo | Industry document | Homepage "Industries We Serve" panel |
| Property type → Page sections images | Same six section fields as services | The property type's own page |
| Trust logo → Logo image | Trust Logo document | Homepage trust strip, Compliance logo row, Partners page cards |

(Nine `imageWithAlt` usages exist in the schema: services, industries,
trust logos, and five image spots inside the section library — the section
library's fields are shared by both services and property types.)

### 4. ❗ Missing alt text silently drops the image (both environments)

Every image requires a short description (alt text) — this is deliberate and
stays: it's what screen readers announce to blind visitors. But if an image
exists *without* one (older documents, or edits made through the API), the
site quietly showed the placeholder with no explanation anywhere. Now:

- The server prints a clear warning naming the document and field (e.g.
  `IMAGE SKIPPED: service "commercial-plumbing" → Photo has an image uploaded
  but no alt text…`) whenever this happens.
- The health-check URL reports it per image as `"image uploaded but alt text
  is missing — the site is showing a placeholder instead"`.
- Where an image sits inside a page section, the warning names the section
  type and field. The section mapper doesn't know which parent document it's
  processing (plumbing that through every call site was judged too invasive),
  so in that one case the warning also includes the image's internal asset
  reference, which the health check can match to a document.

### 5. Development-mode caching (localhost only) — fixed

Two separate dev-mode caches could serve a stale Sanity response after a
publish:

- **The HMR cache.** The local Next docs
  (`03-api-reference/04-functions/fetch.md`, "Troubleshooting") confirm that
  in `next dev`, fetch responses in Server Components are cached across
  hot-reload refreshes *even for uncached requests*, cleared only by a full
  navigation. So yes — a plain refresh could previously show stale content.
  The docs' documented off-switch, `experimental: { serverComponentsHmrCache:
  false }` (page `05-config/01-next-config-js/serverComponentsHmrCache.md`),
  is now set in `next.config.ts`.
- **The 24-hour fetch cache applied in dev too.** All fetchers now go through
  one shared helper, `sanity/lib/cacheOptions.ts`: in development every
  request re-queries Sanity (`cache: "no-store"`); in production the
  long-cache-plus-webhook behaviour is unchanged. The exact option spelling
  was verified against the local `fetch.md`: `cache: "no-store"` and
  `next.revalidate` are mutually exclusive on one fetch (Next ignores both if
  both are given), so dev uses only `cache: "no-store"`, with cache tags kept
  in both modes.

Result: on localhost, a publish now appears on the next browser refresh.

### 6. Checked and NOT broken

- **`next.config.ts` image allowlist** — `cdn.sanity.io` with pathname
  `/images/**` is correctly allowed; Sanity images were never being blocked.
- **The image optimizer's own cache** — `minimumCacheTTL` is not set; the
  local docs (`03-api-reference/02-components/image.md`) give the default as
  **14,400 seconds (4 hours)**, and note there is no way to invalidate this
  cache on demand. This does **not** matter when a *new* image is uploaded:
  a new upload gets a brand-new `cdn.sanity.io` URL, which the optimizer has
  never seen, so it fetches it fresh. It *would* matter if the same asset
  were re-cropped in a way that keeps the URL identical — a rare edge, so the
  default is left alone rather than trading away image-serving efficiency.
- **`sanity/client.ts`** — `useCdn: false`: the site reads straight from the
  live Sanity API, never a possibly-stale CDN copy of the data.
  `perspective: "published"`: the site only ever shows **published** content —
  an edit that is saved but not *published* is invisible to the site by
  design. (If "I changed it and nothing happened" ever means a blue "unpublished
  changes" dot was still showing in the Studio, this is why.)
- **Webhook tag names** — the revalidate route clears the cache tag equal to
  the changed document's `_type`. All nine tags used by the fetchers
  (`service`, `industry`, `trustLogo`, `siteSettings`, `navigation`, `faq`,
  `testimonial`, `reviewSettings`, `jobPosting`) exactly match a real
  document type, so no tag was unreachable. Note the section objects inside a
  service (e.g. `serviceHero`) never arrive as a webhook `_type` — they're
  part of the service document, whose publish fires the `service` webhook, so
  they're covered.
- **Fetcher inventory before the change** — ten fetcher files (eleven exported
  fetch functions, since services and industries each expose a list and a
  by-slug variant sharing one options object), all tagged, all
  `revalidate: 86400` except `getJobs` at 3600 — the 24-hour worst case
  whenever the webhook doesn't fire. `getGoogleReviews` calls the *Google
  Places* API, not Sanity; it is billed per request and deliberately keeps its
  24-hour cache — untouched.
- **Fallback warnings at request time** — the `[SANITY FALLBACK]` banner fires
  inside each fetcher's error handler, which runs wherever the fetch runs: at
  build time *and* at request time on a running server. On Vercel it appears
  in the project's **Logs / Functions** tab; on any other host, in the server
  process's console output.

### Verified live (2026-07-28, dev server running)

The full loop was exercised against the real dataset with a reversible edit
(removing and re-adding the alt text on the Commercial Plumbing photo via the
API — the same effect as a Studio publish):

- The change appeared on the **very next page request, within seconds, with no
  dev-server restart** — before this work it could sit behind a 24-hour cache.
- The terminal printed the new warning naming the exact document and field
  (`IMAGE SKIPPED: service "commercial-plumbing" → Photo …`), and
  `/api/health/sanity` reported that image as *"image uploaded but alt text is
  missing — the site is showing a placeholder instead"*.
- Restoring the alt text brought the photo back on the next request.
- `GET /api/revalidate` returns the deployment check with
  `revalidateSecretPresent: true` and nothing more; a POST with a wrong
  signature returns 401 and logs the reason server-side.
- The health response contains no token-like strings — presence booleans only.
- The production-only 404 (loading the health URL without the secret) can only
  be confirmed once deployed; the code returns 404 for any non-development
  environment unless the secret matches.

One more diagnosis fell out of this check: **of the 60 image slots across all
published services and property types, only 2 currently have an image at all**
(the same photo, on Commercial Plumbing and Emergency Plumbing, both uploaded
2026-07-28). Every other spot shows a placeholder simply because nothing has
been uploaded there yet — worth knowing before concluding anything "didn't
update".

### Decisions worth recording

- **Dev-only hint on the image placeholder: skipped.** The placeholder
  already displays the intended-subject caption (the `photoSubject` text from
  the Studio), which identifies which image spot it is. Naming the exact CMS
  field would require threading field paths through every section component,
  and `NODE_ENV`-conditional markup in a shared component risks dev/prod
  markup divergence — not worth it for information the caption and the
  health-check URL already provide.
- **Route segment config for the health route** — this project does not enable
  `cacheComponents`, so per the local guide
  `02-guides/caching-without-cache-components.md` the legacy segment option
  `export const dynamic = "force-dynamic"` is the correct way to make the
  diagnostic route uncached, and is what's used.
- **Draft preview (optional section 7): not built.** Everything above makes
  *published* changes instant; previewing an unpublished draft is a separate
  feature. It would need: a pair of secret-guarded routes to switch Next's
  Draft Mode cookie on and off, a second Sanity client using the
  `previewDrafts` perspective (token-authenticated, never reachable without
  the guard), a cookie check inside all ten fetchers choosing between the two
  clients, and uncached reads whenever draft mode is on — roughly a dozen
  touched files whose failure modes (draft content leaking into the public
  cache) are worse than the feature. The Studio's own preview pane plus
  instant publish covers the current need; build Draft Mode only if the owner
  asks for true pre-publish preview.
