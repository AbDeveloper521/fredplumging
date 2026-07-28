# Claude Code prompt — build the About Us page (`/about`)

## 0. Orientation

`app/(site)/about/page.tsx` is a `PagePlaceholder`. Replace it with a real page. It is the
parent route of three pages that already exist and are already built — `/about/careers`,
`/about/partners`, `/about/testimonials` — so this page also has to work as their landing point.

Read before writing anything:

- `app/(site)/about/partners/page.tsx` — the structural template for a hand-built page in this
  repo: dark hero (`bg-navy-950`, `bg-grid-dark`, two radial washes, red rule + eyebrow),
  `Container`, the SVG wave hand-off, then a stack of section components. Match it. Do not
  invent a new page shell.
- `components/sections/AboutSection.tsx` — the homepage About band. Its copy-left / photo-collage
  composition is very close to what section 2 below needs. Read it before building anything new.
- `CLAUDE.md`, and the vendored Next docs at `node_modules/next/dist/docs/01-app/`. Next 16.2.11,
  Tailwind v4 configured in `app/globals.css` via `@theme` — **no `tailwind.config` file exists,
  do not create one.**

Do **not** delete `PagePlaceholder` — five other routes still use it.

---

## 1. The copy — this is the client's own text, treat it as source material

The owner supplied his current WordPress About page. The copy below is transcribed from it. Use
it. Do not rewrite it into marketing voice, do not expand it, do not add paragraphs.

### Hero

Eyebrow: **Fred's Plumbing** · H1: **About Fred's Plumbing**

> Fred's Plumbing is a trusted leader in multi-family and commercial emergency plumbing services
> across the DFW area. Family and employee owned for nearly 30 years, we operate 24/7, 365 days a
> year to keep properties running safely and efficiently. We are a one-stop shop offering a
> comprehensive suite of services, including traditional plumbing, drain and sewer solutions,
> hydrojetting, boilers, backflow prevention, and natural gas systems.

> Our licensed, credentialed team is experienced with all major vendor portals and property
> management requirements. Known for our professionalism, integrity, reliability, and strong
> safety culture, Fred's Plumbing is highly reviewed and trusted by property owners and managers
> throughout DFW.

### Section 2 — **Committed to Quality and Service Since 1996**

> Fred's Plumbing was founded in 1996 by Fredrick Lee Press, a master plumber who built his
> reputation on integrity, reliable craftsmanship, and doing the job right the first time. Fred
> passed away in 2023, but the values he instilled — hard work, honest service, and a genuine
> commitment to his customers — continue to guide everything we do. Over the years, our company
> has grown through those same principles, earning the trust of property managers and owners
> across the DFW Metroplex.

### Section 3 — **Evolving to Meet the Needs of a Growing Region**

> Over time, Fred's Plumbing became known for providing dependable solutions to multi-family and
> commercial properties throughout the Dallas–Fort Worth Metroplex. We developed expertise in
> complex plumbing systems, expanded our service offerings, and built long-lasting partnerships
> with property managers, facility owners, and residential communities.

> Today, our company continues to move forward with the same dedication that shaped our
> beginning. We embrace new technology, train our team to the highest standards, and work
> tirelessly to maintain the level of service that has defined us for nearly three decades. Our
> history reflects resilience, growth, and a commitment to excellence that guides everything we
> do.

*(The opening words of that first paragraph were obscured by an overlay in the source. "Over
time," is a reconstruction — flag it in your report so the owner can confirm the exact wording.)*

### Rules for handling this copy

- **Typography and grammar may be corrected. Claims may not be changed.** I have already
  normalised "multi family" → "multi-family", "Dallas Fort Worth" → "Dallas–Fort Worth" and
  "long lasting" → "long-lasting" above. Use proper en dashes and curly apostrophes. Do not turn
  "trusted leader" into anything stronger, do not add a number of jobs or customers, do not
  invent awards or certifications.
- **Fredrick Lee Press was a real person who died in 2023.** Reproduce that sentence as written.
  Do not embellish it, do not add biographical detail you do not have, do not add a photo of a
  person you cannot source, and do not set it in a decorative "memoriam" treatment. Plain,
  dignified prose in the same style as the rest of the page.
- **"Family and employee owned"** is a specific ownership claim from the client. Keep it verbatim.
- **"highly reviewed"** stays as prose. It must never become `AggregateRating` or `Review`
  structured data — see §5.

---

## 2. A factual conflict you must surface, not silently fix

The client's copy says **"nearly 30 years"** and **"nearly three decades"**. `data/site.ts` says:

```ts
foundedYear: 1996,
yearsInBusiness: "27+",
```

In 2026, 1996 is 30 years. `"27+"` is a hardcoded string that was correct when it was written and
has been quietly ageing ever since — and it now contradicts the client's own copy, which will
appear on the same page.

Do **not** just edit the string to `"30+"`; it will be wrong again next year. Derive it:
compute the display value from `foundedYear` at render time, keep `yearsInBusiness` in the type
and the Sanity schema as an optional manual override, and use the override only when it is set.

Then tell the owner in your report that the `siteSettings` singleton in Sanity also carries
`yearsInBusiness`, that Sanity wins at runtime over `data/site.ts` (see `sanity/lib/getSite.ts`),
and that he needs to clear or update that field in `/studio` for the change to show on the live
site. Do not attempt to write to the dataset yourself.

---

## 3. The page — five sections, no more

Server component, `async`, fetching in one `Promise.all` the way the Partners page does.

**1 — Hero.** Dark. `bg-navy-950`, grid overlay, radial washes, red rule + "Fred's Plumbing"
eyebrow, H1 "About Fred's Plumbing", the two intro paragraphs at a comfortable measure. Below
them a row of credential chips read from `site` — licence number, years in business (derived, per
§2), 24/7 · 365 dispatch, DFW Metroplex. The WordPress version centres this text over a building
photo; centring is fine, but keep the paragraph measure readable rather than full-bleed. Close
with the SVG wave if the next band is light.

**2 — Committed to Quality and Service Since 1996.** Light band. Copy left, photo composition
right — this is the founder/history section. `AboutSection.tsx` already implements this exact
composition; reuse or adapt it rather than writing a third variant. If it needs generalising to
take heading and paragraph props, generalise it carefully and confirm the homepage still renders
identically.

**3 — Evolving to Meet the Needs of a Growing Region.** Dark band (`navy-950`), copy left, a
single large photo right. Two paragraphs. Do not add a stat strip or icons here — the client's
version is plain prose and it reads well.

**4 — What we stand for.** A compact icon grid, four to six items, drawn **only** from qualities
already stated in the copy above: professionalism, integrity, reliability, a strong safety
culture, licensed and credentialed technicians, experience with major vendor portals and property
management requirements. Short label plus one line each. Do not invent a seventh value to fill
the grid, and do not restate the same claim twice in different words. `lucide-react` icons,
consistent with `WhyChooseUsSection` / `CareerValuesSection` — look at both before choosing.

**5 — Where to next.** Three link cards to the child routes that already exist — Partners
(`/about/partners`), Careers (`/about/careers`), Testimonials (`/about/testimonials`) — each with
one line of context, followed by the standard closing CTA band. `FinalCTASection` is the usual
closer; use it unless the quote form on it feels wrong directly under three link cards, in which
case use `ServiceFinalCtaSection`-style copy plus buttons. Say which you chose and why.

That is the whole page. Do not add a team-photos section, a timeline, a stats counter, or a
testimonial carousel — the owner asked for four to five sections and testimonials already have
their own page.

---

## 4. Images

**Do not download, hotlink, or copy any image from the client's WordPress site**, and do not
pull replacements from a stock library. Every photo slot on this page uses the existing
`ImagePlaceholder` component with a descriptive `label` naming the intended subject, exactly as
the service pages do, so the owner can drop real photos in through Sanity later.

Two of the three photo areas in the WordPress version are stock images of boilers and pipework;
the third is a real photo of a hydrojetting hose run at an apartment property. Say so in your
report — the real one is the kind of photo worth asking the owner for.

If you build any new photo slot with `<Image fill>`, remember the bug that hit
`ServiceHeroSection`: on a CSS grid item with `justify-self-*`, the width must go on the **grid
item itself** (as `HeroSection.tsx:137` and `FinalCTASection.tsx:73` do), not on an inner `div`,
or the container collapses to zero height the moment a real photo replaces the placeholder.

---

## 5. Sanity schema (build it, do not connect it)

Standing rule on this project: schemas get written now and populated later. Follow the existing
fetcher-plus-fallback pattern exactly.

- `sanity/schemas/aboutPage.ts` — a singleton with: hero eyebrow, heading, intro paragraphs
  (array of text); a story section (heading, paragraphs, two photo slots with alt text and
  `photoSubject` fallback strings); an evolution section (heading, paragraphs, one photo slot);
  a values array (icon name, label, description); and the closing links. Reuse `imageWithAlt`
  and the other helpers in `sanity/schemas/fields.ts` — do not hand-roll image fields. Register
  it in `sanity/schemas/index.ts` and add it to the Studio structure alongside the other
  singletons.
- `data/aboutPage.ts` — the typed fallback holding the copy in §1 verbatim, so the page renders
  identically against an empty dataset.
- `sanity/lib/getAboutPage.ts` — matching the other `get*.ts` fetchers: `sanityFetchOptions("aboutPage")`,
  fall back to static data **on a thrown error only**, never on a successful-but-empty result,
  and log through the existing `logFallback` / `logEmpty` helpers.
- Add the GROQ projection to `sanity/queries.ts`. The cache tag is the document `_type` string,
  `aboutPage` — confirm `/api/revalidate` needs no change.

Then run `npm run typegen` and `npm run check:drift`. Both clean; the regenerated
`sanity.types.ts` is committed with the change.

---

## 6. SEO and structured data

- Update the `metadata` export. The existing description is decent — tighten it if you like, keep
  `alternates.canonical: "/about"`.
- `BreadcrumbJsonLd`: Home → About Us. Matching how the Partners page calls it.
- You may add a `founder` property naming Fredrick Lee Press to the existing Organization node,
  and `foundingDate`. Nothing else about him — no `deathDate`, no invented `Person` detail.
- **No `AggregateRating`, no `review`, no `@type: "Review"` anywhere.** Self-serving review
  markup on your own business is ineligible for rich results and risks a manual action. This
  holds across the whole site regardless of what the visible copy says.
- No `PostalAddress` — `streetAddress` is unset in `data/site.ts` and there is no business
  address. Do not invent one. DFW is a service area, model it as `areaServed` if at all.
- `/about` is already in `app/sitemap.ts`. Confirm; do not duplicate.

---

## 7. Do not

- Do not touch `sanity/lib/getGoogleReviews.ts` or its 86400 cache — billed API.
- Do not delete `PagePlaceholder`.
- Do not change the homepage `AboutSection` rendering if you generalise it — verify pixel-for-pixel.
- Do not restructure navigation; `/about` is already in the header and footer.
- Do not add an accessibility-widget floating button. The blue circles in the client's screenshot
  are a third-party WordPress plugin. This site handles accessibility in the markup instead.
- Do not put real credentials in `.env.example`.

---

## 8. Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean.
2. `npm run typegen` and `npm run check:drift` clean.
3. `npm run dev` → `/about` renders with no console errors or warnings, at 375px, 768px, 1024px
   and 1440px. Nothing overlaps or clips; the mobile call bar does not cover anything.
4. The homepage still renders identically — screenshot before and after if you touched
   `AboutSection.tsx`.
5. `/about/careers`, `/about/partners` and `/about/testimonials` all still load, and the three
   link cards reach them.
6. Every heading level is sequential — one `h1`, then `h2`s. Tab through the page; focus ring
   visible on every link.
7. `/studio` loads and About Page appears as a singleton with all fields.
8. One commit.

## 9. Report back

- Whether the derived years-in-business value now reads correctly, and confirm the owner must
  update or clear `yearsInBusiness` in the Sanity `siteSettings` singleton.
- What you did with `AboutSection.tsx` — reused, generalised, or left alone.
- Which closing CTA you chose for section 5 and why.
- The exact wording you used for the obscured opening of the Evolving paragraph, so the owner can
  correct it.
- Anything in the client's copy you thought was a claim risk and left alone anyway.
