import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { navIcons } from "@/components/layout/navIcons";
import { cn } from "@/lib/utils";
import type { ServiceHeroSection as HeroData } from "@/data/serviceSections";
import type { SiteContent } from "@/data/site";

export interface Breadcrumb {
  label: string;
  href: string;
}

interface ServiceHeroSectionProps {
  section: HeroData;
  site: SiteContent;
  /** Trail ending at the current page (last item is not linked). May be
   * empty on pages without a breadcrumb trail — the nav row is skipped. */
  breadcrumbs: Breadcrumb[];
  id: string;
  /**
   * Multi-paragraph intro, for callers whose copy is an array rather than the
   * single `subheading` a CMS section carries (the legal pages: the Privacy
   * Policy opens with two paragraphs). Replaces `section.subheading` when
   * given; section-stack callers never pass it, so their banner is unchanged.
   */
  subheadings?: string[];
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
 * Service-page hero — one style everywhere: a shallow full-width banner over
 * the section's photo (dark navy wash when no photo is set), darkened with a
 * navy gradient so the content passes contrast: breadcrumbs, the red-rule
 * eyebrow, H1, subheading at a readable measure, and — only where the data
 * sets them — CTA buttons and the credentials strip.
 *
 * Everything is LEFT-aligned against the shared `Container`, so the H1 sits on
 * the same left edge as every section below it. That is the site convention:
 * the Partners/Careers-adjacent heroes, the legacy detail hero, the legal
 * layout, and `SectionHeading align="left"` all read this way, including the
 * eyebrow's single leading rule.
 */
export function ServiceHeroSection({
  section,
  site,
  breadcrumbs,
  id,
  subheadings,
}: ServiceHeroSectionProps) {
  const phoneCtaLabel = section.phoneCtaLabel?.replace("{phone}", site.phone);
  const secondaryCta =
    section.secondaryCtaLabel && section.secondaryCtaHref
      ? { label: section.secondaryCtaLabel, href: section.secondaryCtaHref }
      : undefined;
  const hasCtas = Boolean(phoneCtaLabel ?? secondaryCta);
  // Absent means on — only an explicit Studio opt-out (photo already dark
  // or carrying its own baked-in overlay) turns the gradient off.
  const darkOverlay = section.darkOverlay !== false;

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative isolate overflow-hidden bg-navy-950"
    >
      {/* Background: the section's photo under a navy gradient, or the
          blueprint wash that ImagePlaceholder uses when no photo is set. */}
      {section.photo ? (
        <>
          <Image
            src={section.photo.url}
            alt={section.photo.alt}
            fill
            // Above the fold; `priority` is deprecated in Next 16
            // (node_modules/next/dist/docs/01-app/03-api-reference/
            // 02-components/image.md) in favor of loading="eager".
            loading="eager"
            sizes="100vw"
            className="object-cover"
          />
          {darkOverlay && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-950/70 to-navy-950/85"
            />
          )}
        </>
      ) : (
        <>
          <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgb(27_48_73/0.9),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_80%,rgb(211_33_39/0.16),transparent_65%)]"
          />
        </>
      )}

      {/* Shallow banner: height comes from the content + padding, never 100vh. */}
      <Container
        className={cn(
          // No `items-center`: children stretch to the container and constrain
          // themselves with their own max-widths, which keeps the H1's wrap
          // points independent of how long the line happens to be.
          "relative flex flex-col pt-[110px] pb-14 lg:pt-[160px] lg:pb-20",
          // Readability floor with the overlay off: a soft navy text-shadow
          // (inherited by every line in the banner) keeps white text legible
          // over an unknown photo, and is near-invisible over a dark one.
          section.photo &&
            !darkOverlay &&
            "[text-shadow:0_1px_2px_rgb(7_17_31/0.6),0_2px_18px_rgb(7_17_31/0.45)]",
        )}
      >
        {breadcrumbs.length > 0 && (
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
        )}

        {section.eyebrow && (
          <Rise delay={0.06}>
            {/* One leading rule, acting as a bullet — the trailing rule only
                belongs on a symmetric, centred eyebrow. */}
            <p className="mt-8 flex items-center gap-3 eyebrow text-red-500">
              <span aria-hidden="true" className="h-px w-8 bg-red-500" />
              {section.eyebrow}
            </p>
          </Rise>
        )}

        <Rise delay={0.12}>
          <h1
            id={`${id}-heading`}
            // max-w-3xl, not 4xl: the wider measure was there to keep a
            // centred headline balanced on both sides. Left-aligned it just
            // leaves a long first line and a stub second one — 3xl is what
            // every other left-aligned banner on the site uses.
            className="mt-5 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[50px]"
          >
            {section.heading}
          </h1>
        </Rise>

        {subheadings ? (
          <Rise delay={0.18}>
            <div className="mt-6 max-w-[65ch] space-y-4">
              {subheadings.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[18px] leading-relaxed text-grey-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </Rise>
        ) : (
          section.subheading && (
            <Rise delay={0.18}>
              <p className="mt-6 max-w-[65ch] text-[18px] leading-relaxed text-grey-300">
                {section.subheading}
              </p>
            </Rise>
          )
        )}

        {hasCtas && (
          <Rise delay={0.24}>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {phoneCtaLabel && (
                <Button href={site.phoneHref} size="lg" withPhoneIcon>
                  {phoneCtaLabel}
                </Button>
              )}
              {secondaryCta && (
                <Button
                  href={secondaryCta.href}
                  variant="outline"
                  size="lg"
                  withArrow
                >
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          </Rise>
        )}

        {section.credentials.length > 0 && (
          <Rise delay={0.32}>
            <ul className="mt-10 flex flex-col items-start gap-4 border-t border-white/10 pt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
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
