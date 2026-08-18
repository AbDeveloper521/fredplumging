import { Suspense } from "react";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSite } from "@/sanity/lib/getSite";
import { getFooterNavigation } from "@/sanity/lib/getFooterNavigation";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { CopyrightYear } from "@/components/layout/CopyrightYear";
import { SITE_CREDIT } from "@/data/credit";

/** Single-path brand glyphs, 24×24 viewBox. */
const SOCIAL_ICON_PATHS = {
  facebook:
    "M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z",
  linkedin:
    "M6.94 8.5H4.06V20h2.88V8.5ZM5.5 7.19a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38ZM20 13.43c0-3.06-1.63-4.48-3.81-4.48-1.76 0-2.55.97-2.99 1.65V8.5H10.5V20h2.88v-6.09c0-1.61.31-3.17 2.3-3.17 1.97 0 1.44 2.36 1.44 3.28V20H20v-6.57Z",
} as const;

export async function Footer() {
  const [site, footer] = await Promise.all([getSite(), getFooterNavigation()]);
  const columns = footer.columns;
  // Driven by siteSettings so the icons can never point somewhere dead:
  // a profile with no URL is dropped rather than rendered as a link to the
  // platform's own homepage, which is what the hardcoded hrefs used to do.
  const profiles: Array<{ label: string; href?: string; path: string }> = [
    { label: "Facebook", href: site.facebookUrl, path: SOCIAL_ICON_PATHS.facebook },
    { label: "LinkedIn", href: site.linkedinUrl, path: SOCIAL_ICON_PATHS.linkedin },
  ];
  const socials = profiles.filter(
    (social): social is { label: string; href: string; path: string } =>
      Boolean(social.href),
  );
  return (
    <footer className="bg-navy-950 text-grey-300">
      <Container className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] lg:gap-8 lg:py-20">
        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo siteName={site.name} />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed">
            Commercial and multi-family plumbing specialists serving property
            managers and facilities across the Dallas–Fort Worth Metroplex
            since {site.foundedYear}.
          </p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-3">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${site.name} on ${social.label} (opens in a new tab)`}
                    className="flex size-10 items-center justify-center rounded-lg border border-white/12 transition-colors hover:border-red-500 hover:text-white"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-[18px]"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Link columns */}
        {columns.map((column) => (
          <nav key={column.heading} aria-label={`Footer — ${column.heading}`}>
            <h2 className="text-sm font-bold tracking-[0.12em] text-white uppercase">
              {column.heading}
            </h2>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link._key}>
                  <Link
                    href={link.href}
                    className="text-[15px] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Contact */}
        <div>
          <h2 className="text-sm font-bold tracking-[0.12em] text-white uppercase">
            Contact
          </h2>
          <ul className="mt-5 space-y-4 text-[15px]">
            <li>
              <a
                href={site.phoneHref}
                className="flex items-center gap-3 font-bold text-white transition-colors hover:text-red-500"
              >
                <Phone aria-hidden="true" className="size-4 shrink-0 text-red-500" />
                {site.phone}
              </a>
            </li>
            <li>
              <a
                href={site.emailHref}
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Mail aria-hidden="true" className="size-4 shrink-0 text-red-500" />
                {site.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin aria-hidden="true" className="size-4 shrink-0 text-red-500" />
              {site.serviceArea}
            </li>
            <li className="flex items-start gap-3">
              <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-red-500" />
              <span>
                Monday - Sunday | Open 24/7!
                <br />
                <span className="font-semibold text-white">
                  24/7 emergency availability
                </span>
              </span>
            </li>
          </ul>
        </div>
      </Container>

      {/*
        Bottom bar — three groups on one desktop row (copyright · legal ·
        build credit). Only the copyright is reordered on mobile (it drops
        last); the two focusable groups keep DOM order = visual order at
        every width, so tab order never diverges from what's on screen.
      */}
      <div className="border-t border-white/8">
        <Container className="flex flex-col items-center justify-between gap-1 py-4 text-center text-[14px] md:flex-row md:gap-6 md:text-left">
          <p className="order-3 md:order-1">
            ©{" "}
            <Suspense fallback={null}>
              <CopyrightYear />
            </Suspense>{" "}
            {`${site.name} · Licensed & Insured`}
          </p>
          <ul className="order-1 flex flex-wrap items-center justify-center gap-x-3 md:order-2">
            {footer.legal.map((link, index) => (
              <li key={link._key} className="flex items-center gap-x-3">
                {index > 0 && <span aria-hidden="true">·</span>}
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center transition-colors hover:text-white md:min-h-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="order-2 flex min-h-11 items-center justify-center gap-x-1 md:order-3 md:min-h-0">
            {SITE_CREDIT.prefix}
            <a
              href={SITE_CREDIT.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${SITE_CREDIT.prefix} ${SITE_CREDIT.name} (opens in a new tab)`}
              className="inline-flex min-h-11 items-center rounded-sm text-white hover:underline focus-visible:underline md:min-h-0"
            >
              {SITE_CREDIT.name}
            </a>
          </p>
        </Container>
      </div>

      {/* Slim brand-red base line */}
      <div aria-hidden="true" className="h-1.5 bg-red-600" />
    </footer>
  );
}
