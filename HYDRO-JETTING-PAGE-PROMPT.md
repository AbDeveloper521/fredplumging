# Claude Code prompt — build the Hydro Jetting page

## Goal

A dedicated Hydro Jetting page, built on the same section stack as the existing service pages
and fully editable in Sanity. The client has singled this one out as the most important page in
the new Commercial section, so it gets real depth — but it still follows the existing service
template rather than a bespoke layout.

## Step 0 — the URL

**The page lives under Services: `/services/hydro-jetting`.** It is a service, it belongs in the
Services collection, and it is built exactly like every other `/services/[slug]` page — same
document type, same section stack, same template. Do **not** create it under `/commercial/`.

**Audit first and report before creating anything.** Check whether a hydro jetting service
document already exists — jetting already appears in service lists and in the Multi-Family FAQ,
so there may be one already.

- **If a service document already exists:** do **not** create a second one. Expand the existing
  document with the content below, keeping its current slug.
- **If none exists:** create a new service document with slug `hydro-jetting`.

Either way there must be exactly **one** hydro jetting page on the site. The Commercial dropdown
will simply link to `/services/hydro-jetting` — a nav item pointing at an existing page, not a
duplicate page. Two pages on the same topic compete with each other in search and split their own
ranking.

If you find an existing document at a slug the owner might want changed, **say so and stop** — a
slug change needs a redirect and is his decision, not yours.

## Structure

This **is** a service page, so it uses the existing service page template as-is — the same
document type, the same section stack from the shared library, in the same order. Report the
stack. Eight bands. No new section types, no page-specific route, no bespoke layout.

**Do not visit, fetch, or scrape the competitor's site.** All copy is below and is original. The
competitor page was used for topic coverage only — which questions to answer — and none of their
phrasing appears here or should appear in what you build.

## Claims discipline

- **No equipment specifications.** Do not state PSI, GPM, hose lengths or nozzle types — nobody
  has confirmed what Fred's rig actually is. Flag in your report that the owner can add these
  later if he wants them.
- **No pricing**, no response times, no warranty or maintenance-plan terms. The competitor page
  advertises discounted rates and extended warranties; those are their offers, not Fred's.
- No "certified" technicians — licensed is what's verified (RMP 44890).
- Reviews render verbatim from existing testimonials. **Never** edit a customer's words. **No**
  `AggregateRating` or `Review` structured data, and **no** `FAQPage` JSON-LD (consistent with
  the Multi-Family FAQ decision).
- One item to flag for client confirmation: the "recurring/scheduled jetting" line in band 5.
  That's a service commitment — confirm Fred actually offers scheduled service before it ships.

---

# The copy

## 1. Banner hero

**H1:** Hydro Jetting in the Dallas–Fort Worth Metroplex

**Intro:** High-pressure water jetting clears grease, sludge, scale and roots out of commercial
drain and sewer lines — and scours the pipe wall clean instead of punching a hole through the
blockage. Fred's Plumbing jets lines for commercial and multi-family properties across DFW.

## 2. What hydro jetting actually does — photo + copy band

Use the collage band the service pages use. (The small overlapping photo is optional and must
not render a placeholder when empty.)

**Heading:** What hydro jetting actually does

> A cable machine bores a hole through a clog. Water gets moving again, the line drains, and the
> call is closed — but the grease, sludge and scale coating the pipe wall are still there, and
> the line closes back up.
>
> Hydro jetting works differently. A high-pressure hose with a specialised nozzle is fed into the
> line, and jets of water scour the full inside diameter of the pipe back to bare wall. Grease
> liquefies, sludge and sediment flush downstream, scale and root intrusion break up. The line is
> left at its original capacity rather than at the width of a cable.
>
> It's water only. No chemicals go into your building's drains or the municipal system.

## 3. What we jet — cards

Use the icon-card / services grid type with balanced rows. **Six cards:**

| Title | Copy |
| --- | --- |
| Kitchen & grease lines | Restaurant, cafeteria and break-room lines, where grease builds up fastest. |
| Main sewer lines | Full-diameter cleaning of building mains and laterals. |
| Branch & floor drains | Interior lines that back up into occupied space. |
| Storm drains & catch basins | Site drainage that silts up between storms. |
| Trench & culvert lines | Larger-diameter site and drainage lines. |
| Roots & scale | Root intrusion at joints and mineral scale in older cast iron. |

**Heading:** What we jet

## 4. Jetting vs. cable snaking

**Heading:** Jetting vs. cable snaking

**Intro:** Both have their place. The difference matters when a line keeps backing up.

- A cable punches through a blockage. Jetting removes it and cleans the pipe wall.
- Grease re-coats and re-clogs quickly after cabling. Jetting liquefies and flushes it out.
- Jetting cleans the full pipe diameter, restoring the line's original flow capacity.
- Jetting breaks up sediment, sand and scale that a cable slides straight past.
- Water only — no chemicals.
- Cabling is still the right call for some jobs. We'll tell you which one you actually need.

That last line stays in. It's the most credible sentence on the page.

## 5. How we approach a jetting job

**Heading:** How we approach a jetting job

- **Camera first.** We inspect the line before jetting it, so we know what's in there and whether
  the pipe can take it.
- **The right nozzle and pressure.** Both are matched to pipe size, pipe material and what's
  actually blocking the line.
- **Scheduled around your operations.** After-hours and weekend work for occupied buildings.
- **Camera again afterwards.** So you can see the line is clean, not just flowing.
- **Scheduled service where it makes sense.** Kitchen lines on a regular cycle cost less over a
  year than emergency call-outs. ← *flag this one for client confirmation*

## 6. Reviews band

Reuse the existing testimonial section exactly as the other service pages use it.

## 7. FAQ band

Use the `faqBand` type in **shared set** mode, referencing a **new** `faqSet` document:

- Internal title: **Hydro Jetting FAQs**
- Public heading: **Frequently Asked Questions**

Do not add these to the Multi-Family or Commercial sets, and do not inline them.

**How much does hydro jetting cost?**

Cost depends on the length and diameter of the line, how accessible the cleanout is, what's
blocking it, and whether the work runs during business hours or after-hours. We camera the line
first and give you a firm price before any work starts.

**How often should commercial lines be jetted?**

It depends on the line. Restaurant kitchen lines often need it quarterly or twice a year, because
grease accumulates fast. A building main in an office or retail property may go years between
cleanings. If a line has backed up more than once in twelve months, that's usually a sign it
needs jetting rather than another cabling.

**Is hydro jetting safe for older pipes?**

Usually — but not always, which is exactly why we camera the line first. Sound cast iron, clay,
PVC and ductile lines handle jetting well at the right pressure. A pipe that's already cracked,
badly corroded, or has collapsed sections needs a different approach, and we'd far rather find
that on camera than with a jetter. If your line isn't a candidate, we'll tell you and explain
what is.

**Will jetting damage my pipes?**

Not when it's done properly. Pressure and nozzle are matched to the pipe's size and material,
which is what the camera inspection is for. The risk with jetting isn't the tool — it's using it
blind on a line that was already failing.

**What's the difference between hydro jetting and snaking?**

A cable bores a channel through a blockage so the line drains again. Hydro jetting scours the
full diameter of the pipe, removing the grease and buildup that caused the blockage in the first
place. Snaking is faster and cheaper for a simple obstruction; jetting is what you want when a
line keeps backing up or has years of grease in it.

## 8. Closing CTA

Whatever CTA band the service pages already end with. Phone and contact link from config.

---

## Navigation

**Do not add any nav link yourself.** The owner adds them in Studio. Give him the exact values in
your report:

- Under **Services**: child title `Hydro Jetting`, href `/services/hydro-jetting`
- Under **Commercial**: child title `Hydro Jetting`, href `/services/hydro-jetting` — the **same**
  URL. One page, reachable from two menus. That is correct and intentional; it is not a
  duplicate.

## Seeding

`scripts/seed-hydro-jetting-page.ts` — same safety spec as every other seeder: dry-run by
default, `--confirm` to write, patches published **and** draft, refuses on a non-empty
`sections[]` (or clearly handles the case where you're expanding an existing service document —
say which), never deletes a document or asset, prints the stale-Studio-tab warning. Creates the
`Hydro Jetting FAQs` set if absent; refuses to overwrite one that already has items.

The `data/` services fallback carries the same stack so the page renders before seeding.

## SEO

Real `metadata` — title, description, canonical. Indexable. Add to `sitemap.xml`. No structured
data of any kind.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean;
   regenerated types committed. **No verification scaffolding left in `app/`.**
2. The page renders the full stack on the fallback path before seeding.
3. 375 / 768 / 1024 / 1440; the six cards balance correctly (3+3) at every width.
4. **Confirm exactly one hydro jetting page exists on the site, at `/services/hydro-jetting`** —
   grep the routes and the sitemap, and confirm no `/commercial/hydro-jetting` route was created.
   This is the check that matters most.
5. The page appears correctly in the `/services` index grid alongside the other services, and the
   balanced-row layout still works with the service count changed by one.
5. FAQ reads from the referenced set; typegen shows a resolved `faqSet`, not a `_ref`.
6. Every other page unchanged, including the other two FAQ sets.
7. One commit; nothing uncommitted left behind.

## Report

Whether a hydro jetting service document already existed or you created one; confirmation the
page is at `/services/hydro-jetting` and that **no** `/commercial/` route was created; the
service-page stack used; the "scheduled service" line
flagged for client confirmation; a note that equipment specs (PSI/GPM) were deliberately omitted
and can be added if the owner supplies them; the dry-run plan, the confirm command, the stale-tab
reminder, and the exact nav values for the owner to type.
