# Go-Live Checklist — Sanity CMS

## Why this order matters

**Seeding must happen before real credentials reach production.** Since phase 3,
a *successful* Sanity fetch that returns zero documents is treated as
intentional: sections hide and no `/services/[slug]` or `/multifamily/[slug]`
pages are generated. Deploying real credentials against an **empty dataset**
therefore ships a site with a hidden services grid, hidden testimonials/FAQs,
and navigation links pointing at pages that don't exist. (With *placeholder*
credentials the fetches fail and the static fallbacks render — that's why the
site looks complete today.) Seed first; flip credentials second.

## Token map

| Env var | Permission | Where it lives | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | public | local + host (Production **and** Preview) | Ships in the client bundle — safe |
| `NEXT_PUBLIC_SANITY_DATASET` | public | local + host (Production **and** Preview) | Ships in the client bundle — safe |
| `SANITY_API_READ_TOKEN` | **Viewer** | local + host (Production **and** Preview) | App reads only. **Never `NEXT_PUBLIC_`** |
| `SANITY_API_WRITE_TOKEN` | **Editor** | local / CI only | Used only by `scripts/`. **Never `NEXT_PUBLIC_`, never on the host** |
| `SANITY_REVALIDATE_SECRET` | n/a (shared secret) | local + host (Production **and** Preview) | Must equal the webhook's Secret field. **Never `NEXT_PUBLIC_`** |

## Sequence

1. **Local credentials.** In sanity.io/manage: note the project ID, create the
   `production` dataset, create the **Viewer** read token and the **Editor**
   write token, and add all four values + a generated
   `SANITY_REVALIDATE_SECRET` to `.env.local`.
2. **CORS.** Manage → API → CORS origins: add `http://localhost:3000` and the
   production origin, credentials allowed (the embedded Studio logs in from
   your domain).
3. **Seed.** `npm run seed -- --confirm`. Expect the summary listing
   1 siteSettings, 1 navigation, 8 services, 4 industries, 6 FAQs,
   4 testimonials, 7 trust logos, and the note that images were skipped.
4. **Studio visual check.** `npm run dev` → `/studio`: every document opens,
   Site Settings and Navigation Menu show as singletons (no create/delete),
   services show placeholder page content, slug fields show the ⚠ warning and
   are locked.
5. **Local build verification.** `npm run build` must show **zero
   `[SANITY FALLBACK]` banners** (any banner means the app fetched fallback
   data — stop and investigate), all 12 slug pages under `● (SSG)`, everything
   else `○ (Static)`, only `/api/revalidate` dynamic.
6. **Drift check.** `npm run check:drift` → every line `✓ … fallback matches
   published content.` Silence on divergence is the acceptance test for the
   seed.
7. **Host env vars.** Set the four host-side vars (see table) for
   **Production AND Preview** — a Preview deploy without them crashes at build
   (env validation throws by design). Do **not** set the write token on the
   host.
8. **Deploy.** Watch the build log for fallback banners (there must be none)
   and the same route table as step 5.
9. **Smoke test production.** Home page renders with header phone number;
   `/services/commercial-plumbing` and `/multifamily/apartments` return 200
   with the placeholder body visible; an invented slug 404s; `/studio` loads
   and logs in; `/robots.txt` disallows `/studio`.
10. **Webhook.** ⚠️ Production instant-updates depend entirely on this webhook
    existing — it is a step in sanity.io/manage that no code change can perform.
    Without it, publishes take up to 24 hours to appear. Click-by-click guide
    for a non-developer: `WEBHOOK-SETUP.md`. Summary — Manage → API →
    Webhooks → Create:
    - URL: `https://<production-domain>/api/revalidate`
    - Dataset: `production`; trigger on create, update, delete
    - Filter: `_type in ["siteSettings", "navigation", "faq", "testimonial", "service", "industry", "trustLogo", "reviewSettings", "jobPosting"]`
    - Projection: leave empty (the route reads `_type` — and `_id` for its
      logs — from the payload; a projection that omits `_type` 400s every
      publish)
    - Secret: the exact `SANITY_REVALIDATE_SECRET` value
11. **Webhook verification.** Edit the tagline in Site Settings → Publish →
    reload the production homepage: the change appears on the first or second
    reload (immediate-expire revalidation). Check the webhook's "Attempts" log
    in Manage shows a 200 from `/api/revalidate`.
12. **Invite the client.** Only now: Manage → Members → invite as **Editor**.
    Walk them through: slugs are permanent (checked before first save), every
    image needs a description, "Display order" numbers control ordering, and
    the two singletons can't be deleted.

## Known blockers / client confirmations

- **Application routing is mailto-only until a form backend exists.**
  `submitLead()` is a stub, so /about/careers deliberately has no application
  form — every "Apply Now" is a mailto (or an external `applyUrl` set in the
  Studio). Do not add a form before a real backend receives it.
- **Careers structured data is off until the client supplies a business street
  address** (Site Settings → address fields) **and per-role `datePosted` /
  `validThrough` dates.** `JobPostingJsonLd` intentionally renders nothing
  until all of those exist — a half-populated JobPosting risks a manual action.
- **The hiring-process section copy is unconfirmed** — the four steps in
  `components/sections/HiringProcessSection.tsx` are placeholders to be
  verified with the client.
- **Production domain and inbox unconfirmed** — `data/site.ts` still carries
  the placeholder `fredsplumbingdfw.com`, but the Google listing points at
  `fredsplumbingservices.com`; confirm the domain and whether
  `service@fredsplumbingdfw.com` is the real inbox before launch.

## After go-live

- Content edits happen in the Studio; the webhook keeps pages fresh. The 24h
  revalidation backstop covers a broken webhook (worst case: one day stale).
- If the fallback constants in `data/*.ts` drift from published content,
  `npm run check:drift` reports it (run it in CI with `DRIFT_STRICT=1` to make
  it fail the pipeline). After deliberate content changes, update the
  constants to match — they're what visitors see if Sanity has an outage.
- Slug corrections: `npm run fix:slug -- <document-id> <new-slug>` — read the
  warning it prints about the old URL and redirects.
