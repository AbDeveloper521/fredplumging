@AGENTS.md

# Fred's Plumbing — Marketing Website

Marketing/lead-generation site for **Fred's Plumbing** (fictional business details live in `data/site.ts`), a commercial & multi-family plumbing company serving the Dallas–Fort Worth Metroplex. Built with Next.js (App Router), TypeScript, and Tailwind CSS v4.

> ⚠️ This project uses a Next.js version with breaking changes vs. training data. Read the relevant guide in `node_modules/next/dist/docs/` (start at `01-app/`) before writing Next.js code. Heed deprecation notices.

## Commands

```bash
npm run dev     # Start dev server (next dev)
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # ESLint (flat config, eslint.config.mjs)
npm run email   # React Email preview server for emails/ (localhost:3001)
```

There is no test suite. Verify changes with `npm run build` and `npm run lint`.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16.2.11, App Router, React 19, TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme` in `app/globals.css` — there is **no** `tailwind.config` file) |
| Animation | Framer Motion (`framer-motion`) + CSS keyframes for above-the-fold |
| Icons | `lucide-react` |
| Forms | `react-hook-form` + `zod` (via `@hookform/resolvers`) |
| Class merging | `cn()` from `lib/utils.ts` (`clsx` + `tailwind-merge`) |
| Fonts | Google Fonts via `next/font` (Inter, Manrope) — emails use a system stack, no web fonts |
| Email | `resend` + `react-email` (`@react-email/components`); templates in `emails/` |

Path alias: `@/*` maps to the repo root (e.g. `@/components/ui/Button`, `@/data/site`).

## Project Structure

```
app/                        # App Router pages (all use page.tsx)
  layout.tsx                # Root layout: fonts, metadata, Header/Footer/MobileCallBar/JsonLd
  globals.css               # Tailwind import, @theme design tokens, global CSS
  page.tsx                  # Homepage — stack of <Section> components
  about/                    # + careers/, partners/, testimonials/
  areas-we-serve/           # + dallas/, fort-worth/
  contact/
  multifamily/              # + apartments/, assisted-living/, condos/, nursing-homes/
  services/                 # + commercial-plumbing/, drain-sewer/, emergency-plumbing/,
                            #   maintenance/, plumbing/, senior-care-facilities/,
                            #   specialty-services/, student-housing/
components/
  forms/                    # EmergencyContactForm, QuoteRequestForm (react-hook-form + zod)
  layout/                   # Header, HeaderClient, DesktopNav, MobileMenu, MobileCallBar,
                            #   Footer, PagePlaceholder, navActive.ts
  sections/                 # Homepage sections (Hero, TrustBar, About, Services, Emergency,
                            #   Industries, WhyChooseUs, Process, Compliance, Testimonials,
                            #   CaseStudy, ServiceArea, FAQ, FinalCTA)
  seo/                      # JsonLd.tsx — LocalBusiness structured data
  ui/                       # Primitives: Button, Badge, Container, IconFeature,
                            #   ImagePlaceholder, Logo, Reveal, SectionHeading,
                            #   ServiceCard, StatCard, TestimonialCard
data/                       # All site content as typed constants
  site.ts                   # Business name, phone, email, URL, service-area cities
  navigation.ts             # Nav tree (CMS-shaped), footer nav, trust logos
  services.ts               # Service cards (title, slug, image, lucide icon, href)
  industries.ts, faqs.ts, testimonials.ts
emails/                     # React Email templates — `npm run email` previews them
  LeadNotificationEmail.tsx # To the business: a new lead, built for phone triage
  CustomerConfirmationEmail.tsx # To the customer: what they sent + what happens next
lib/
  utils.ts                  # cn() class-merge helper
  validations.ts            # zod schemas + submitLead() → POST /api/contact
  leadDelivery.tsx          # Lead transport: renders both emails, sends them via Resend
  responseTime.ts           # The response-time commitment — EMPTY until the client approves one
  yearsInBusiness.ts        # "30+" derived from foundedYear; site and emails share the rule
  email/
    config.ts               # Env wiring (RESEND_API_KEY, LEAD_TO/FROM, asset origin)
    lead.ts                 # Submission → subjects, labelled rows, Central-time stamp
    reference.ts            # FP-XXXXX request reference, shared by both emails
    dedupe.ts               # Double-submit guard (per-instance, best effort)
    shell.tsx               # Shared design system: band, navy footer, CTA, panels, rows
    theme.ts                # Email brand tokens (hex + system fonts — no Tailwind)
public/
  images/, logos/           # Placeholder dirs — real photography/logos not yet added
```

## Design System

### Colors (defined in `@theme` in `app/globals.css` — the only source of truth)

Brand look: dark corporate navy + alarm red accent on white/off-white.

| Token | Hex | Use |
|---|---|---|
| `navy-950` | `#07111f` | Darkest backgrounds |
| `navy-900` | `#0b1727` | Primary dark sections, header, dark buttons |
| `navy-800` | `#122238` | Dark hover states, raised dark surfaces |
| `navy-700` | `#1b3049` | Lighter navy accents |
| `red-600` | `#d9272e` | Primary CTA / brand red, selection background |
| `red-500` | `#ea3038` | CTA hover, focus rings, availability pulse |
| `red-100` | `#fdebec` | Light red tint backgrounds |
| `offwhite` | `#f7f8fa` | Alternate light section background |
| `grey-100` | `#eef1f4` | Light surfaces, ghost/secondary hover |
| `grey-300` | `#cbd2da` | Borders |
| `grey-500` | `#687383` | Muted/secondary text |
| `grey-700` | `#354052` | Body text on light backgrounds |
| `ink` | `#111318` | Default body text color |

These extend Tailwind's palette, so use them as normal utilities: `bg-navy-900`, `text-grey-500`, `bg-red-600`, etc. Note `red-*` here **overrides** Tailwind's default red at those steps — always use the brand red, never arbitrary red values.

Shadow tokens: `shadow-card`, `shadow-card-lg` (soft corporate card shadows), `shadow-header`.

### Typography

- **Body:** Inter — loaded in `app/layout.tsx` via `next/font`, exposed as `--font-inter`, applied through `--font-sans` on `body`.
- **Headings (h1–h4):** Manrope — `--font-manrope` → `--font-heading`, applied globally in `globals.css`. Don't set font-family per component; the global rule handles it.
- Buttons/labels lean on `font-semibold tracking-tight`.

### Global CSS utilities & animation (see `app/globals.css`)

- `.bg-grid-dark` / `.bg-grid-light` — subtle 56px blueprint grid overlays for dark/light sections.
- `.animate-rise` (+ `--rise-delay`) — CSS-only entrance for above-the-fold hero content so LCP isn't blocked on hydration. Use this for hero content, **not** Framer Motion.
- `<Reveal delay={...}>` (`components/ui/Reveal.tsx`) — Framer Motion fade-and-rise on scroll-into-view for below-the-fold content. Easing `[0.21, 0.47, 0.32, 0.98]`, ~0.55s.
- `.availability-dot` — pulsing red dot for "24/7 available" indicators.
- **All animations must respect `prefers-reduced-motion`** — existing patterns already do (CSS media queries + `useReducedMotion()`); follow them.
- `:focus-visible` gets a global 2px `red-500` outline; `::selection` is brand red.

### UI conventions

- `Button` (`components/ui/Button.tsx`): variants `primary` (red), `secondary` (white), `outline` (for dark backgrounds), `dark`, `ghost`, `phone`; sizes `md`/`lg`; props `withArrow`, `withPhoneIcon`, `loading`. Pass `href` to render a `next/link`, omit for `<button>`. Rounded corners are `rounded-xl`.
- `SectionHeading`: `eyebrow` + `title` + `description`, with `align` (`left`/`center`), `theme` (`light`/`dark`), and `titleId` for `aria-labelledby`.
- `Container` wraps section content; sections alternate white / `offwhite` / `navy-900` backgrounds.
- Compose classes with `cn()` from `@/lib/utils` — never manual string concatenation.
- Images are not yet sourced: use `ImagePlaceholder` and record the expected subject in data (see `image`/`imageAlt` in `data/services.ts`).

## Content & Data Conventions

- **No hardcoded copy for business facts.** Phone, email, name, years in business, cities all come from `data/site.ts`. Import it; never inline "972-564-9081" etc.
- Navigation is CMS-shaped (mirrors a future Sanity document: `_key` on array members, `layout: "mega" | "list"` per group). Components must consume `getNavigation()`, never the `STATIC_NAVIGATION` constant directly.
- Lists of services/industries/FAQs/testimonials live in `data/*.ts` as typed constants — add content there, not in components.
- Forms validate with zod schemas in `lib/validations.ts`. `submitLead()` POSTs to `/api/contact`, which re-validates, filters spam (honeypot + timing + per-IP rate limit) and calls `deliverLead()` in `lib/leadDelivery.tsx`. That sends TWO emails per submission, both carrying the same `FP-XXXXX` reference: first the notification to the business (`replyTo` the customer), then the confirmation to the customer (`replyTo` the business, skipped when no usable address was submitted). The business email is FATAL — if it fails, `deliverLead` throws, the whole submission is logged under `LEAD_DELIVERY_FAILED` and the visitor sees an error with the phone number, never a false success. The customer email is NON-FATAL — a failure is logged under `LEAD_CONFIRMATION_FAILED` and the lead still succeeds. Repeat submissions inside the window are suppressed by `lib/email/dedupe.ts`.
- `site.url` is a placeholder domain — confirm before anything canonical/SEO-critical.

## Coding Conventions

- Server Components by default; add `"use client"` only when needed (forms, Framer Motion, menu state). Interactive header logic is split into `HeaderClient.tsx` for this reason.
- Named exports for components (`export function Button(...)`), one component per file, PascalCase filenames.
- Pages compose section components; keep page files thin.
- Accessibility is a first-class concern: skip-to-content link, `aria-hidden` on decorative icons, `titleId`/`aria-labelledby` on sections, keyboard focus styles, reduced-motion support. Maintain this bar in new work.
- SEO: root metadata in `app/layout.tsx` (with `metadataBase`), structured data in `components/seo/JsonLd.tsx`. Pages should export their own `metadata` where appropriate.
- Mobile: sticky `MobileCallBar` at the bottom (body has `pb-[68px] lg:pb-0` to compensate) — keep that offset in mind for fixed-position UI.
