# Claude Code prompt — hero overlay toggle in Sanity + finish production instant updates

Two tasks. Task 2 is not new work — it is finishing work that is already specified.

---

## Task 1 — optional overlay on the service-page hero image

The redesigned `ServiceHeroSection` (centred text over a full-width background photo) draws
a dark navy gradient overlay over the image so text stays readable. The owner's photos
sometimes **already have an overlay baked into the image file**, so the code overlay
double-darkens them. He wants a Studio control.

- Add a field to the service hero's schema (next to the background image field):
  **"Dark overlay over the photo"**, boolean, `initialValue: true`. Description in owner
  language: "Keeps text readable over bright photos. Turn this off only if your image is
  already dark or has its own overlay — the text must stay readable."
- Thread it through the GROQ projection, `sanity/lib/sections.ts` mapping (missing/absent →
  `true`, so every existing page is pixel-identical), the section type in `data/`, and the
  component: overlay element renders only when the flag is true.
- **Keep a minimal readability floor even when the overlay is off** — do not let white text
  sit on an unknown image with literally nothing behind it. A subtle text shadow or a very
  light scrim behind the text block only (not the whole image) is acceptable; pick one, keep
  it visually near-invisible on dark images, and say what you chose. The no-photo navy-wash
  state is unaffected by the toggle.
- Same toggle applies wherever this hero component is shared (industry pages). One field,
  one behaviour.
- `npm run typegen` + `npm run check:drift` clean; verify at 375/768/1024/1440 with the
  toggle on and off, on a bright photo and a dark one.

## Task 2 — make Sanity publishes appear on Vercel (finish Part B)

The owner keeps hitting the same wall: edits publish in Sanity, localhost updates
instantly, **production on Vercel does not**. The complete fix is already written in
`SERVICE-SECTIONS-AND-VERCEL-PROMPT.md` — Part B2 (Sanity Live) and Part B3 (the owner's
Vercel/Sanity checklist). Do this now, in this order:

1. **Audit what state the repo is actually in.** Is `defineLive`/`<SanityLive/>` +
   `cacheComponents` implemented, or partially (there is a `sanity/lib/live.ts` — read what
   it really does)? Is it in the latest commit pushed to `origin/main`? Is the deployed
   Vercel commit the same one (`git log origin/main -1`)? Report before changing anything.
2. **Implement whatever of B2 is missing**, per that file's spec and the in-repo skill:
   every fetcher, fallback semantics preserved (thrown → fallback, empty → empty), exactly
   one `<SanityLive/>`, Studio keeps working, `useCdn: false` stays.
3. **Cover the new document types.** Cache tags now include `homePage`, `cityPage`,
   `aboutPage`, `contactPage` — confirm `/api/revalidate` resolves them and that nothing
   filters them out. If the code keeps a list of valid tags, the new types must be on it.
4. **Print the owner checklist with exact click-paths**, because these are the steps only
   he can do and they are almost certainly the missing half:
   - Vercel → Settings → Environment Variables → `SANITY_API_READ_TOKEN` set for
     Production → then **Redeploy** (env changes don't apply to old builds).
   - Vercel → Settings → Deployment Protection → off for Production (or the webhook is
     silently rejected).
   - sanity.io/manage → API → CORS origins → add `https://fredplumging.vercel.app` (with
     credentials).
   - sanity.io/manage → API → Webhooks → POST to
     `https://fredplumging.vercel.app/api/revalidate` with the shared secret matching
     `SANITY_REVALIDATE_SECRET` in Vercel; **no type filter, or a filter that includes every
     document type in the site** (list them).
   - Push + deploy the B2 commit itself.
5. **Define the pass test** he runs at the end: edit one heading in Studio on production,
   publish, and see it on `https://fredplumging.vercel.app` within seconds without a
   redeploy. If that test fails after the checklist, capture
   `/api/health/sanity` output and the Vercel function logs for `/api/revalidate` and
   report what they say instead of guessing.

Stop-rather-than-half-finish rule from the original file still applies: if B2 cannot be
completed safely, revert to a clean state and say why — a half-migrated cache layer is
worse than the 24-hour cache.

## Verify

`npx tsc --noEmit`, lint, build, typegen, `check:drift` clean; localhost renders identically
with the overlay toggle untouched; the B2 audit findings, the implementation diff summary,
and the owner checklist all in the report. One commit per task.
