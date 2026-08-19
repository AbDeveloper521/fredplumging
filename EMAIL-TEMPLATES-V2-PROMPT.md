# Claude Code prompt — two email templates: redesigned business notification + new customer confirmation

## What changed

The client now wants **both** emails:

1. **Business notification** — redesigned to match the new visual language (below).
2. **Customer confirmation** — new. The person who filled in the form gets an email showing what
   they submitted.

The owner supplied a design mockup for the customer email. Build to that visual language, but
read the section on "same look, different jobs" before cloning it for the business email.

This builds on the existing `lib/leadDelivery.ts` and the React Email setup already shipped. Do
not rewrite that plumbing — extend it. Do not touch the form fields, validation schemas, honeypot
or timing logic.

## ⚠️ Claims in the mockup that need resolving first

The mockup contains two statements that are not yet approved facts. **Report on both before
building, and do not ship either until the owner confirms.**

**1. "Typical response: within one business hour during business hours."**

This is the response-time commitment that has been an open question across this entire project —
it was deliberately left out of the Multi-Family FAQ and the emergency band for exactly this
reason. If the client has now approved this figure, that's excellent news and it should be used
**consistently everywhere** (FAQ, emergency band, contact page), not just in one email. If he has
not approved it, the line comes out of the template.

Ask the owner which it is. Build the template so the line renders from a single config value that
can be set or left empty — if empty, the "What happens next" block renders without it and still
reads correctly.

**2. "30+ years in DFW"**

`data/site.ts` has `foundedYear: 1996`, which does make 2026 the thirtieth year — so this is
consistent. But **compute it from `foundedYear`**, never hardcode "30+", or it silently goes stale.
Also flag again that a hero chip elsewhere on the site still says "Serving DFW Since 1993", which
contradicts it. One value should drive all of them.

Everything else in the mockup checks out: `RMP 44890` is correct, `972-564-9081` is correct,
`contact@fredsplumbing.com` is correct, and "24/7 dispatch" is already claimed site-wide.

Minor: "A coordinator contacts you" implies a staffed role. If that's not how they operate,
"Someone from our team contacts you" is safer. Owner's call — flag it.

## Same look, different jobs

Both emails share one visual system, but they are not the same email with different words:

**Customer confirmation** — the job is reassurance. They just handed over their details and want
to know it landed. Follow the mockup closely: confirmation tick, "what you sent" summary, what
happens next, and the emergency phone number prominently, because someone with an active leak
should be calling rather than waiting.

**Business notification** — the job is **triage speed**. Fred is reading this on a phone, possibly
under a sink. He does not need a reassuring tick or a "what happens next" panel. He needs: who,
where, what, how urgent, and one tap to call them. The existing notification already does this
well — restyle it into the new visual language, but **do not** add the customer-facing reassurance
blocks to it. If you find yourself copying the "What happens next" panel into the business email,
stop.

Keep `replyTo` on the business email set to the customer's address. That stays.

## Build it as a shared layout

Header, footer, colour tokens, buttons, the detail-row component and the info panel go in **shared
components** used by both templates. Two templates diverging in padding and red is exactly the
thing that makes a brand look sloppy six months later.

Colours already established: navy `#0B1727`, brand red `#D32127` (sampled from the logo). Reuse
those constants; don't re-sample or re-guess.

## The request reference number

The mockup shows `Request #FP-1048`. Build this properly or not at all — a decorative fake number
is worse than none:

- Generate a real reference per submission, and use **the same value in both emails** so the
  customer and Fred are talking about the same thing on the phone.
- It must be short, readable over the phone, and not guessable-sequential in a way that leaks how
  many leads they get. A short random suffix is better than an incrementing counter.
- Include it in the business email's subject line too.
- Log it alongside the `LEAD_DELIVERY_FAILED` payload so a failed send is still traceable.

## Sending rules

- The customer email only sends when a **valid email address** was submitted. Some forms may make
  email optional — check, and skip silently if absent.
- **Business email failing is fatal** (customer sees the error state with the phone number,
  payload logged) — unchanged from the current behaviour.
- **Customer email failing is non-fatal.** Log it and carry on; the lead is what matters. Never
  fail the visitor's submission because a courtesy email didn't send.
- Send the business email **first**. If it fails, don't send the customer a confirmation for a lead
  that nobody received.
- Guard against double-sends on retry or double-submit.
- The customer email is **transactional, not marketing** — no promotional content, no newsletter
  signup, no unsubscribe-required marketing copy. Keep it to what they submitted and how to reach
  the business.
- `replyTo` on the customer email = the business address, so a reply reaches Fred.

## Email-client constraints (unchanged, and they bite)

- Table-based, all CSS inline, 600px max, system fonts. No flexbox, no grid, no web fonts.
- **The mockup uses the logo twice** (header and footer). With images blocked — which is the
  default in many clients — both vanish. Ensure the header still reads as "Fred's Plumbing" in
  text, and check the footer doesn't collapse to an empty navy block. Verify with images off.
- The mockup's icons (wrench, clock, pin, phone) will be images too. Either inline them as small
  PNGs with alt text, or drop them and rely on the label/value typography. **Do not** use an icon
  font or SVG — neither renders reliably in Outlook. Say which you chose.
- Logo must be an absolute HTTPS URL from the existing config constant. It currently points at the
  Vercel domain and needs updating at cutover — carry that flag forward.
- Set preheader text on both emails deliberately.
- Dark-mode defences as already implemented.
- Plain-text alternative for both, properly formatted (the last one flattened a table into an
  unreadable run — check this).

## Subject lines

- Business: keep the current pattern, plus the reference — e.g.
  `New service request — {name}, {qualifier} [FP-XXXX]`, with the `EMERGENCY` prefix preserved.
- Customer: calm and recognisable, e.g. `We've received your request — Fred's Plumbing`. No
  "RE:", no fake urgency, no all-caps.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen — clean. No verification scaffolding left in
   `app/`. No symlinks or junctions into the working tree.
2. Render **both** templates in the React Email preview and describe each.
3. Fire a submission from each of the three forms (contact page, homepage hero, closing CTA) and
   confirm both emails are correct and carry the same reference number.
4. Both emails legible with **images blocked**.
5. Plain-text versions readable — paste the customer one into the report.
6. Business-email failure → error state plus logged payload. Customer-email failure → lead still
   succeeds. Test both.
7. Submission with no email address → business email sends, customer email skipped, no error.
8. Grep for `re_` across the repo — zero matches outside prompt files.
9. One commit; nothing uncommitted left behind.

## Report

The two flagged claims and what you did with each (especially the response-time line — whether it
rendered or was left empty pending the client); how the reference number is generated; which icon
approach you chose; a description of both templates; confirmation the business email was **not**
given the customer's reassurance blocks; the plain-text customer email pasted in full; the
failure-path results; and the standing reminder that the logo URL needs updating at domain
cutover.
