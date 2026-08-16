# Claude Code prompt — add the Fred's Plumbing favicon

The browser tab currently shows the default Next.js/Vercel triangle because the app has no
icon files. Three ready-made files are in the **project root** (delivered alongside this
prompt):

- `favicon.ico` — multi-resolution (16 / 32 / 48 / 64)
- `icon.png` — 512×512
- `apple-icon.png` — 180×180

They are already cropped, padded and colour-corrected. **Do not regenerate, resize, or
re-crop them** — the small sizes were tuned separately from the large ones (tighter crop,
thickened strokes, brighter red) so the blackletter "F" stays legible at 16px. Resizing
`icon.png` down to make the others would undo that.

## What to do

1. Move all three files from the project root into **`app/`**:
   - `app/favicon.ico`
   - `app/icon.png`
   - `app/apple-icon.png`

   These are Next.js App Router **file conventions** — placing them in `app/` makes Next
   generate the correct `<link rel="icon">`, `<link rel="apple-touch-icon">` and sizing
   metadata automatically. Do not hand-write icon `<link>` tags, and do not add an `icons`
   block to the `metadata` export; the file convention wins and duplicating it produces two
   competing sets of tags.

2. **Check `app/layout.tsx` and any `metadata` export for existing icon config** — if
   something already declares icons (a stale path, a `/public/favicon.ico` reference, or an
   `icons:` key), remove it so the file convention is the single source. Report what you
   found.

3. **Check `public/`** for an orphaned `favicon.ico`. If one exists it may win over the app
   convention depending on how it's referenced. Remove it if it's unused — but if anything
   references it explicitly, report before deleting.

4. Confirm the site's `manifest` (if one exists) points at the right icon, or leave it alone
   if it doesn't exist. **Do not create a web manifest** in this task.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build` — all clean. No verification scaffolding left in
   `app/`.
2. View source on the built site and confirm exactly **one** set of icon links is emitted, with
   no 404s on any icon URL.
3. Hard-reload a page and confirm the tab shows the red "F" rather than the Next.js triangle.
   Favicons cache aggressively — if it doesn't change, try a fresh incognito window before
   concluding anything is broken.
4. Check the icon on both a light and a dark browser theme. The tile is black, which is
   deliberate: it keeps the red mark readable on both.
5. One commit; nothing uncommitted left behind.

## Report

Where the files ended up; any pre-existing icon config or `public/favicon.ico` you removed;
confirmation that only one set of icon tags is emitted; and a note that the source logo is a
raster PNG, so if a crisper mark is ever wanted the logo would need vectorising to SVG — not
needed now, just worth the owner knowing.
