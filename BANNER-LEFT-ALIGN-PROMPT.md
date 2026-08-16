# Claude Code prompt — left-align the top banner on every page

## What to change

Every page carries a dark photo banner at the top: breadcrumb, red eyebrow, H1, and an intro
paragraph, all currently **centred**. The owner wants all of it **left-aligned**, on every
page that uses this banner.

Scope is **the banner only**. Section headings further down the page keep their current
alignment — do not touch them in this task. If you find centred headings below the banner
that now look inconsistent, **list them in your report** and leave them alone; that's a
separate decision the owner will make after seeing this live.

## Find the shared component first

This banner appears on service pages, city pages, the index pages, About, Partners, Careers,
Contact, Multi-Family and the property-type pages. Establish whether it is **one** shared
component or several near-duplicates before editing anything, and report what you found.

- If it's one component, change it once.
- If there are two or three near-copies, **change them all** so the site is consistent — and
  say so in your report, because that's a consolidation candidate for later. Do not refactor
  them into one component in this task; just make them match.

Grep for the hero/banner component(s), the breadcrumb component, and any page that passes
alignment-related props.

## The alignment work

Change the container from centred to left-aligned. That means more than swapping
`text-center` for `text-left` — the current layout almost certainly centres the *block* too,
via `mx-auto` on the inner wrapper, `items-center` on a flex column, or `justify-center`.
Remove the block centring as well, or the text will left-align inside a still-centred column
and look wrong.

Specifically:

1. **Breadcrumb** — moves to the left edge of the content container, aligned with the H1
   below it. Same left edge as the rest of the page's content container, not the viewport
   edge.
2. **Eyebrow ("FRED'S PLUMBING")** — currently has a **decorative red rule on both sides**.
   Centred, symmetric rules look right; left-aligned, a rule hanging off the left edge before
   the text does not. Keep **one** rule and drop the other — either a short rule to the left
   of the text acting as a bullet, or text-then-rule trailing to the right. Pick whichever
   matches the eyebrow treatment used elsewhere on the site (check the section eyebrows) and
   say which you chose and why.
3. **H1** — left-aligned. Check the existing max-width: a centred headline is often given a
   generous width because it's balanced on both sides. Left-aligned, the same width can leave
   an awkward short last line. Set a sensible max-width so the headline breaks well, and
   check the longest H1 on the site (the specialty-services one in the owner's screenshot is
   a good stress test — it wraps to two lines at desktop width).
4. **Intro paragraph** — left-aligned, constrained to a readable measure (~60–70ch). This
   matters more now: centred text visually self-limits, left-aligned text will run the full
   container width and read badly if unconstrained. **Also check `text-balance` /
   `text-pretty`** — if the current markup uses `text-balance` on the paragraph (common for
   centred hero copy, and it produces that even ragged shape in the owner's screenshot), it
   should generally come off the paragraph for left-aligned text. Keep `text-balance` on the
   H1 if it's there and helps the headline break well.

## Things that will break if you don't check them

- **Vertical rhythm.** Centred layouts often use symmetric padding. Left-aligned, the block
  may need its left padding checked against the site's content container so the H1 lines up
  exactly with content in the sections below it. Misalignment by a few pixels between the
  banner H1 and the first section heading is the most likely visible defect. Check it
  deliberately.
- **Mobile.** At 375px the banner is nearly full-width already, so the change is subtle —
  but confirm the breadcrumb doesn't wrap oddly and the eyebrow rule doesn't collide with
  the text.
- **The background image focal point.** With text moving left, the photo's subject may now
  sit behind the text where it previously sat beside it. Check the darkening overlay still
  gives enough contrast for white text on the **left** third of every banner image, not the
  centre. If any specific page's banner image now hurts legibility, report it rather than
  changing the image — the owner controls those in Studio.
- **Any banner variant** that carries something extra — a CTA button, badges, chips — must
  also move left, not stay centred.

## Sanity

This is a **rendering change only**. Do not add an alignment field to the schema, do not
touch any document, and do not run a migration. Every banner is left-aligned; there is no
per-page choice.

If a banner schema already has an alignment field, report it — but leave it alone.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean.
   **No verification scaffolding left in `app/`** — a previous task shipped a broken harness
   route and failed the Vercel build.
2. Walk **every page type** and confirm the banner is left-aligned with nothing left centred:
   homepage, a service page, `/services`, `/areas-we-serve` and a city page, `/multifamily`
   and a property-type page, `/commercial` if it exists, About, Partners, Careers,
   Testimonials, Contact, and the legal pages if they exist. List what you checked.
3. 375 / 768 / 1024 / 1440 on at least four of those.
4. The banner H1's left edge lines up with the content below it — verify with devtools, not
   by eye.
5. White text still passes contrast over the left portion of each banner image.
6. Nothing below the banner changed.
7. One commit; nothing uncommitted left behind.

## Report

Whether the banner is one shared component or several near-copies (and which files you
changed); which eyebrow rule treatment you chose and why; the max-width values you set for
the H1 and intro; whether `text-balance` was present and what you did with it; any page whose
background image now hurts legibility with text on the left; and the list of centred section
headings below the banner that the owner may want to revisit — **listed only, not changed**.
