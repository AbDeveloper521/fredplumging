import { Suspense } from "react";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSite } from "@/sanity/lib/getSite";
import { getFooterNavigation } from "@/sanity/lib/getFooterNavigation";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { CopyrightYear } from "@/components/layout/CopyrightYear";

export async function Footer() {
  const [site, footer] = await Promise.all([getSite(), getFooterNavigation()]);
  const columns = footer.columns;
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
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.facebook.com"
              aria-label={`${site.name} on Facebook`}
              className="flex size-10 items-center justify-center rounded-lg border border-white/12 transition-colors hover:border-red-500 hover:text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-[18px]"
              >
                <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com"
              aria-label={`${site.name} on LinkedIn`}
              className="flex size-10 items-center justify-center rounded-lg border border-white/12 transition-colors hover:border-red-500 hover:text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-[18px]"
              >
                <path d="M6.94 8.5H4.06V20h2.88V8.5ZM5.5 7.19a1.69 1.69 0 1 0 0-3.38 1.69 1.69 0 0 0 0 3.38ZM20 13.43c0-3.06-1.63-4.48-3.81-4.48-1.76 0-2.55.97-2.99 1.65V8.5H10.5V20h2.88v-6.09c0-1.61.31-3.17 2.3-3.17 1.97 0 1.44 2.36 1.44 3.28V20H20v-6.57Z" />
              </svg>
            </a>
          </div>
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

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 text-[13px] sm:flex-row">
          <p>
            ©{" "}
            <Suspense fallback={null}>
              <CopyrightYear />
            </Suspense>{" "}
            {site.legalName}. All rights reserved.
            · Licensed &amp; Insured · TX Master Plumber License
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {footer.legal.map((link) => (
              <li key={link._key}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* Slim brand-red base line */}
      <div aria-hidden="true" className="h-1.5 bg-red-600" />
    </footer>
  );
}
