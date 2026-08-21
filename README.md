# Fred's Plumbing — Commercial Plumbing Homepage

A premium, conversion-focused homepage for Fred's Plumbing, a 24/7 commercial and
multi-family plumbing company serving the Dallas–Fort Worth Metroplex.

Built with **Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion ·
React Hook Form · Zod · Lucide icons**.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Other scripts:

```bash
npm run build     # production build
npm run start     # serve the production build
npm run lint      # ESLint
npx tsc --noEmit  # type check
```

## Project structure

```
app/
  layout.tsx          Root layout: fonts, metadata, header/footer, JSON-LD, skip link
  page.tsx            Homepage — composes the section components in order
  globals.css         Tailwind v4 theme tokens (brand palette, fonts, shadows)

components/
  layout/             Header (sticky, dropdowns), MobileMenu, Footer, MobileCallBar
  sections/           One component per homepage section
  forms/              EmergencyContactForm (hero), QuoteRequestForm (final CTA)
  ui/                 Container, Button, SectionHeading, Badge, cards, Reveal, etc.
  seo/JsonLd.tsx      LocalBusiness (Plumber) structured data

data/
  site.ts             Phone, email, service-area cities, brand constants
  services.ts         Six services (title, slug, copy, image path, icon)
  industries.ts       Six property types with bullets
  testimonials.ts     Reviews (one featured)
  navigation.ts       Header/footer nav + vendor-system logo list
  faqs.ts             FAQ accordion content

lib/
  utils.ts            cn() — clsx + tailwind-merge
  validations.ts      Zod schemas + mock async submit handler
```

## Deploying to Vercel

1. Push this repository to GitHub:

   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new), import the GitHub repository,
   and click **Deploy** — Vercel auto-detects Next.js; no configuration or
   environment variables are required.

3. Every push to `main` will redeploy automatically. The production domain is
   https://fredsplumbing.com; the generated `*.vercel.app` alias 308-redirects
   to it (`proxy.ts`), so share the real domain. Per-branch preview
   deployments are deliberately left alone and still work.

## Key implementation notes

- **Images** — production photography isn't included, so every image slot uses the
  `ImagePlaceholder` component (branded gradient + blueprint texture + a caption
  naming the expected shot). The intended file names (e.g.
  `/images/hero-commercial-plumbing.webp`) live in the data files and in component
  comments. To go live: drop files into `public/images/` and replace each
  `<ImagePlaceholder />` with `next/image`.
- **Forms** — both forms validate with Zod via React Hook Form and submit to
  `submitLead()` in `lib/validations.ts`, a mock async handler. Point that function
  at a real API route to wire them up.
- **Vendor logos** — rendered as monochrome wordmarks. Swap for `<Image />` files in
  `public/logos/` when real logo assets are available.
- **Animation** — a single `Reveal` wrapper (Framer Motion) drives fade-and-rise
  entrances; it renders statically when `prefers-reduced-motion` is set.
- **Accessibility** — skip link, one `h1`, labeled landmarks, keyboard-navigable
  dropdowns/tabs/accordions with `aria-expanded`/`aria-controls`, inline form
  errors tied to inputs via `aria-describedby`, 44px+ touch targets.
- **Mobile conversion** — a sticky bottom "24/7 Emergency · Call Now" bar shows on
  screens below `lg`; the body carries matching bottom padding so nothing is
  obscured.
- **SEO** — full metadata (Open Graph, Twitter, canonical placeholder) in
  `app/layout.tsx`; `Plumber` JSON-LD in `components/seo/JsonLd.tsx`. No street
  address is published intentionally. The production domain is NOT a constant in
  `data/site.ts` — it comes from `NEXT_PUBLIC_SITE_URL` via `lib/siteUrl.ts`, and
  `proxy.ts` 308-redirects every other host onto it.
