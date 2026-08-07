# Claude Code prompt — build the Privacy Policy and Terms of Service pages

## Goal

Two new pages, both text-only, both matching the client's existing WordPress copy **word for
word**:

- `/privacy-policy` — "Privacy Policy For Fred's Plumbing Service"
- `/terms-of-service` — "Terms Of Service For Fred's Plumbing Service"

Then link both from the footer.

The owner's instruction is explicit: **the content must be the same, with nothing added.** No
extra clauses, no invented sections, no "Effective date" line the client didn't write, no
GDPR/CCPA boilerplate, no cookie banner, no email address that isn't in the source. The full
verbatim copy is transcribed at the bottom of this prompt — use it exactly and do not
improve it.

What *should* be new is the **presentation**. These are long walls of text; the client's
WordPress version is a plain stack of headings and paragraphs and reads like a document
dump. Make ours genuinely nice to read (design spec below) while the words stay identical.

## Route naming

Use `/privacy-policy` and `/terms-of-service` — these match the client's current WordPress
URLs, so any existing inbound link or Google-indexed URL keeps working. Do not shorten to
`/terms` or `/privacy`.

## Architecture

Follow the established playbook. Both pages are Sanity-editable from day one — the owner
must be able to fix a sentence in a legal document without a deploy.

1. **`legalPage` document type**, used for both pages (one schema, two documents), keyed by
   a `slug` field restricted to `privacy-policy` and `terms-of-service` so it can't sprawl
   into a general page builder. Fields:
   - `title` (the H1)
   - `intro` — the paragraph(s) under the H1 in the banner. Privacy has two paragraphs,
     Terms has one, so make this an array of plain strings rather than a single text field.
   - `eyebrow` (defaults to "FRED'S PLUMBING", as both reference pages show)
   - `bannerPhoto` (`imageWithAlt`) + `darkOverlay` — same banner treatment as every other
     page hero, so the background image is owner-editable like the rest of the site
   - `body` — **Portable Text**, restricted to exactly what these documents need: `h2`,
     `normal`, bullet list, and `strong`/`link` marks. No images, no custom blocks, no `h1`
     (the title owns that), no `h3` (neither document nests that deep). Keeping the block
     list tight is what stops a legal page turning into a freeform page builder.
   - `seoTitle`, `seoDescription`
   - `lastUpdated` (date, **optional**) — see the note below before you wire it up.
2. **Do not** put these on the shared `sectionsField()` stack. Every other page is a section
   stack because those pages are marketing layouts; a legal document is one continuous prose
   run, and Portable Text is the correct shape. Say so in your report rather than forcing
   consistency where it doesn't fit. The banner is the only shared-looking part and it lives
   in dedicated fields.
3. `data/legalPages.ts` — static fallback carrying the full verbatim copy of **both**
   documents, so the pages render correctly before Sanity is seeded and if a fetch throws.
   Same convention as everywhere else: thrown error → fall back and log loudly; successful
   but empty → stay empty.
4. `sanity/lib/getLegalPage.ts` — fetch by slug, cache tag `legalPage`. Confirm
   `/api/revalidate` needs no change (it revalidates `body._type` with no allowlist, so
   `legalPage` is already covered) and say so.
5. `app/(site)/privacy-policy/page.tsx` and `app/(site)/terms-of-service/page.tsx` — thin
   routes over one shared `LegalPageLayout` component. Two routes, one layout, no duplicated
   markup.
6. Studio structure: a **"Legal Pages"** group in the sidebar containing the two documents,
   named "Privacy Policy" and "Terms of Service". Place it at the bottom, below Contact
   Page. Do not let them appear as a free "create new" collection — the owner should see
   exactly two documents and no "+" button.

### On `lastUpdated`

Neither reference page shows a date, so **do not render one by default**. Add the field,
leave it empty, and have the layout render the line only when it is set. Mention in your
report that the owner can fill it in if he wants one — that keeps his "nothing extra"
instruction intact while leaving the door open. Do not auto-populate it from `_updatedAt`.

## Design spec — making a wall of text look good

The client's page is a flat run of `h2` + horizontal rule + paragraphs. Keep that bone
structure (it's correct for legal text) and improve the craft:

- **Banner** identical in treatment to the other page banners — dark building photo,
  overlay, red eyebrow rule, large heading, intro paragraph(s) constrained to a readable
  measure and centred. Reuse the existing banner component; do not build a third one.
- **Measure.** Body text capped around 68–72ch. On the client's version the paragraphs run
  the full container width, which is the single biggest reason it reads badly.
- **Two-column on desktop (`lg` and up):** a sticky table of contents in a narrow left
  column, the prose in the main column. The TOC is generated **from the `h2` blocks in
  Portable Text** — it is navigation derived from the content, not new content, so it does
  not violate "nothing extra". Active-section highlighting via `IntersectionObserver`, with
  a `prefers-reduced-motion` guard on the smooth scroll. Below `lg` the TOC collapses into a
  `<details>` "On this page" disclosure, closed by default, or is omitted — your call, say
  which.
- **Anchored headings.** Each `h2` gets a slugified, stable `id` derived from its text so
  `/terms-of-service#payments-and-billing` works and the TOC can link to it. Add
  `scroll-margin-top` matching the sticky header height so anchors don't land under the nav.
- **Section rhythm.** Keep the thin rule above each `h2` as in the reference, but give it
  real breathing room — generous top margin, tighter gap between the heading and its first
  paragraph. Number the sections in the TOC only, not in the headings themselves (the
  headings are client copy).
- **Lists.** The Privacy Policy is heavy with bullets. Style them properly — custom marker,
  comfortable line height, indent that lines up with the prose measure. Do not let them
  inherit browser defaults.
- **The contact block at the end of each document** ("Fred's Plumbing Service / Phone / 
  Website") renders as a bordered card rather than loose lines — it's the one part of the
  page a visitor actually acts on. Make the phone number a real `tel:` link. **Do not add an
  email address** to it; neither source page has one there.
- **Cross-link at the very bottom**: a single quiet line linking each document to the other
  ("See also: Privacy Policy"). This is navigation, not content, and it stops each page
  being a dead end. If you'd rather leave it out to honour "nothing extra" strictly, say so
  and leave it out — but the footer links must exist regardless.
- Dark theme consistent with the rest of the site; check text contrast hits WCAG AA at the
  body size you choose.
- Print stylesheet: hide the nav, TOC and footer, force readable black-on-white. People
  genuinely print these. Cheap to add, worth it.

## Footer links

The reference footer's bottom bar reads:

> Copyright © 2026 Fred's Plumbing | All Rights Reserved. | Privacy Policy | Terms of Service

- Add both links to the footer's copyright bar in that same position and order.
- **First check whether the footer already has these links** pointing at routes that don't
  exist yet — if there are dead `/privacy-policy` or `/terms` hrefs in there, they get wired
  up rather than duplicated. Report what you found.
- Also check the footer's "Quick Links" column — do **not** add them there as well; one
  place only.
- The copyright year should come from the existing site config / a computed year, not be
  hardcoded to 2026, if it isn't already. Note what it does today.

## SEO

- Real `metadata` on both routes: title, description, canonical.
- Both pages **stay indexable** (`index, follow`) — no `noindex`. They're normal legal
  pages.
- Add both to `sitemap.xml` if the site generates one, at a low priority.
- **No structured data of any kind on these pages.**

## Copy fidelity — read this carefully

The transcription below came from screenshots of the client's live WordPress pages. Treat it
the way you'd treat contract text:

- **Reproduce it verbatim.** Do not fix grammar, do not add serial commas, do not hyphenate
  "multi family" → "multi-family", do not change "error free" or "follow up" or "third
  party". Several of these read as missing hyphens and it is tempting to fix them. Don't.
  Legal text is the one place where the standing "typography may be fixed" allowance does
  **not** apply.
- Instead, **collect every change you would have made into a list in your report**, so the
  owner can approve them in one pass and I can hand them to the client.
- **One sentence is partially obscured** in the source screenshot by a floating
  accessibility widget — in Privacy Policy → Data Security. My reading of it is:

  > "While no online transmission can be guaranteed completely secure, we use industry
  > standard practices to safeguard the information we collect."

  The words hidden behind the widget are approximately "can be guaranteed". Use my reading,
  but **flag it prominently in your report** as needing the owner's confirmation against the
  live page before this goes to production. Do not quietly assume it's right.
- The contact blocks say `Website: fredsplumbingservices.com`. Note that `data/site.ts`
  currently carries a different domain (`fredsplumbingdfw.com`) and the footer shows
  `contact@fredsplumbing.com`. **Render the legal pages' text exactly as written** — do not
  "harmonise" it with site config — but flag the three-way domain inconsistency in your
  report. It's a pre-existing issue and the owner decides.
- Phone renders as `(972) 564 9081` in the source. Keep that display format on these pages
  even though the rest of the site uses `972-564-9081`; make the `tel:` href
  `tel:+19725649081` regardless.

## Seed script

`scripts/seed-legal-pages.ts`, same safety spec as every other seeder:

- dry-run by default, `--confirm` to write
- patches published **and** draft
- creates both documents if absent; **refuses to overwrite a document that already has a
  non-empty `body`** — legal text the owner has edited must never be clobbered
- never deletes a document or asset
- prints the stale-Studio-tab warning in its output

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, `npm run typegen`, `check:drift` — all clean;
   regenerated `sanity.types.ts` committed. **No verification scaffolding left in `app/`** —
   a previous task shipped a broken harness route and failed the Vercel build.
2. Both pages render on the fallback path with the full verbatim copy before any seeding.
3. **Diff the rendered text against the transcription below, character by character**, and
   state in your report that you did. This is the single most important check in this task.
4. 375 / 768 / 1024 / 1440. The TOC behaves correctly at every width; nothing overflows; no
   console warnings.
5. Every `h2` anchor resolves and lands clear of the sticky header.
6. Footer links work from every page; no duplicate links.
7. Keyboard: TOC links are focusable with a visible focus ring and reach every section.
8. One commit; nothing uncommitted left behind.

## Report

The verbatim-diff confirmation; the obscured Data Security sentence flagged for owner
confirmation; the list of grammar/hyphenation fixes you deliberately did **not** make; what
the footer already contained before you touched it; the mobile TOC choice; whether you
included the cross-link line; the domain inconsistency note; the dry-run plan and the
confirm command; and the stale-tab reminder.

---

# VERBATIM COPY — transcribe exactly

## Page 1 — `/terms-of-service`

**Eyebrow:** FRED'S PLUMBING

**H1:** Terms Of Service For Fred's Plumbing Service

**Intro paragraph:**

> Welcome to the Fred's Plumbing Service website. By accessing or using this website, you
> agree to comply with and be bound by the following Terms of Service. Please read these
> terms carefully before using our website or requesting services.

**Body eyebrow (above the first heading):** FRED'S PLUMBING

### Use of Website

This website is intended to provide information about Fred's Plumbing Service and the
plumbing services we offer throughout the Dallas Fort Worth Metroplex.

You agree to use this website only for lawful purposes and in a manner that does not
interfere with the operation, security, or accessibility of the website.

### Service Requests and Estimates

Submitting a contact form or requesting an estimate through this website does not guarantee
service availability or create a binding agreement. All services are subject to scheduling,
property evaluation, and final approval by Fred's Plumbing Service.

Pricing estimates may vary depending on the scope of work, accessibility, materials
required, and unforeseen conditions discovered during service.

### Emergency Services

Fred's Plumbing Service offers emergency plumbing support; however, response times may vary
depending on technician availability, weather conditions, traffic, and service demand.

We make every reasonable effort to respond quickly and provide reliable emergency
assistance.

### Payments and Billing

Payment terms for plumbing services will be discussed and agreed upon before work begins
whenever possible. Failure to submit payment according to agreed terms may result in delayed
future services or additional collection efforts.

For commercial and multi family clients, invoicing terms may vary based on vendor agreements
or approved billing arrangements.

### Website Content

All content on this website, including text, graphics, logos, images, and design elements,
is the property of Fred's Plumbing Service unless otherwise stated.

You may not copy, reproduce, distribute, or use website content without written permission
from Fred's Plumbing Service.

### Limitation of Liability

Fred's Plumbing Service strives to keep website information accurate and up to date;
however, we do not guarantee that all information is complete, accurate, or error free at
all times.

Fred's Plumbing Service shall not be held liable for any direct, indirect, incidental, or
consequential damages resulting from the use of this website or reliance on its content.

### Third Party Links

This website may contain links to third party websites or vendor platforms. Fred's Plumbing
Service is not responsible for the content, policies, or practices of third party websites.

### Privacy

Your use of this website is also governed by our Privacy Policy. By using this website, you
consent to the collection and use of information as described in the Privacy Policy.

> Note: link the words "Privacy Policy" in this paragraph to `/privacy-policy`. That is a
> link on existing words, not added content.

### Changes to Terms

Fred's Plumbing Service reserves the right to update or modify these Terms of Service at any
time without prior notice. Continued use of the website after changes are posted constitutes
acceptance of the updated terms.

### Governing Law

These Terms of Service shall be governed by and interpreted in accordance with the laws of
the State of Texas.

### Contact Information

If you have questions regarding these Terms of Service, please contact:

**Fred's Plumbing Service**
Phone: (972) 564 9081
Website: fredsplumbingservices.com

---

## Page 2 — `/privacy-policy`

**Eyebrow:** FRED'S PLUMBING

**H1:** Privacy Policy For Fred's Plumbing Service

**Intro paragraph 1:**

> Fred's Plumbing Service respects your privacy and is committed to protecting the personal
> information you provide through our website and communication channels.

**Intro paragraph 2:**

> This Privacy Policy explains how we collect, use, and safeguard your information when you
> interact with our company online or offline. By using our website, you agree to the
> practices described in this policy.

**Body eyebrow:** FRED'S PLUMBING

### Information We Collect

We may collect personal information that you voluntarily provide when you:

- Fill out a contact or service request form
- Call or email our office
- Request an estimate or emergency service
- Apply for employment opportunities
- Sign up for updates or communications

The information we collect may include:

- Name
- Phone number
- Email address
- Property or service address
- Company or property management information
- Details related to your plumbing service request

We may also collect limited technical information automatically through website analytics
tools, including:

- IP address
- Browser type
- Device information
- Pages visited on our website
- Time spent on the site

### How We Use Your Information

Fred's Plumbing Service uses collected information to:

- Respond to inquiries and service requests
- Schedule plumbing services and appointments
- Provide estimates and customer support
- Improve website performance and user experience
- Communicate important updates or service information
- Maintain internal business records
- Support hiring and employment processes

We do not sell or rent your personal information to third parties.

### Communication and Marketing

We may contact you regarding your inquiry, service appointment, or follow up communication
related to our services. If you choose to receive marketing communications, you may opt out
at any time by contacting our office.

### Information Sharing

We may share information with trusted service providers or business partners only when
necessary to operate our business or complete requested services. These parties are required
to maintain confidentiality and protect your information.

We may also disclose information when required by law or when necessary to protect our legal
rights, property, or safety.

### Data Security

Fred's Plumbing Service takes reasonable precautions to protect your personal information
from unauthorized access, misuse, or disclosure. While no online transmission can be
guaranteed completely secure, we use industry standard practices to safeguard the
information we collect.

> **FLAG THIS ONE.** The middle of this sentence was hidden behind a floating accessibility
> widget in the source screenshot. "can be guaranteed" is my reconstruction. Confirm against
> the live page before production.

### Cookies and Website Analytics

Our website may use cookies and analytics tools to improve functionality and understand how
visitors use the site. These technologies help us improve user experience and website
performance.

You may choose to disable cookies through your browser settings at any time.

### Third Party Links

Our website may contain links to third party websites or vendor platforms. Fred's Plumbing
Service is not responsible for the privacy practices or content of external websites.

### Children's Privacy

Our website and services are not directed toward children under the age of 13. We do not
knowingly collect personal information from children.

### Updates to This Privacy Policy

Fred's Plumbing Service may update this Privacy Policy periodically. Any changes will be
posted on this page with the updated effective date.

### Contact Us

If you have questions about this Privacy Policy or how your information is handled, please
contact us:

**Fred's Plumbing Service**
Phone: (972) 564 9081
Website: fredsplumbingservices.com
