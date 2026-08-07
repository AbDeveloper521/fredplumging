import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ServiceHeroSection } from "@/components/sections/ServiceHeroSection";
import { LegalToc } from "@/components/legal/LegalToc";
import { legalHeadings } from "@/lib/legalHeadings";
import {
  LEGAL_SHORT_TITLES,
  legalHref,
  type LegalPageContent,
  type LegalSlug,
} from "@/data/legalPages";
import type { SiteContent } from "@/data/site";

/** "(972) 564 9081" → "tel:+19725649081". */
function telHref(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:${digits}`;
}

/** The other document — a quiet cross-link stops each page being a dead end. */
const OTHER: Record<LegalSlug, LegalSlug> = {
  "privacy-policy": "terms-of-service",
  "terms-of-service": "privacy-policy",
};

/**
 * Both legal pages, one layout: the shared page banner up top, then a sticky
 * "On this page" list beside the prose from `lg` up.
 *
 * The words are the client's legal text, rendered verbatim — everything here
 * is presentation. Measure is capped near 70ch (the client's own version runs
 * paragraphs the full container width, which is the main reason it reads
 * badly), each `h2` carries a slugified anchor that clears the fixed header,
 * and the "On this page" list is derived from those same headings.
 */
export function LegalPageLayout({
  content,
  site,
}: {
  content: LegalPageContent;
  site: SiteContent;
}) {
  const { headings, idByKey } = legalHeadings(content.body);
  const other = OTHER[content.slug];

  const components: PortableTextComponents = {
    block: {
      h2: ({ children, value }) => (
        <h2
          id={value._key ? idByKey[value._key] : undefined}
          // Clears the fixed 76px header with room to breathe, so an anchor
          // never lands under the nav.
          className="mt-16 scroll-mt-[100px] border-t border-grey-300/70 pt-9 text-[24px] leading-tight font-extrabold tracking-tight text-navy-900 first:mt-6 sm:text-[28px]"
        >
          {children}
        </h2>
      ),
      normal: ({ children }) => (
        <p className="mt-5 text-[17px] leading-[1.75] text-grey-700">
          {children}
        </p>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="mt-5 space-y-2.5 text-[17px] leading-[1.75] text-grey-700">
          {children}
        </ul>
      ),
    },
    listItem: {
      bullet: ({ children }) => (
        <li className="relative pl-6 before:absolute before:top-[0.7em] before:left-1 before:size-1.5 before:rounded-full before:bg-red-600 before:content-['']">
          {children}
        </li>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className="font-semibold text-navy-900">{children}</strong>
      ),
      link: ({ children, value: link }) => {
        const href = typeof link?.href === "string" ? link.href : "#";
        const classes =
          "font-semibold text-navy-900 underline decoration-red-600/60 underline-offset-4 transition-colors hover:text-red-600";
        return href.startsWith("/") ? (
          <Link href={href} className={classes}>
            {children}
          </Link>
        ) : (
          <a href={href} rel="noopener noreferrer" className={classes}>
            {children}
          </a>
        );
      },
    },
    hardBreak: () => <br />,
  };

  return (
    <div className="legal-doc">
      <ServiceHeroSection
        id="legal-banner"
        section={{
          _type: "serviceHero",
          _key: "banner",
          eyebrow: content.eyebrow,
          heading: content.title,
          credentials: [],
          photo: content.bannerPhoto,
          darkOverlay: content.darkOverlay,
        }}
        site={site}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: LEGAL_SHORT_TITLES[content.slug], href: legalHref(content.slug) },
        ]}
        subheadings={content.intro}
      />

      <section className="bg-white pb-20 lg:pb-28">
        <Container>
          <div className="grid grid-cols-1 gap-x-16 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
            <LegalToc headings={headings} />

            <div className="min-w-0 max-w-[70ch]">
              {/* Repeated above the document text, as the reference pages do. */}
              <p className="flex items-center gap-3 pt-12 text-[13px] font-bold tracking-[0.14em] text-red-500 uppercase lg:pt-14">
                <span aria-hidden="true" className="h-px w-8 bg-red-500" />
                {content.eyebrow}
              </p>

              {/* Only when the owner sets a date — neither document shows one
                  today, and nothing fills it in automatically. */}
              {content.lastUpdated && (
                <p className="mt-4 text-[14px] font-medium text-grey-500">
                  Last updated:{" "}
                  <time dateTime={content.lastUpdated}>
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(`${content.lastUpdated}T00:00:00Z`))}
                  </time>
                </p>
              )}

              {/* Tightens the gap between a heading and its first paragraph. */}
              <div className="[&_h2+p]:mt-4">
                <PortableText value={content.body} components={components} />
              </div>

              {content.contact && (
                <div className="mt-8 rounded-2xl border border-grey-300/70 bg-offwhite p-6 sm:p-7">
                  {content.contact.name && (
                    <p className="text-[17px] font-bold tracking-tight text-navy-900">
                      {content.contact.name}
                    </p>
                  )}
                  {/* Label and value share one paragraph so the text reads
                      "Phone: (972) 564 9081" verbatim when copied or read
                      aloud — a <dl> would drop the space after the colon. */}
                  <div className="mt-4 space-y-2.5 text-[16px] text-grey-700">
                    {content.contact.phoneDisplay && (
                      <p>
                        <span className="font-semibold text-navy-900">
                          Phone:
                        </span>{" "}
                        <a
                          href={telHref(content.contact.phoneDisplay)}
                          className="font-semibold text-navy-900 underline decoration-red-600/60 underline-offset-4 transition-colors hover:text-red-600"
                        >
                          <Phone
                            aria-hidden="true"
                            className="mr-1.5 inline size-4 align-[-2px] text-red-600"
                          />
                          {content.contact.phoneDisplay}
                        </a>
                      </p>
                    )}
                    {content.contact.website && (
                      <p>
                        <span className="font-semibold text-navy-900">
                          Website:
                        </span>{" "}
                        {content.contact.website}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation, not content: keeps each document from dead-ending. */}
              <p
                data-print-hide
                className="mt-12 border-t border-grey-300/70 pt-6 text-[15px] text-grey-500"
              >
                See also:{" "}
                <Link
                  href={legalHref(other)}
                  className="font-semibold text-navy-900 underline decoration-red-600/60 underline-offset-4 transition-colors hover:text-red-600"
                >
                  {LEGAL_SHORT_TITLES[other]}
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
