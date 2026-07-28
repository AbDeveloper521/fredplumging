# Claude Code prompt — diagnose why Sanity image changes don't appear, then make published changes show up instantly in dev AND production

## Goal

When the site owner uploads or replaces an image in the Sanity Studio and presses
**Publish**, the new image must appear on the next page load — on `localhost` during
development, and on the deployed production site. Today it can take up to 24 hours,
or never appear at all, and the failure is silent.

This task has two halves: **find out what is actually broken** (there are several
independent candidate causes and they produce identical symptoms), and **remove every
source of delay and silence**.

---

## 0. Read this before writing any code

**Hard constraints. Violating any of these makes the change worse than the bug.**

1. **This project runs Next.js 16.2.11.** Cache and revalidation APIs changed in this
   major version and your training data is very likely wrong about them. Before you
   write or modify a single `fetch` option, `next.config.ts` key, or route segment
   config, **read the real docs shipped in this repo**:
   `node_modules/next/dist/docs/01-app/` — specifically the caching, `fetch`,
   `revalidateTag`, route-segment-config, and `images` pages. Quote the exact option
   names you found into `SANITY-IMAGE-AUDIT.md` (see section 1) so the choice is
   traceable. If an option in this prompt does not exist in those docs, **use what the
   docs say and note the substitution** — do not invent an API and do not silently skip it.

2. **Never log, echo, return, or write a secret value.** `SANITY_API_READ_TOKEN`,
   `SANITY_API_WRITE_TOKEN` and `SANITY_REVALIDATE_SECRET` may only ever be reported as
   a boolean "present / missing". The diagnostic route in section 4 is the main risk
   here — it must report presence, never content. Do not add real values to
   `.env.example`.

3. **Do not weaken the alt-text requirement.** `sanity/schemas/fields.ts` enforces alt
   text on every image and `resolvePhoto()` refuses to render an image without it.
   That is deliberate — the fix is to make the refusal *loud*, not to remove it.

4. **Do not remove the static-fallback behaviour** in `sanity/lib/get*.ts`. A failed
   fetch must still fall back to `data/*.ts` and still log via `logFallback`. A
   successful-but-empty result must still return empty. Both rules stay.

5. **Do not change `perspective: "published"`** in `sanity/client.ts` as part of
   sections 1–6. Drafts staying invisible is correct behaviour. (Section 7 is an
   explicitly optional exception.)

6. **Leave `sanity/lib/getGoogleReviews.ts` alone.** It fetches the Google Places API,
   not Sanity. Google Places is billed per request; a zero-cache development setting
   there would charge the client on every hot reload. Its `revalidate: 86400` stays.

---

## 1. Diagnose first, and write down what you found

Before changing behaviour, audit the current state and write the findings to a new file
`SANITY-IMAGE-AUDIT.md` in the project root. This file is for a non-technical reader —
plain sentences, no jargon dumps. For each item below, state what you found and whether
it is a cause of the reported symptom.

Check all of these:

- **`next.config.ts` → `images.remotePatterns`** — confirm `cdn.sanity.io` with pathname
  `/images/**` is allowed. Confirm whether `minimumCacheTTL` is set, look up its default
  in the local Next docs, and state in the audit how long the Next image optimizer will
  hold an optimized copy of a given source URL. Note whether that matters when a *new*
  asset is uploaded (the source URL changes) versus when the same asset is re-cropped.

- **`sanity/client.ts`** — confirm `useCdn: false` and `perspective: "published"`.
  Record in the audit, in one sentence each, what each of those means for the owner:
  that unpublished drafts are invisible to the site, and that reads are not served from
  a CDN copy.

- **Every fetcher in `sanity/lib/get*.ts`** — list each one with its current
  `revalidate` value and cache tag. There are eleven. Flag that `revalidate: 86400`
  means a 24-hour worst case whenever the webhook does not fire.

- **`app/api/revalidate/route.ts`** — confirm the tag it invalidates (`body._type`)
  matches the tag constants the fetchers actually use (`SERVICE_TAG = "service"`,
  `INDUSTRY_TAG = "industry"`, `TRUST_LOGO_TAG = "trustLogo"`, and so on). Report any
  tag that a webhook could never invalidate because no `_type` produces it.

- **Every image field in the schema, and which page region renders it.** Grep for
  `imageWithAlt` — it appears in `sanity/schemas/service.ts`, `industry.ts`,
  `trustLogo.ts`, and **six separate times in `sanity/schemas/serviceSections.ts`**.
  Produce a table in the audit: field name → Studio location → where it appears on the
  live site. This matters because the document-level "Photo" field on a Service drives
  the homepage card, while the images *on* a service page come from the Page sections —
  editing the wrong one and seeing no change is a likely explanation of the reported bug.

- **Development-mode caching.** Look up in the local Next docs how `fetch` cache
  entries behave under `next dev` in 16.2.11, including any Server Components HMR cache
  and how to disable it. Report whether a plain browser refresh in dev can currently
  serve a stale Sanity response.

- **Environment variables.** Report only the *names* present in `.env.local` and
  whether each required one is set. Then state plainly in the audit: if
  `SANITY_API_READ_TOKEN` is missing on the production host, `sanity/lib/serverClient.ts`
  throws, every fetcher falls back to `data/*.ts`, and **no Sanity change will ever
  appear in production** no matter how long the owner waits. This is the single most
  likely production-only cause and it must be called out in bold in the audit.

Then apply the fixes below.

---

## 2. Instant in development

Create `sanity/lib/cacheOptions.ts` — one shared helper so the policy lives in a single
file instead of being duplicated across eleven fetchers:

- Export a function that takes a cache tag (or array of tags) and returns the `next`
  fetch options object.
- In production it returns the current behaviour: a long `revalidate` (keep 86400 for
  everything except jobs, which stays 3600) plus the tag.
- In development (`process.env.NODE_ENV === "development"`) it returns options that do
  not cache at all, so every refresh of `localhost:3000` re-queries Sanity.

**Verify the exact development-mode option in the local Next 16 docs before writing it.**
Two candidate spellings exist and they are mutually exclusive: `next: { revalidate: 0 }`
and `cache: "no-store"`. Next throws if both a `cache` value and `next.revalidate` are
supplied on the same `fetch`, so pick one and use it consistently. Keep the tags
attached in both modes — a tag on an uncached fetch is harmless, and dropping it would
break production revalidation.

Add a short comment at the top of the file explaining *why* the two environments differ:
in development the owner is watching the screen and wants the change now; in production
an uncached fetch on every request would mean a Sanity API call for every visitor.

Then update all eleven fetchers to use it: `getFaqs`, `getFooterNavigation`,
`getIndustries`, `getJobs`, `getNavigation`, `getReviewSettings`, `getServices`,
`getSite`, `getTestimonials`, `getTrustLogos`. (`getGoogleReviews` is excluded — see
constraint 6.) Keep each file's existing exported tag constant where other modules
import it; only the options object changes.

If the local docs confirm that `next.config.ts` supports disabling the dev-mode Server
Components HMR fetch cache, set that option too, with a comment naming the docs page you
found it on. If it does not exist in 16.2.11, write that in the audit instead of guessing.

---

## 3. Instant in production

Production speed depends on the Sanity webhook actually reaching the deployed site.
Two things are needed: the route must be reliable and observable, and the owner must be
able to set the webhook up without guessing.

**Harden `app/api/revalidate/route.ts`:**

- Keep the signature verification exactly as it is. It is mandatory — an unauthenticated
  revalidation endpoint is a denial-of-service vector. Do not add a bypass, not even one
  gated on an environment variable.
- Add a `console.log` on the success path recording the document `_type`, the `_id` if
  present, and the tag that was revalidated. This is what makes the difference between
  "the webhook isn't firing" and "the webhook fires but revalidates the wrong tag"
  visible in the host's runtime logs.
- Log the *reason* on every rejection path too (missing secret, bad signature, missing
  `_type`) — currently an invalid signature returns 401 with no server-side trace.
- Add a `GET` handler that returns a small JSON body confirming the route is deployed and
  whether `SANITY_REVALIDATE_SECRET` is set (**boolean only, never the value**), plus a
  one-line reminder that Sanity must POST here. This lets the owner paste the URL into a
  browser and confirm the endpoint exists before debugging anything else. `GET` must
  never revalidate anything.

**Write `WEBHOOK-SETUP.md` in the project root** — a short, literal, click-by-click guide
for a non-developer, covering: going to sanity.io/manage → the project → API → Webhooks →
Create webhook; the exact URL to enter (`https://<production-domain>/api/revalidate`);
HTTP method `POST`; the dataset to target; triggering on create, update and delete; the
API version to pin (`2026-07-01`, matching `sanity/env.ts`); leaving the projection empty
so the full document is sent (**the route reads `_type` from the payload — a custom
projection that omits `_type` will make every webhook fail with a 400**); disabling
drafts; and pasting the same secret that is set as `SANITY_REVALIDATE_SECRET` on the
production host.

State explicitly in that file, in plain language, that **a webhook cannot reach
`localhost`** — Sanity is calling a public URL from the internet and a laptop is not one.
Localhost speed comes from section 2, not from the webhook. This is the single most
common source of confusion here and it should be impossible to miss.

Also state that the secret in the Sanity webhook form and the `SANITY_REVALIDATE_SECRET`
on the host must be byte-identical, and that a trailing space pasted into either one
produces a silent 401 on every publish.

Add a line to `GO-LIVE.md` recording that production instant-updates depend on this
webhook being created, since it is a hosting-console step that no code change can perform.

---

## 4. A diagnostic route that answers "is it working?" in one URL

Create `app/api/health/sanity/route.ts`. This is the highest-value part of the task: it
turns "the image didn't change" into a definite answer, and it works identically on
localhost and on production.

**Access control, and get this right:**

- In development, allow it.
- In production, require a `secret` query parameter matching `SANITY_REVALIDATE_SECRET`,
  compared with a timing-safe comparison (`crypto.timingSafeEqual` over equal-length
  buffers — guard the length check first so it cannot throw). On mismatch or missing
  secret, return **404**, not 401, so the route is not discoverable.
- Make the route uncached — look up the correct route-segment config for that in the
  local Next docs.
- Do not link to it anywhere, and make sure it cannot end up in `sitemap.ts` or be
  crawled.

**What it returns** (JSON, and nothing secret):

- `projectId`, `dataset`, `apiVersion` from `sanity/env.ts`.
- `NODE_ENV`, and `VERCEL_ENV` if present.
- `tokenPresent`, `revalidateSecretPresent` — booleans only.
- `sanityReachable` — whether a live query succeeded — and on failure, the error
  *message* only.
- For every published service and industry: `slug`, `_updatedAt`, and for each image
  field on the document and inside its `sections` array, an entry giving the field path,
  whether an asset is set, whether alt text is set, the **resolved image URL** if
  `resolvePhoto` returns one, and a plain-English `status` — one of
  `"rendering"`, `"no image uploaded"`, or `"image uploaded but alt text is missing — the
  site is showing a placeholder instead"`.

`_updatedAt` is the key field: it tells the owner whether the publish actually landed in
the dataset, which separates a Sanity problem from a caching problem in one glance. The
resolved URL tells them whether the asset the site sees is the one they just uploaded —
comparing asset IDs is definitive where comparing pictures by eye is not.

Document the route at the top of `SANITY-IMAGE-AUDIT.md`, with the production URL form
including the secret parameter, and a warning not to paste that URL into a public place.

---

## 5. Make the silent failures loud

Three failure modes currently produce a placeholder image and no explanation anywhere.

- **Missing alt text.** In `sanity/lib/image.ts`, `resolvePhoto()` returns `undefined`
  when an asset exists but `alt` is empty, and the caller renders `ImagePlaceholder`.
  Keep that behaviour, but emit a server-side warning when it happens — an asset was set
  and was deliberately dropped. Follow the existing house style in
  `sanity/lib/fallbackLog.ts` and add a `logImageSkipped` (or similarly named) helper
  there rather than a bare `console.warn` scattered in `image.ts`. The message must name
  the reason and be actionable: which document, which field, and that alt text is
  required. Take the document slug or id through as an optional parameter so the log
  identifies *which* image; if plumbing that through every call site is intrusive, log
  the asset reference instead and say so in the audit.

- **Fallback content in production.** `logFallback` already prints loudly at build time.
  Confirm it also fires at request time when a fetch fails on a running server, and note
  in the audit where the owner would see that output on their host.

- **`ImagePlaceholder` in development.** Consider rendering a small dev-only hint on the
  placeholder (visible only when `NODE_ENV === "development"`) naming the field that is
  missing an image. Only do this if it can be done without shifting layout or appearing
  in production markup — if it cannot, skip it and say why in the audit.

---

## 6. Remove the "wrong field" trap in the Studio

The owner can edit an image that is not the one shown on the page they are looking at.
Fix that in the Studio copy, not in code.

Update the `description` on each `imageWithAlt` field so it states plainly **where that
image appears on the live site**. In particular:

- `sanity/schemas/service.ts` → the `photo` field description should say it appears on
  the homepage services card, and add a sentence pointing out that the large images on
  the service's own page come from the **Page sections** list on the same document.
- `sanity/schemas/serviceSections.ts` → each of the six image fields should name its
  section and roughly where on the page it sits ("the large photo beside the page
  heading", "the photo in the About band", and so on) rather than describing it generically.

Keep the existing tone of the schema descriptions: written for the business owner, not
for a developer. Do not rename any field, do not change any field `name`, and do not
alter validation — description text only, so no migration is required.

---

## 7. OPTIONAL — see changes before publishing

**Only attempt this after sections 1–6 are complete and verified, and keep it in a
separate commit.** If it adds risk or sprawl, stop and write a paragraph in the audit
describing what it would involve instead.

Everything above makes a **published** change appear instantly. It does not let anyone
see a draft. If the owner wants to preview an image before publishing, that needs Next
Draft Mode plus a `previewDrafts`-perspective client: an enable/disable route pair
guarded by a secret, a cookie-aware client selection inside the fetchers, and uncached
reads whenever draft mode is on.

If you do build it: the draft client must never be reachable without the guard, draft
mode must be off by default, and the ordinary published path must be completely
unchanged when the cookie is absent. Verify the Draft Mode API against the local Next 16
docs — it is one of the areas most likely to have changed.

---

## 8. Constraints recap

- Read `node_modules/next/dist/docs/01-app/` before using any cache API. Do not trust
  memory on Next 16.
- No secret values in logs, JSON responses, committed files, or `.env.example`.
- Alt-text enforcement stays. Static fallbacks stay. `perspective: "published"` stays
  (outside optional section 7).
- `getGoogleReviews` keeps its 86400 cache — it is a billed external API.
- The revalidate webhook keeps mandatory signature verification. No bypass.
- Do not touch any file under `data/` — those are fallback content, not configuration.
- Do not change any Sanity field `name`, and do not change any slug.
- `npm run lint` and `npm run build` must both pass, and `npx tsc --noEmit` must be clean.

---

## 9. Verification — actually run these

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — clean.
3. `npm run build` — succeeds, and the build log shows **no** `[SANITY FALLBACK]` banner.
   If it does, Sanity is unreachable from the build and that must be resolved first.
4. `npm run dev`, then open `http://localhost:3000/api/health/sanity`. Confirm it returns
   `sanityReachable: true`, `tokenPresent: true`, and a list of services with `_updatedAt`
   values and resolved image URLs. Confirm **no token or secret string appears anywhere**
   in the response.
5. With the dev server running, change an image in the Studio on a service, publish it,
   then hard-reload the service page in the browser. The new image must appear without
   restarting the dev server. Record in the audit how long it actually took.
6. Repeat step 5 but delete the alt text so validation is bypassed via an existing
   document, or set an image with no alt through the Vision tool. Confirm the terminal
   prints the new "image skipped" warning naming the field, and that
   `/api/health/sanity` reports `"image uploaded but alt text is missing"` for it.
7. `curl` the revalidate route with a GET and confirm it reports the route is live and
   `revalidateSecretPresent: true` — and nothing more.
8. POST to the revalidate route with a deliberately wrong signature and confirm it
   returns 401 and logs the rejection reason server-side.
9. In production, load `/api/health/sanity` **without** the secret and confirm it 404s.
10. Confirm the two new docs exist and are readable by a non-developer:
    `SANITY-IMAGE-AUDIT.md` and `WEBHOOK-SETUP.md`.

Finish by summarising, in the chat, the ranked list of causes you actually found for the
original symptom — not the ones you fixed defensively, the ones that were genuinely
broken — and state clearly which of them required a hosting-console action that only the
owner can perform.
