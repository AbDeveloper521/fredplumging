import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { navIcons } from "@/components/layout/navIcons";
import type { ServiceHeroSection as HeroData } from "@/data/serviceSections";
import type { SiteContent } from "@/data/site";

export interface Breadcrumb {
  label: string;
  href: string;
}

interface ServiceHeroSectionProps {
  section: HeroData;
  site: SiteContent;
  /** Trail ending at the current page (last item is not linked). */
  breadcrumbs: Breadcrumb[];
  id: string;
}

/** CSS-only entrance — the hero must never wait on JS hydration. */
function Rise({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`animate-rise ${className ?? ""}`}
      style={{ "--rise-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Service-page hero: breadcrumbs, h1, sub-paragraph, dual CTA row, and the
 * slim credentials strip that replaces scattering those claims across three
 * sections. Right side: one tall, subtly offset image slot — no badge (the
 * collage-with-badge composition is reserved for the About section).
 */
export function ServiceHeroSection({
  section,
  site,
  breadcrumbs,
  id,
}: ServiceHeroSectionProps) {
  const phoneCtaLabel = (section.phoneCtaLabel ?? "Call 24/7: {phone}").replace(
    "{phone}",
    site.phone,
  );
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative isolate overflow-hidden bg-navy-950"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgb(27_48_73/0.9),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_80%,rgb(211_33_39/0.16),transparent_65%)]"
      />

      <Container className="relative grid grid-cols-1 gap-12 pt-[110px] pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pt-[170px] lg:pb-24">
        <div>
          <Rise>
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-grey-300">
                {breadcrumbs.map((crumb, i) => {
                  const isLast = i === breadcrumbs.length - 1;
                  return (
                    <li key={crumb.href} className="flex items-center gap-1.5">
                      {i > 0 && (
                        <ChevronRight
                          aria-hidden="true"
                          className="size-3.5 text-grey-500"
                        />
                      )}
                      {isLast ? (
                        <span aria-current="page" className="text-white/80">
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="transition-colors hover:text-white"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </Rise>

          {section.eyebrow && (
            <Rise delay={0.06}>
              <p className="mt-7 flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-red-500 uppercase">
                <span aria-hidden="true" className="h-px w-8 bg-red-500" />
                {section.eyebrow}
              </p>
            </Rise>
          )}

          <Rise delay={0.12}>
            <h1
              id={`${id}-heading`}
              className="mt-6 text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[50px]"
            >
              {section.heading}
            </h1>
          </Rise>

          {section.subheading && (
            <Rise delay={0.18}>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-grey-300">
                {section.subheading}
              </p>
            </Rise>
          )}

          <Rise delay={0.24}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button href={site.phoneHref} size="lg" withPhoneIcon>
                {phoneCtaLabel}
              </Button>
              {section.secondaryCtaLabel && section.secondaryCtaHref && (
                <Button
                  href={section.secondaryCtaHref}
                  variant="outline"
                  size="lg"
                  withArrow
                >
                  {section.secondaryCtaLabel}
                </Button>
              )}
            </div>
          </Rise>

          {section.credentials.length > 0 && (
            <Rise delay={0.32}>
              <ul className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:flex-wrap sm:gap-x-8">
                {section.credentials.map((credential, i) => {
                  const Icon = navIcons[credential.icon];
                  return (
                    <li
                      key={credential._key}
                      className="flex items-center gap-2.5 text-[14px] font-semibold text-white/90"
                    >
                      {section.showAvailabilityDot && i === 0 && (
                        <span
                          aria-hidden="true"
                          className="availability-dot size-1.5 shrink-0 rounded-full bg-red-500"
                        />
                      )}
                      <Icon
                        aria-hidden="true"
                        className="size-[18px] text-red-500"
                      />
                      {credential.label}
                    </li>
                  );
                })}
              </ul>
            </Rise>
          )}
        </div>

        {/* Tall image slot — subtly offset, no badge */}
        {/* Width lives on the grid item: justify-self-end makes it shrink-to-fit,
            and a fill Image contributes no intrinsic size — without lg:w-full the
            box collapses to 0×0 the moment a real photo replaces the placeholder. */}
        <Rise delay={0.2} className="hidden lg:block lg:w-full lg:max-w-[440px] lg:justify-self-end">
          <div className="relative aspect-[3/4] w-full rotate-1 overflow-hidden rounded-2xl border border-white/10 shadow-(--shadow-card-lg)">
            {section.photo ? (
              <Image
                src={section.photo.url}
                alt={section.photo.alt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder
                label={
                  section.photoSubject ??
                  "A Fred's Plumbing technician at work — vertical orientation"
                }
              />
            )}
          </div>
        </Rise>
      </Container>

      <svg
        aria-hidden="true"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="relative block h-10 w-full text-white sm:h-16"
      >
        <path
          d="M0 64h1440V22C1200 2 960 0 720 12S240 44 0 30v34Z"
          fill="currentColor"
        />
      </svg>
    </section>
  );
}
