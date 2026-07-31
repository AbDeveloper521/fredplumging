# Claude Code prompt — migrate the published Home Page document to the new sections[] shape

## What happened

The `homePage` document in Sanity was filled in and **published under the old grouped
schema** (fixed object fields: `hero`, `about`, `emergency`, `whyChooseUs`, `process`,
`compliance`, `caseStudy`, `serviceArea`, `finalCta` — the owner's Studio screenshot shows
all of them under "Unknown fields found"). The section-stack refactor then replaced those
groups with a `sections[]` array. Result: the Studio shows unknown-field warnings, the new
`sections` array is empty, the code falls back to the static default stack, and the images
the owner uploaded (visible in the unknown-field JSON as asset references) no longer render
on the homepage.

Nothing is lost — the content and asset references are all still on the document. The task
is to move them into the new shape.

## Write `scripts/migrate-homepage-sections.ts` (run via `sanity exec`)

- **Read-only by default.** Print, per old group found on the document: which new section
  item it will become, which fields carry over, and every image asset reference being
  preserved. Writes happen only with `--confirm`.
- Map each old group to its corresponding item in the new `sections[]` array, in the default
  stack order the fallback data uses. Copy every field the new item shape has an equivalent
  for — headings, paragraphs, arrays, and **image fields with their asset refs, hotspot,
  crop and alt intact** (copy the objects verbatim; do not re-upload or re-reference
  assets). Generate proper `_key`s and `_type`s matching the new schema exactly — build the
  mapping from the current schema definitions in `sanity/schemas/homePage.ts`, not from
  memory.
- The old shape has no `industries` group and the default stack deliberately omits the
  industries section — do not create one.
- If the document **already has a non-empty `sections` array** (e.g. the owner started
  re-entering by hand), stop and report instead of merging — no overwrites of newer work.
- Only after all groups are copied in the same transaction, `unset` the old top-level group
  fields so the "Unknown fields found" warnings disappear. **The script must be incapable of
  anything else destructive**: it patches exactly one document (`homePage`), never deletes a
  document, never touches assets, never touches any other type. Do not imitate
  `scripts/seed-reviews.ts`.
- Field-shape drift: where an old field has no home in the new shape (or vice versa), leave
  the new field empty, keep the old value in the dry-run output, and list it in the report
  rather than guessing.

## Verify

1. Dry run prints a complete, sane plan; nothing written without `--confirm`.
2. `npx tsc --noEmit` and lint clean; no schema or component changes in this task at all.
3. After the owner runs `--confirm` (do not run it yourself): Studio shows the Home Page
   with populated sections and **no unknown-field warnings**, and localhost renders the
   owner's images again. Include these as post-confirm checks in your report for the owner
   to perform.

## Report

The dry-run plan, the exact confirm command, any field that could not be mapped, and one
line telling the owner what to check in Studio and on localhost afterwards.
