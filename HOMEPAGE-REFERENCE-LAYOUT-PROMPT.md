# Claude Code prompt — reorganize the homepage to the client's reference, hero with background image, badges as a real section

## What this is

The owner's client has an old WordPress homepage; the new homepage should follow **its
section order and copy** (transcribed below), stay fully editable through the existing
`homePage` section stack, gain an **editable background image on the hero**, and get the
**certification badge strip as a proper library section** instead of a template-only band.
The homepage is already a section stack — this task is: adjust/extend section types where
needed, rewrite the default stack + copy, and migrate the published document safely.

Transcription caveat: from a small screenshot; typography fixes only, flag any sentence you
doubt. Claims verbatim — do not upgrade "trusted"/"verified" wording.

## The target page, top to bottom

1. **Hero — background photo, copy left, emergency form right.** The current `HeroSection`
   already carries the `EmergencyContactForm` on the right; keep that. Add: an editable
   background image (`imageWithAlt`, hotspot crop, dark-overlay toggle like the other
   heroes; navy wash when unset). Copy:
   - H1: `Expert Plumbing Services in the Dallas–Fort Worth Metroplex`
   - > Fred's Plumbing provides 24/7 plumbing and specialty services for multi-family and
     > commercial buildings throughout the Dallas–Fort Worth Metroplex. From emergency
     > repairs to large-scale installations, our licensed team delivers fast, efficient, and
     > long-lasting results for apartments, condos, assisted living facilities, and more.
     *(one clause was hard to read — flag it)*
   - CTA: `Our Services` → `/services`. Form heading: `Emergency? Contact Us 24/7`.
2. **Red emergency banner** (`EmergencySection` restyled to the reference's red band if it
   isn't already close): heading `24/7 Emergency Plumbing Services in Dallas & Fort Worth`,
   body:
   > Plumbing problems don't wait, and neither do we. Fred's Plumbing offers around-the-clock
   > emergency plumbing services across the Dallas–Fort Worth Metroplex.
   plus the `Give Us a Call! 972-564-9081` phone card (phone from `site`, never hardcoded)
   and a photo slot.
3. **Heritage band** — photos left, copy right, `Learn More` → `/about`:
   heading `Trusted Commercial Plumbers Serving the DFW Metroplex Since 1996`, paragraphs:
   > Founded in 1996, Fred's Plumbing has proudly served the Dallas–Fort Worth Metroplex
   > (DFW) with a long-standing reputation for professionalism, reliability, and
   > high-quality workmanship. Our team specializes in providing commercial and multi-family
   > plumbing services for property management companies, facility owners, and real estate
   > investors across Dallas, Fort Worth, and surrounding North Texas communities.

   > From large-scale installations to ongoing maintenance and emergency repairs, we deliver
   > efficient, safety-focused solutions that minimize downtime and protect your investment.
   > Every project we complete reflects our dedication to precision, code compliance, and
   > lasting performance, making Fred's Plumbing one of the most trusted names in DFW
   > commercial plumbing for nearly three decades.
4. **Certification badge strip — the new section type.** Promote `AssociationBadgeStrip`
   into the shared library as a `badgeStrip` section: optional heading, `hidden` toggle,
   logos still **collection-driven** from the Trust Logos association/credential categories
   (one place to manage badges — that stays; the section is just where the strip appears).
   Service/city page templates keep rendering it automatically — audit that a page using
   both the template render AND a stack instance doesn't show it twice; note the rule you
   implement. This answers the owner's "badges are hardcoded on most pages" — placement
   becomes a section he controls; the badge images were already Studio-managed.
5. **Services grid** — heading `Reliable Plumbing Services in Dallas & Fort Worth`, the
   existing services section (with the new balanced-row fix; cards from the services
   collection as today). The reference's five short card blurbs are the service documents'
   own summaries — compare and report differences; do not overwrite service documents.
6. **Vendor compliance band** (`ComplianceSection`): heading
   `Fully Compliant and Approved Across Leading Vendor Systems`, body:
   > Property managers throughout the Dallas–Fort Worth Metroplex trust Fred's Plumbing
   > because we are verified and active within the platforms they use every day. Our team
   > maintains complete vendor compliance with background checks, insurance verification,
   > safety certifications, and documentation updates so you can schedule and manage service
   > with confidence.
   with the `Trusted by Property Management Networks:` line above the vendor logo strip
   (vendor categories only, as wired).
7. **Property types band** (dark; the industries section returns to the homepage): heading
   `Plumbing Solutions Tailored to Multi-Family and Commercial Needs`, intro:
   > Our team understands the challenges of multi-family and commercial maintenance,
   > providing fast, professional service that minimizes downtime and keeps your operations
   > running smoothly.
   `Contact Us` CTA, photo slot, and the five property-type cards (Apartments, Condos,
   Senior Care Facilities, Student Housing, Commercial Plumbing) — these come from the
   industries collection; compare the reference blurbs against the industry documents and
   report differences without overwriting them. Balanced rows for any count.
8. **Reviews** — existing testimonials strip, unchanged.
9. **Closing CTA with form** — heading
   `Schedule Plumbing Service in Dallas–Fort Worth Today!` with the existing quote form
   (`FinalCTASection`); form fields unchanged, leads keep flowing to `/api/contact`.

Sections currently in the default stack but absent from the reference (about band, why
choose us, process, case study, service area, FAQ, map band position — check the list)
**leave the default stack but stay in the library** for re-adding in Studio. The map band's
placement rule (before the closing CTA) may keep it — decide against the reference and say
what you chose.

## Mechanics

- Default stack + copy: `data/homePage.ts` rewritten to the order/copy above.
- **Migration script** (playbook: dry-run/confirm, published + draft, stale-tab warning):
  the live `homePage` document has real content including uploaded photos. Map existing
  section items onto the new stack where types match, **preserving every uploaded image
  asset ref**; new/changed copy fields update to the reference text; removed sections are
  listed in the dry run before anything is written. Refuse rather than guess on conflicts.
- Hero schema gains the background image + overlay toggle; typegen + `check:drift` clean.
- No changes to service/industry/testimonial documents; no review markup; phone/email from
  `site` everywhere.

## Verify

1. `npx tsc --noEmit`, lint, build, typegen, `check:drift` — clean.
2. Fallback path renders the nine bands in order with the transcribed copy (diff it);
   375/768/1024/1440; hero form and closing form both submit to `/api/contact` (network
   tab); phone card links `tel:`.
3. Dry run prints the full mapping (kept images listed explicitly). After the owner's
   confirm: Studio shows the new order; his previously uploaded homepage photos still
   present on the matching bands.
4. Badge strip: renders on the homepage stack; service pages unchanged; no page shows it
   twice.
5. One commit.

## Report

Transcription doubts; the section-type mapping and what left the default stack; the
double-render rule for the badge strip; differences between reference card blurbs and the
service/industry documents (owner decides); the dry-run plan + confirm command + stale-tab
reminder.
