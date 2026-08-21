# Claude Code prompt — make fredsplumbing.com the canonical domain

The live domain is now **https://fredsplumbing.com** (apex, no `www`). The Vercel preview
domain `fredplumging.vercel.app` must stop acting like a second copy of the site, and every
hardcoded reference to it in the codebase must point at the real domain.

Two separate jobs: a redirect, and a sweep.

---

## Part 1 — redirect the Vercel domain to the real one

Anyone landing on `fredplumging.vercel.app/anything` should be **308-redirected** to
`https://fredsplumbing.com/anything` — same path, same query string.

Why it matters: right now the site is reachable at two addresses. That's duplicate content,
it splits ranking signals, and Google may index the wrong one. It's also just untidy — the
Vercel URL has a typo in it.

Implement in **`middleware.ts`** (or extend the existing one if there is one):

- Read the `host` header. If it matches `fredplumging.vercel.app`, redirect permanently (308,
  not 302 — this is permanent and should pass ranking signal) to the canonical host, preserving
  path and query.
- **Only redirect that exact host.** Do **not** blanket-redirect every `*.vercel.app` — that
  would break Vercel's per-branch preview deployments, which you need for testing. Match the
  one production alias explicitly.
- Never redirect `localhost` or `127.0.0.1`.
- Take the canonical host from the existing site-URL constant / `NEXT_PUBLIC_SITE_URL`, not a
  string typed inline.
- Exclude `/api/*` from the redirect, or verify that the Sanity webhook to `/api/revalidate`
  still works through it. A 308 preserves the POST method and body so it should survive, but
  confirm rather than assume — and note in the report that the webhook URL should be updated in
  Sanity regardless.
- Keep the middleware matcher tight so it doesn't run on static assets and `_next/*`.

**Also check whether Vercel's own domain settings already handle this.** If the project has
`fredsplumbing.com` set as the primary domain with a redirect configured, the middleware may be
redundant. Report what you find — if Vercel is already doing it, say so rather than adding a
second mechanism doing the same job.

### www

The canonical is the **apex**: `https://fredsplumbing.com`. If `www.fredsplumbing.com`
resolves, it should redirect to the apex too. This is best handled in Vercel's domain settings
rather than in code — check and report which is in place.

---

## Part 2 — sweep every hardcoded reference

Grep the whole repo for `fredplumging`, `vercel.app`, and any bare `https://` used as a site
URL. Produce a **file : line : current : proposed** table before changing anything.

Known offenders (there may be more — find them all):

- **The email logo URL** — `https://fredplumging.vercel.app/logos/freds-plumbing-logo-email.png`,
  used twice per email (header and footer). This has been flagged for cutover twice; this is the
  cutover.
- **The customer confirmation footer** — "You're receiving this because a request was submitted
  at fredplumging.vercel.app" and the bare domain link beneath it.
- **`metadataBase`**, canonical tags, Open Graph URLs.
- **`sitemap.xml`** and **`robots.txt`**.
- Any JSON-LD `url` field.
- `.env.example` — the example value should be `https://fredsplumbing.com`.

Everything must resolve from **one** constant driven by `NEXT_PUBLIC_SITE_URL`, defaulting to
`https://fredsplumbing.com`. Report how many inline duplicates you removed — that count is the
measure of whether this stays fixed.

---

## Owner actions to list in your report

These are dashboard changes you cannot make from the codebase. Spell them out:

1. **Vercel** → set `NEXT_PUBLIC_SITE_URL=https://fredsplumbing.com`, then **redeploy** (env
   changes don't apply to an existing deployment).
2. **Sanity** → add `https://fredsplumbing.com` as a CORS origin at sanity.io/manage, and update
   the webhook that posts to `/api/revalidate` so it targets the real domain.
3. **Google Search Console** → add and verify `fredsplumbing.com`, submit the sitemap. If the
   Vercel URL was ever verified there, it can be left alone; the 308 handles it.
4. Confirm the emails' logo now loads from the real domain once deployed.

## Constraints

- No verification scaffolding left in `app/`. No symlinks or junctions into the working tree.
- Don't touch `getGoogleReviews` or its cache.
- Structured-data bans stand: no `AggregateRating`, `Review`, or `FAQPage`.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen — clean.
2. **Re-run the greps from Part 2 and paste the output.** Zero hits for `fredplumging` outside
   this prompt file and any historical changelog.
3. Locally, simulate the redirect (set the `host` header to `fredplumging.vercel.app` with curl)
   and confirm a **308** to `https://fredsplumbing.com` with the path and query preserved.
4. Confirm `localhost` and a branch-preview host are **not** redirected.
5. Confirm `/api/revalidate` still accepts a POST.
6. `sitemap.xml` and `robots.txt` emit the real domain; canonical tags on three sample pages
   point at the real domain.
7. One commit; nothing uncommitted left behind.

## Report

Whether Vercel was already redirecting (and whether the middleware is therefore belt-and-braces
or the only mechanism); the before/after table; the count of inline duplicates removed; the
redirect test output; confirmation that preview deployments still work; and the owner-action
list above with the exact values to set.
