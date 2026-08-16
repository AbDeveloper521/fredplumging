# Claude Code prompt — change the Student Housing slug, and give the slug lock an escape hatch

## The situation

The owner added a new property type, **Student Housing**, under `/multifamily/`. The slug is
wrong. He cannot fix it in Studio because the slug field is `readOnly` after first save — a
guardrail a previous task added, whose warning text tells him to contact his developer. That
guardrail is working correctly; it just has no sanctioned way through it.

**Key fact:** `readOnly` in Sanity is a **Studio UI constraint only**. The Content Lake does
not enforce it, so a script can patch the slug without weakening the schema guard. Do it that
way — do **not** remove or loosen the `readOnly` rule to make this edit.

## Step 1 — investigate and report before changing anything

Read the dataset **read-only** and report:

1. The Student Housing document: its `_id`, current `title`, current `slug.current`, whether a
   **draft** exists alongside the published document, and `_createdAt` / `_updatedAt`.
2. Whether the wrong URL has ever been **published** — this decides whether a redirect is
   needed. A document that only ever existed as a draft was never crawlable.
3. Every other place the slug appears: the multifamily index page (collection-driven, so it
   should follow automatically — confirm), navigation, `sitemap.xml`, any hardcoded link, and
   the FAQ band situation below.
4. Whether the document has an `faqBand` section. The append script in `906a2a5` ran against
   five documents; Student Housing did not exist then, so it almost certainly has none while
   every sibling page does.

**Stop and report before writing anything.** The owner will confirm the old slug value.

## Step 2 — the slug change

`scripts/fix-student-housing-slug.ts`, same safety spec as every other script here:

- Dry-run by default; `--confirm` to write. Print the exact before → after.
- Target: `slug.current` becomes **`student-housing`**. Final URL:
  `/multifamily/student-housing`.
- Patch the **published document and the draft** if both exist.
- Do **not** change the document `_id`, even if it carries the typo — only the slug drives the
  URL, and changing an `_id` means recreating the document and breaking every reference to it.
  Say in the report if the `_id` is now inconsistent with the slug; that's cosmetic and stays.
- Never delete a document or asset.
- Refuse to run if a document already exists at `student-housing` — report the collision
  instead of overwriting.
- Print the stale-Studio-tab warning: close any tab showing Student Housing or the Multifamily
  Index before confirming.

## Step 3 — redirect, only if the old URL was published

If and only if step 1 found the wrong slug was published:

- Add a permanent (308) redirect from the old path to `/multifamily/student-housing` in
  `next.config`.
- Check whether the project already has a redirects list. If it does, add to it in the existing
  style. If not, create one — and note in your report that this is now the place future slug
  changes get handled.

If it was never published, **add no redirect** and say so. A redirect for a URL nobody has ever
visited is dead config.

## Step 4 — backfill the FAQ band

Once the slug is correct, re-run the existing append script so Student Housing gets the same
FAQ band as its five siblings:

```
npx sanity exec scripts/append-multifamily-faq.ts -- --confirm
```

It enumerates from the dataset and is idempotent, so it will skip the five that already have
the band. Confirm in your report that it targets exactly one new document, and include this as
a step for the owner to run — do not run it yourself.

## Step 5 — propose a better long-term guard (do not implement)

The current rule prevents a bad slug from being fixed as effectively as it prevents a good slug
from being broken, which is why this task exists. Propose — in the report, as a recommendation
only — a better design for the owner to approve later. For example: keep the field editable but
require a confirmation, and have any slug change automatically record the old path in a
redirects file so no link ever breaks. **Do not build it in this task.** One decision at a time.

Also: reword the field's warning so it stops saying the change is impossible. It is not
impossible; it needs a developer and a redirect. Suggest replacement wording in the report and
apply it only if it is a pure copy change to the schema description with no behaviour change.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean. **No
   verification scaffolding left in `app/`.**
2. Dry run prints the before → after and writes nothing.
3. After the owner confirms: `/multifamily/student-housing` resolves, the card on `/multifamily`
   links to it, and the old path either 308s to it or 404s cleanly if it was never published.
4. The other five property-type pages are untouched.
5. One commit; nothing uncommitted left behind.

## Report

The document's current `_id`, slug and publish state; whether the wrong URL was ever published
and therefore whether a redirect was added; the before → after slug; confirmation the `_id` was
deliberately left alone; whether the FAQ band is missing and the exact command for the owner;
the dry-run plan; the confirm command; the stale-tab reminder; and your recommendation for the
long-term slug-change design, unimplemented.
