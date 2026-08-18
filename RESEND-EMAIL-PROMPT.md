# Claude Code prompt — real lead delivery via Resend, with two branded email templates

## Goal

When someone submits the contact form:

1. **Fred's Plumbing receives a notification email** with everything the visitor submitted, laid
   out so it can be read and acted on from a phone.
2. **The customer receives a confirmation email** so they know the request landed.

Both templates branded, both properly built for email clients (which is not the same as building
for a browser).

## ⚠️ Secrets — read first

The Resend API key is **`RESEND_API_KEY`**, and it lives in `.env.local` locally and in Vercel's
environment variables for production. The owner will paste the real value himself.

- **Never** write the real key into any file in the repo — not `.env.example`, not a script, not a
  comment, not a test fixture, not this prompt.
- `.env.example` gets `RESEND_API_KEY=` with an empty value or an obvious placeholder.
- Report secrets **only** as "present" or "missing". Never echo, log, or print the value, and
  never include it in an error message.
- If `RESEND_API_KEY` is missing at runtime, the app must fail loudly in logs and fall back to the
  behaviour in "If sending fails" below — it must not crash the page or silently swallow the lead.

## ⚠️ Step 0 — is the form even delivering anything yet?

`lib/validations.ts` historically contained a mock `submitLead` that resolved after a timeout and
threw the submission away while showing "Request received". Check whether that's still the case
and **report it first**. This task is what finally fixes it, so state clearly what you found and
what you replaced.

Do not change the form's fields, validation schema, or honeypot/spam handling. Read the form
first and build the emails around **the fields that actually exist** — do not invent fields.
List them in your report.

## Architecture

`lib/leadDelivery.ts` — a single delivery module the server action calls. Everything Resend-
specific lives here so the provider can be swapped later without touching the form.

Use **`resend`** plus **`react-email`** (`@react-email/components`). React Email is made by Resend,
gives you a local preview server for iterating on the templates, and handles the table-based
markup email clients need. Do not hand-roll HTML strings.

### The two emails

**1. Internal notification → the business**

- To: the business email from config (`contact@fredsplumbing.com` — pull from `data/site.ts`, do
  not hardcode).
- **`replyTo` = the customer's email address.** This is the single most valuable line in the whole
  task: Fred hits reply and he's writing to the customer, not to himself.
- Subject line built for phone triage — put the useful information *before* the truncation point.
  Something like `New service request — {name}, {city or property}`. Not "Website Form
  Submission".
- Body: every submitted field, clearly labelled, nothing omitted. Empty optional fields are
  skipped rather than rendered blank.
- Include: submission timestamp in **US Central time** (this is a DFW business — UTC timestamps
  are useless to him), the page the form was submitted from, and the customer's phone as a
  `tel:` link and email as a `mailto:` link so both are tappable.
- Plain-text alternative generated alongside the HTML.

**2. Confirmation → the customer**

- To: the customer's submitted email. From: the business address, once the domain is verified.
- Warm, short, professional. Confirms what they sent, tells them what happens next, and gives the
  phone number for anything urgent.
- **Do not state a response time.** "We'll get back to you within X hours" is still an unconfirmed
  commitment — same open item as the Multi-Family FAQ. Write it so it reads naturally without a
  number, e.g. that the team will be in touch and to call for anything urgent.
- Include the phone number prominently as a `tel:` link. Someone with an active leak should be
  calling, not waiting on email.
- Plain-text alternative.

### If sending fails

This matters more than the design. Losing a lead silently is exactly the bug this task exists to
fix, so do not reintroduce it in a new form:

- **Internal notification fails** → log the complete submission at error level with a distinctive,
  greppable marker (e.g. `LEAD_DELIVERY_FAILED`) so it can be recovered from Vercel logs, **and**
  show the customer an error state that gives them the phone number. Do not tell someone their
  request was received when it wasn't. A plumbing customer who needs help should be told to call.
- **Customer confirmation fails** → non-fatal. Log it and carry on; the business still got the
  lead, which is the part that matters.
- Never expose provider errors, keys, or stack traces to the browser.

Also: a basic rate limit on the endpoint if there isn't one already. Say what you did.

## Email template design

Email clients are not browsers. Outlook still uses Word's rendering engine. So:

- Table-based layout, **all CSS inline**, max width **600px**. No flexbox, no CSS grid, no
  external stylesheets, no web fonts — system font stack with sensible fallbacks.
- Brand: the red from the logo (sample it from the logo file rather than guessing — it's
  approximately `#CE1F26`), on white or near-white. A dark header band with the logo works well
  and matches the site.
- **The logo must be an absolute HTTPS URL**, not a relative path and not a local import. Until
  the production domain is live, point it at whatever public URL is currently serving the site,
  and note in your report that it must be updated at domain cutover. Give it real alt text — many
  clients block images by default, so the email must still make sense with every image suppressed.
  Test that.
- Dark mode: several clients invert colours. Avoid relying on a light background for legibility,
  and check the header doesn't turn into a black-on-black block.
- Every link an absolute URL. Preheader text set deliberately (the grey preview line next to the
  subject in an inbox) — otherwise clients scrape the first stray text and it looks unfinished.
- Keep both templates in `emails/` (or wherever React Email's convention puts them) so the preview
  server can render them.

## Domain verification — the blocker to flag clearly

Resend will not send from `@fredsplumbing.com` until that domain is **verified in Resend** with
its DNS records (SPF/DKIM, and DMARC is worth adding) published. Until then Resend restricts
sending to the account owner's own address from its test sender.

This is an owner action, not a code change. In your report, spell out exactly:

- which records must be added and where,
- what the `from` address should become once verified,
- what to set `RESEND_API_KEY` to in Vercel and that a **redeploy** is needed for it to take
  effect,
- and what the behaviour will be *before* verification, so testing isn't confusing.

Make the `from` address configurable via env (`LEAD_FROM_EMAIL` or similar) with a sensible
default, so cutover is a variable change rather than a code change.

## Constraints

- **No verification scaffolding left in `app/`** — a previous task shipped a broken harness route
  and failed the Vercel build.
- **No symlinks or directory junctions pointing into the real working tree** — a previous task did
  that, `git worktree remove` followed it, and it deleted packages from `node_modules`.
- Structured data bans stand: no `AggregateRating`, `Review`, or `FAQPage`.
- Do not modify the contact page's layout. If the section-stack conversion
  (`CONTACT-PAGE-SECTIONS-PROMPT.md`) has already run, work with it; if not, don't do it here.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build`, typegen — clean.
2. Render both templates in React Email's preview and **describe what they look like** — don't
   just assert they render.
3. Submit the form locally with the key configured and confirm: the internal email arrives with
   every field, the reply-to is the customer's address, the timestamp is Central time, and the
   confirmation reaches the customer address.
4. Submit with `RESEND_API_KEY` deliberately unset and confirm the failure path — the greppable
   log line appears with the full payload, and the customer sees the error state with the phone
   number rather than a false success.
5. Confirm both emails are legible with **images blocked**.
6. Confirm no secret appears in any committed file, any log line, or any error message. Grep for
   the key prefix `re_` across the repo and paste the result — it must be zero.
7. One commit; nothing uncommitted left behind.

## Report

Whether `submitLead` was still a mock and what replaced it; the exact form fields the templates
were built around; a description of both templates; the failure-path behaviour; the rate limiting;
the DNS records and env vars the owner must set, and that a redeploy is required; confirmation
that the logo URL is a placeholder needing update at domain cutover; the `re_` grep result; and a
reminder that the customer confirmation deliberately states **no response time** until the client
confirms one.
