# Claude Code prompt — shorten the footer bottom bar and add the ThemeTrek credit

## What's wrong now

The footer's bottom bar reads:

> © 2026 Fred's Plumbing Company. All rights reserved. · Licensed & Insured · TX Master Plumber
> License        Privacy Policy   Terms of Service

Too long, and most of it is redundant — the footer body directly above already says
**"Licensed by the State of Texas (RMP 44890)"**, which is the stronger statement because it
carries the actual licence number. Repeating "Licensed & Insured · TX Master Plumber License"
underneath adds length and says less.

## What it should be

Three groups on one line at desktop width:

- **Left:** `© {year} Fred's Plumbing` — nothing else. Drop "Company", drop "All rights
  reserved.", drop both licence phrases.
- **Middle:** `Privacy Policy` · `Terms of Service`
- **Right:** `Website by ThemeTrek` — "ThemeTrek" links to **https://themetrek.com/quote**

Verify the licence line genuinely still appears in the footer body before removing it from the
bottom bar. If for any reason it doesn't, keep `Licensed & Insured` in the bottom bar and say so —
do not strip a licensing statement off the page entirely.

### The year

Check whether `2026` is hardcoded. If it is, compute it instead. A footer that says 2026 in
January 2027 is the kind of small thing that makes a site look abandoned.

### Business name

Use whatever the identity audit settled on (`BUSINESS-IDENTITY-AUDIT-PROMPT.md`) — pull it from
config, don't retype it. "Fred's Plumbing" is the everyday brand name; "Fred's Plumbing Company"
appearing only here is exactly the kind of variant that audit exists to kill.

## The credit link — how it should look

It's a designer credit on a client's site, so it should read as confident and quiet, not as an
advert competing with the client's own brand:

- Text: `Website by ThemeTrek`. "Website by" in the same muted tone as the rest of the bar;
  **"ThemeTrek" slightly brighter** so the eye lands on it — a small weight bump, or the brand red,
  or simply full-opacity white against the muted surrounding text. Pick one and say which; do not
  do all three.
- Hover/focus: an underline or a shift to the brand red. Visible focus ring for keyboard users.
- `target="_blank"` with `rel="noopener noreferrer"`.
- Same font size as the rest of the bottom bar — do not make it smaller. Tiny credit text reads as
  apologetic, and it's harder to click on a phone.
- Put the URL in a single constant (site config or a small `data/` value) rather than inline in
  JSX, so it's changed in one place.

Keep it in code, **not** in Sanity. This is a build credit, not client-editable content.

**On the anchor text:** keep it exactly `Website by ThemeTrek`. Do not make it keyword-rich
("Dallas plumbing web design" and so on). A plain, natural designer credit is normal and fine; a
keyword-stuffed site-wide footer link across a portfolio of client sites is a link scheme and can
hurt both the client and ThemeTrek. Leave it as a plain link — no `nofollow` needed.

## Layout

- **Desktop (`md` and up):** one row, three groups, evenly distributed — copyright left, legal
  links centre, credit right. Use the existing container so it lines up with the footer content
  above it.
- **Mobile:** stack centred in this order — legal links, credit, copyright last. Comfortable tap
  targets (44px minimum) and enough vertical spacing that the two links aren't easy to mis-tap.
- Separators: use a middle dot `·` between the legal links, consistent with the current styling.
  Don't leave an orphaned separator anywhere after the text is shortened.
- The bar should get visibly shorter — that's the point. Check there's no leftover wide padding
  making it feel empty now that the text is a third of the length.

## Verify

1. `npx tsc --noEmit`, lint, `npm run build` — clean. **No verification scaffolding left in
   `app/`.**
2. The bottom bar renders correctly at 375 / 768 / 1024 / 1440, on every page type.
3. The ThemeTrek link opens https://themetrek.com/quote in a new tab and is keyboard reachable
   with a visible focus ring.
4. The licence statement still appears in the footer body.
5. Contrast passes WCAG AA for both the muted text and the link.
6. One commit; nothing uncommitted left behind.

## Report

The exact final text of the bottom bar; which visual treatment you chose to lift "ThemeTrek" out
of the muted text; whether the year was hardcoded and what it is now; confirmation the licence
line still appears above; and where the ThemeTrek URL constant lives.
