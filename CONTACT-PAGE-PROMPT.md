# Claude Code prompt — build the `/contact` page and a real "Request a Quote" flow

## 0. Read this first

`app/(site)/contact/page.tsx` is still a `PagePlaceholder`. It is also the single most
linked-to route in the whole site — `HeroSection`, `FinalCTASection`, `EmergencySection`,
`ComplianceSection`, `WhyChooseUsSection`, `PartnerCredentialsSection`, `CmsDetailPage`, the
header CTA (`data/navigation.ts:210`) and the footer all point at it. Every conversion path on
this site ends at a placeholder. That is what this task fixes.

Before writing anything, read:

- `app/(site)/about/partners/page.tsx` — the structural template for a hand-built (non-CMS)
  page: dark hero with grid + radial washes, eyebrow rule, `Container`, the SVG wave hand-off,
  then a stack of section components. Match this. Do not invent a new page shell.
- `components/forms/QuoteRequestForm.tsx` and `components/forms/EmergencyContactForm.tsx` —
  the existing form conventions: `react-hook-form` + `zodResolver`, the shared `inputClasses`
  / `labelClasses` constants, the `FieldError` helper, the `"idle" | "success" | "error"`
  state machine, and the success panel with a fallback phone link.
- `lib/validations.ts` — the zod schemas and `submitLead`.
- `CLAUDE.md` and the vendored Next docs at `node_modules/next/dist/docs/01-app/`. This repo is
  Next 16.2.11 with breaking changes versus your training data. Tailwind is v4, configured in
  `app/globals.css` via `@theme` — **there is no `tailwind.config` file, do not create one.**

### The thing you need to know before you build anything

`lib/validations.ts` ends with this:

```ts
export async function submitLead(data: Record<string, unknown>): Promise<void> {
  void data;
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
```

Both live forms call it. It waits 1.1 seconds, resolves, and the UI shows **"Request received —
our team will contact you shortly."** Nothing is sent anywhere. Every enquiry submitted through
the homepage hero form and every final-CTA form since launch has been silently discarded while
telling the customer it went through.

So this task is not only "build a contact page". It is "make lead capture actually work". Part 3
below is the non-negotiable half of the job. If you run out of room, build the endpoint and wire
up the existing forms **first**, and leave the new page simpler.

---

## 1. Business facts — use these exactly

The owner supplied these. They are authoritative.

| Fact | Value |
|---|---|
| Email (display) | `contact@fredsplumbing.com` |
| Email (link) | `mailto:contact@fredsplumbing.com` |
| Phone (display) | `972-564-9081` |
| Phone (link) | `tel:+19725649081` |
| Location | Dallas–Fort Worth Metroplex |

Two things to get right:

**The email is currently wrong in the codebase.** `data/site.ts` has
`service@fredsplumbingdfw.com`. Update both `email` and `emailHref` there. The phone already
matches — leave it.

**Changing `data/site.ts` alone will not change the live site.** Read
`sanity/lib/getSite.ts`: every server component reads the `siteSettings` singleton from Sanity
and only falls back to `data/site.ts` when the fetch *throws*. If `siteSettings` is published
with the old address, the old address is what visitors see. So: make the code change, and then
put a line in your report telling the owner he must open `/studio` → Site Settings and update
**Email (display)** and **Email (mailto: link)** himself. Do not attempt to write to the dataset.

**There is no street address.** `streetAddress` is deliberately unset. Do not invent one, do not
add a map embed pinned to a guessed location, and do not emit a `PostalAddress` in structured
data. "Dallas–Fort Worth Metroplex" is a service area, not an address — model it as `areaServed`.

---

## 2. What the research says about plumbing quote forms — and what to build

I looked at current guidance on lead forms for home-service and contractor sites. The consistent
findings:

- **Fewer required fields converts better.** The recommended core is name, phone, and "what's
  wrong" — everything else gets collected on the callback.
- **Phone access must dominate.** For this trade the phone outperforms the form; one source
  measured a large-type tap-to-call CTA converting roughly twice as well as a small one.
- **Emergencies and quotes are different journeys.** Give them two visibly separate paths
  instead of funnelling a burst riser into a contact form.
- **Never use a CAPTCHA.** It is the single worst offender for abandonment on mobile. Use a
  honeypot and a server-side timing check instead.
- **Promise a specific response time.** "We'll call you within one business hour" beats "we'll
  be in touch" because it removes the urge to go and fill in a competitor's form too.
- Multi-step forms are widely recommended for consumer home-service leads because each step is
  small and the sunk-cost effect pulls people through.

**The decision, and why:** build a **single-page form with two grouped cards**, not a multi-step
wizard. Fred's audience is property managers, facilities leads and GCs sizing up a vendor — not
homeowners in a panic. For that reader a form that shows its full shape at once reads as
organised and professional, while a wizard that drip-feeds questions reads as a marketing funnel
and hides how much is being asked. The multi-step conversion advantage is real, but it is
measured on high-volume consumer traffic, which is not this site.

Apply the research where it actually counts: **only five fields are required**, everything else
is clearly marked optional, the emergency path is a separate large tap-to-call element rather
than a form, and there is an explicit response-time promise.

If you disagree after building it, say so in your report — do not silently build a wizard.

---

## 3. Make lead capture real (do this first)

### 3.1 `app/api/contact/route.ts`

A `POST` route handler that:

- Re-validates the payload **server-side** with the same zod schema. Never trust the client;
  the endpoint is public.
- Rejects on the honeypot field being non-empty, and on a submit that arrives less than ~3
  seconds after the form was mounted (send an `elapsedMs` from the client and check it server
  side). Both rejections should return a normal-looking success response so a bot learns nothing.
- Applies a best-effort per-IP rate limit. An in-memory `Map` is fine — but comment honestly
  that this resets on every cold start on Vercel and is not real protection, only a speed bump.
- Returns `{ ok: true }` or a `4xx`/`5xx` with a short message. Never echo the submitted values
  back in the response.
- Uses `export const runtime = "nodejs"` and no caching.

### 3.2 `lib/leadDelivery.ts`

One small module with a single `deliverLead(lead)` function so the transport is swappable:

- If `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are both set, `fetch` Resend's REST API directly.
  **Do not add an npm dependency for this** — a plain `fetch` to their HTTP endpoint is enough
  and keeps the dependency list where it is.
- If they are not set, write a clearly formatted `console.warn` containing the lead, prefixed so
  it is greppable in Vercel logs, and return successfully. This means the site degrades to
  "lead is recoverable from logs" rather than "lead is destroyed", which is where it is today.
- Emit a one-time startup warning when the env vars are missing, so the gap is visible rather
  than silent.

Add `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` to `.env.example` with
**placeholder values and a comment only**. `.env.example` is committed — never put a real key,
token or address in it.

### 3.3 Retire the mock

Replace the body of `submitLead` with a real `fetch("/api/contact", …)` that throws on a
non-`ok` response, keeping the exported signature so both existing forms keep working. Verify by
submitting the homepage hero form and watching the request in the network tab.

---

## 4. The page

Route stays `app/(site)/contact/page.tsx`. Server component, `async`, fetching in one
`Promise.all` the way the Partners page does. Sections top to bottom:

**Hero.** Same dark treatment as the Partners hero — `bg-navy-950`, `bg-grid-dark`, the two
radial washes, the red rule + eyebrow ("Contact"), then the H1 and a short paragraph. Credential
chips beneath: licence number, years in DFW, 24/7 dispatch — read from `site`, do not hardcode.
Close with the same SVG wave if the next band is dark.

**Two paths.** Directly under the hero, two side-by-side cards on desktop, stacked on mobile:

- *Emergency — call now.* The phone number set as the largest tappable element on the card, red,
  with the 24/7 line. Wraps `site.phoneHref`. This is the primary target on mobile.
- *Request a quote.* Short copy plus an anchor link down to the form, and the response-time
  promise.

**Contact details + form.** The main band. A two-column grid: the form on the wider side, a
details column alongside carrying email (`site.emailHref`), phone, the service area, hours, and
the licence number, each with a `lucide-react` icon. Every one of email and phone must be a real
`mailto:` / `tel:` link, not plain text.

**Service area.** Reuse the existing `ServiceAreaSection` if its props allow; otherwise a
compact band listing `serviceAreaCities` with a line making clear the list is representative,
not exhaustive. No map embed — see §1.

**Trust.** `TestimonialsSection` with `limit={3}`, same call signature as the Partners page.

**FAQ.** `ServiceFaqSection` fed a hand-built section object exactly as the Partners page builds
`faqSection` from `vendorFaqs`. Write 5–6 contact-specific questions: how fast do you respond,
do you take after-hours calls, do you service single-family homes, what do you need from me to
quote, are you an approved vendor on our platform, do you provide COIs. Keep the answers to the
claims the site already makes — do not upgrade "approved vendor" into "certified" or invent a
guaranteed arrival window.

**Do not render `FinalCTASection` on this page.** It embeds `QuoteRequestForm`, so it would put
a second, different lead form on the contact page. End with a plain closing band or nothing.

---

## 5. The form itself

New component `components/forms/ContactQuoteForm.tsx` (client). Do not modify the two existing
forms beyond the `submitLead` change — they serve different, shorter jobs elsewhere.

New `contactQuoteSchema` in `lib/validations.ts` alongside the existing two, reusing the
`phonePattern` constant.

**Card 1 — "About the work"**

| Field | Type | Required |
|---|---|---|
| Service needed | select | ✅ |
| Property type | select — Apartment / multi-family, Commercial or office, Retail or restaurant, Industrial or warehouse, HOA or condo, Municipal or school, Other | — |
| City or property address | text | — |
| How soon | radio — Emergency (need someone now) / Urgent (within 24 hours) / Scheduled (this week) / Planning & budgeting | — (defaults to *Scheduled*) |
| Describe the work | textarea, min 10 chars | ✅ |

**Card 2 — "How we reach you"**

| Field | Type | Required |
|---|---|---|
| Full name | text | ✅ |
| Company or property group | text | — |
| Phone | tel | ✅ |
| Email | email | ✅ |
| Preferred contact | radio — Phone / Text / Email | — (defaults to *Phone*) |
| How did you hear about us | select | — |

Plus a visually hidden honeypot input that a human never sees and a hidden timestamp for the
timing check. Do not use a CAPTCHA.

Details that matter:

- **Service options should come from the real services**, not a hardcoded array. The homepage
  form hardcodes seven strings in `EmergencyContactForm.tsx` and they will drift from Sanity.
  Pass the option list in as a prop from the server component, derived from the services already
  being fetched, with "Other" appended. Note in your report if the existing hardcoded list is
  already out of step with Sanity.
- **Selecting "Emergency"** should reveal an inline red callout saying a form is the wrong
  channel for an active emergency and putting the phone number right there as a link. Do not
  block submission — just make the faster path obvious.
- **Optional fields must be labelled optional**, in the same muted style
  `QuoteRequestForm.tsx` already uses for its company field. Do not use asterisks on required
  fields; mark the minority, not the majority.
- **Mobile input types.** `type="tel"` with `inputMode="tel"`, `type="email"` with
  `inputMode="email"`, correct `autoComplete` on every field. Large tap targets — keep the
  existing `h-12`.
- **Accessibility.** Each card is a `<fieldset>` with a `<legend>` (visually styled, not
  hidden). Radio groups get `role="radiogroup"` and a labelled group. Errors keep the existing
  `aria-invalid` + `aria-describedby` + `role="alert"` pattern. On a failed submit, move focus to
  the first invalid field. The success panel keeps `role="status"`.
- **Submitting state** uses the existing `Button` `loading` prop. Disable double submits.
- **`components/layout/MobileCallBar.tsx` is fixed to the bottom on mobile.** Check it does not
  cover the submit button or the success message. Add bottom padding to the section if it does.

The success panel should confirm what happens next in concrete terms — that someone will call
within one business hour during business hours — and repeat the phone number as a link. Do not
promise anything the owner has not committed to; if you are unsure of the window, use the same
wording `QuoteRequestForm` already uses rather than inventing a stronger promise.

---

## 6. Sanity schema (build it, do not connect it)

Per the standing rule on this project, schemas get written now and populated later. Follow the
existing fetcher-plus-fallback pattern exactly.

- `sanity/schemas/contactPage.ts` — a singleton with: hero eyebrow, heading, intro, the
  response-time promise line, business hours (a short array of day/hours rows), an emergency
  callout heading and body, and an FAQ array reusing the existing FAQ field shape. Register it in
  `sanity/schemas/index.ts` and add it to the Studio structure the way the other singletons are
  added.
- `data/contactPage.ts` — the typed fallback holding the copy you actually ship, so the page
  renders identically with an empty dataset.
- `sanity/lib/getContactPage.ts` — matching the shape of the other `get*.ts` fetchers:
  `sanityFetchOptions("contactPage")`, fall back to the static data **on a thrown error only**,
  never on a successful-but-empty result, and log through the existing `logFallback` / `logEmpty`
  helpers.
- Add the GROQ projection to `sanity/queries.ts`.
- The cache tag is the document `_type` string, `contactPage`, matching how `/api/revalidate`
  resolves tags. Confirm that route needs no change.

Then run `npm run typegen` and `npm run check:drift`. Both must be clean, and the regenerated
`sanity.types.ts` is committed with the change.

---

## 7. SEO and structured data

- Update the `metadata` export: title, description mentioning commercial and multi-family
  plumbing across DFW, and keep `alternates.canonical: "/contact"`.
- `BreadcrumbJsonLd` with Home → Contact, matching how the Partners page calls it.
- `FaqJsonLd` fed the same FAQ array the page renders. It must match the visible copy exactly —
  mismatched FAQ markup is a manual-action risk.
- A `ContactPage` node with a `contactPoint` carrying the telephone, the email, `areaServed`
  for the DFW metro, and `contactType: "customer service"`. **No `PostalAddress`** — there is no
  address. **No `AggregateRating`, no `review`, no `@type: "Review"` anywhere** — self-serving
  review markup on your own business is ineligible for rich results and risks a penalty. This
  rule holds across the whole site.
- `/contact` is already in `app/sitemap.ts`. Confirm, do not duplicate.

---

## 8. Do not

- Do not touch `sanity/lib/getGoogleReviews.ts` or its 86400 cache — it is a billed API.
- Do not add review or rating structured data.
- Do not invent a street address, business hours, response-time guarantee, or a licence or
  certification the site does not already claim.
- Do not add a CAPTCHA.
- Do not put real credentials in `.env.example`, and do not log any secret. Availability of a
  key may only ever be reported as a boolean.
- Do not restructure navigation — the header CTA and footer already point at `/contact`.
- Do not delete `PagePlaceholder`; `app/(site)/about/page.tsx` still uses it.

---

## 9. Verify

1. `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean.
2. `npm run typegen` and `npm run check:drift` clean.
3. `npm run dev` → `/contact` renders with no console errors or warnings. Check 375px, 768px,
   1024px and 1440px. Nothing overlaps; the mobile call bar does not obscure the submit button.
4. Submit the form with every field blank and confirm the five required errors appear, focus
   moves to the first one, and nothing is sent.
5. Submit a valid form with no email env vars set: confirm a `200`, the success panel, and the
   formatted lead in the terminal.
6. Submit the homepage hero form and the final-CTA form and confirm both now hit
   `/api/contact` — the mock is fully retired.
7. Select "Emergency" and confirm the call-now callout appears with a working `tel:` link.
8. Tab through the whole form with a keyboard only. Every control reachable, every label
   announced, focus ring visible throughout.
9. Confirm `contact@fredsplumbing.com` and `972-564-9081` appear as real `mailto:` / `tel:`
   links and that the email is not hardcoded anywhere — it must come from `site`.
10. `/studio` still loads and Contact Page appears as a singleton.
11. One commit.

## 10. Report back

Short and specific:

- Whether the email change needs the owner to update the Sanity `siteSettings` singleton (it
  does) and exactly which two fields.
- Whether `EmergencyContactForm`'s hardcoded service list matches the services in Sanity.
- What you did about lead delivery, and precisely which env vars the owner must set in Vercel —
  names only, never values — before leads reach an inbox.
- Anything you disagreed with in §2 and why.
- Anything you found that looks wrong but was out of scope.
