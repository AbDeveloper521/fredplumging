# Claude Code prompt — make the "About this service" photo a square that any image fits

## Goal

On every service page (and every industry page — they share the same section), the **About this
service** band has one photo on the left. Today its box is `aspect-[4/3]`. Make it a **square**,
and make it so that whatever image the owner uploads — portrait, landscape, or square — fills
that square cleanly, with the important part of the picture still in frame and no stretching,
squashing, letterboxing or white bars.

Target file: `components/sections/ServiceAboutSection.tsx` (the primary photo at ~line 51).

**Order of operations:** if `REMOVE-ABOUT-OVERLAP-PHOTO-PROMPT.md` has not been run yet, run that
first. It deletes the small overlapping photo from this same block, and doing these two in the
other order means editing code that is about to be deleted.

---

## The approach — and why the obvious fix is only half of it

The obvious change is `aspect-[4/3]` → `aspect-square` with `object-cover` on the `<Image>`.
`object-cover` guarantees the box is always filled and nothing is ever distorted. Do that.

But `object-cover` crops **from the centre**, blindly. Upload a tall photo of a technician and
the browser will happily crop his head off. So the second half of the fix is to make the crop
follow the **hotspot** the editor sets in Sanity Studio.

Right now that does not happen, and it is worth understanding why before you touch anything.
`sanity/queries.ts` already fetches `hotspot` and `crop` on every image. But
`sanity/lib/image.ts` builds URLs like this:

```ts
builder.image(...).width(width).fit("max").auto("format").url()
```

`fit("max")` means *do not crop* — the CDN returns the whole image at its own aspect ratio and
ignores the hotspot entirely. So the hotspot data is fetched, passed around, and thrown away.
The browser then does a dumb centre-crop in CSS. Fixing the box shape without fixing this just
makes the blind cropping more aggressive.

### What to change

**1. Teach `resolvePhoto` to crop.** Add an optional shape argument — an aspect ratio, or an
explicit height — so a caller can ask for a square. When it is supplied, build the URL with both
a width and a height and `.fit("crop")` so `@sanity/image-url` applies the hotspot and crop
rectangle from the document. When it is not supplied, keep the current `fit("max")` behaviour
exactly as it is, so nothing else on the site changes. Do not alter the alt-text guard, the
`logImageSkipped` warning, or the `undefined` return contract — every existing caller must behave
identically.

Check the `@sanity/image-url` types in `node_modules/@sanity/image-url` before writing this
rather than assuming the method names.

**2. Pass the square request through.** `sanity/lib/sections.ts` calls `photoOf(raw, "photoPrimary")`
for the `serviceAbout` case. That is where the square is requested. Keep it explicit and local —
do not make every image on the site square by changing a default.

**3. Change the box.** In `ServiceAboutSection.tsx`, `aspect-[4/3]` → `aspect-square`, keep
`overflow-hidden rounded-2xl shadow-(--shadow-card-lg)`, keep `object-cover` on the `<Image>`.
Update the `sizes` prop to match the new box so the CDN is not asked for a wildly wrong width.

**4. Tell the editor.** Update the field `description` on `photoPrimary` in
`sanity/schemas/serviceSections.ts` to say, in plain non-technical language: this photo is shown
in a square frame; a square image is ideal, but any shape works — click the image, choose **Edit
hotspot**, and drag the circle over the part that must stay visible. He is not going to read the
code, so this description is the only place he will ever learn that the hotspot control exists.

---

## Layout knock-ons to check, not assume

A square is taller than a 4:3 box at the same width, so the left column grows.

- The red **24/7 Emergency** badge sits at `absolute -top-5 -left-3`. Confirm it still overlaps
  the corner correctly and does not collide with the section's top padding at every breakpoint.
- The decorative gradient rule at `absolute -bottom-4 left-10` — same check.
- The grid is `lg:items-center`. With a taller photo the copy on the right may now float oddly in
  the middle of a tall column. Look at it at 1440px and, if it reads badly, consider
  `lg:items-start` with a little top padding on the copy. Judgement call — make it, then say
  which way you went and why.
- On mobile the photo is full-width, so a square is a large vertical block. Check 375px and 768px
  and confirm it does not push the copy so far down that the section feels broken.

---

## Do not

- Do not use `object-contain` or `object-fill`. `contain` letterboxes with empty bars, `fill`
  stretches faces. `cover` plus a hotspot is the correct answer.
- Do not change `ImagePlaceholder` — it inherits the box shape and will become square by itself.
- Do not change any other image on the site. `CmsDetailPage`, `AboutSection` (homepage),
  `CaseStudySection`, `ServiceAreaCmsSection` and the rest keep their current ratios.
- Do not touch `sanity/lib/getGoogleReviews.ts`.
- Do not add `AggregateRating` or review markup anywhere.

---

## Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build` clean. `npm run typegen` and
   `npm run check:drift` clean.
2. `npm run dev`. On a service page with a **real photo** in the About band, confirm the frame is
   visibly square, the photo fills it edge to edge, nothing is stretched, and no white bars.
3. In `/studio`, upload a deliberately **tall portrait** image to that field, set the hotspot over
   the top third, publish, and confirm the front end keeps that part of the image in frame.
   Repeat with a **wide landscape** image and a hotspot on one side. This is the actual test —
   the square alone proves nothing.
4. Check a service page with **no** photo set: the placeholder is square and still legible.
5. Every service page and every industry page at 375px, 768px, 1024px, 1440px. List what you
   opened.
6. Confirm no other page changed shape — spot-check the homepage About band and a case study.
7. One commit.

## Report

One short paragraph: whether the hotspot crop actually worked in the portrait test, whether you
changed `items-center`, and anything you had to move to stop the badge or the gradient rule
colliding.
