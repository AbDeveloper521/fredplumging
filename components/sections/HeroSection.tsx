import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmergencyContactForm } from "@/components/forms/EmergencyContactForm";
import { navIcons } from "@/components/layout/navIcons";
import { homePageDefaults, type HomeHeroContent } from "@/data/homePage";
import type { SiteContent } from "@/data/site";
import { cn } from "@/lib/utils";

/** CSS-animated wrapper — hero entrances must not wait on JS hydration. */
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

export function HeroSection({
  site,
  content = homePageDefaults.hero,
  titleId = "hero-heading",
}: {
  site: SiteContent;
  content?: HomeHeroContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  const trustIndicators = content.trustIndicators.map((item) => ({
    icon: navIcons[item.icon],
    label: item.label.replace("{foundedYear}", String(site.foundedYear)),
  }));
  // Absent means on — only an explicit Studio opt-out (photo already dark or
  // carrying its own baked-in overlay) turns the gradient off.
  const darkOverlay = content.darkOverlay !== false;
  // Same rule for the "{years} Years" badge: absent means on.
  const showExperienceBadge = content.showExperienceBadge !== false;
  const BadgeIcon = navIcons[content.experienceBadgeIcon];
  // Each button renders only when its toggle is on AND it has the copy it
  // needs — the primary needs both a label and a link, the phone button its
  // label (the number itself always comes from Site Settings).
  const primaryCta =
    content.showPrimaryButton !== false && content.ctaLabel && content.ctaHref
      ? { label: content.ctaLabel, href: content.ctaHref }
      : undefined;
  const phoneCtaLabel =
    content.showPhoneButton !== false && content.phoneCtaLabel
      ? content.phoneCtaLabel.replace("{phone}", site.phone)
      : undefined;

  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-950"
    >
      {/* Background: the editor's photo under a navy gradient, or the styled
          navy wash when no photo is set. */}
      {content.photo ? (
        <>
          <Image
            src={content.photo.url}
            alt={content.photo.alt}
            fill
            // Above the fold; `priority` is deprecated in Next 16 in favor
            // of loading="eager" (see ServiceHeroSection).
            loading="eager"
            sizes="100vw"
            className="object-cover"
          />
          {darkOverlay && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-950/75 to-navy-950/85"
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
          {/* Skyline-suggestion band along the base */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-navy-900/80 to-transparent"
          />
        </>
      )}

      <Container
        className={cn(
          "relative grid grid-cols-1 gap-14 pt-[120px] pb-20 lg:min-h-[800px] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pt-[170px] lg:pb-28",
          // Readability floor with the overlay off: a soft navy text-shadow
          // keeps white text legible over an unknown photo, near-invisible
          // over a dark one (same treatment as the service hero).
          content.photo &&
            !darkOverlay &&
            "[text-shadow:0_1px_2px_rgb(7_17_31/0.6),0_2px_18px_rgb(7_17_31/0.45)]",
        )}
      >
        {/* Message */}
        <div>
          <Rise>
            <p className="flex items-center gap-3 eyebrow text-red-500">
              <span aria-hidden="true" className="h-px w-8 bg-red-500" />
              {content.eyebrow}
            </p>
          </Rise>

          <Rise delay={0.08}>
            <h1
              id={titleId}
              className="mt-6 text-[38px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[48px] lg:text-[54px] xl:text-[60px] lg:leading-[1.05]"
            >
              {content.headingBefore}
              {content.headingHighlight && (
                <>
                  {" "}
                  <span className="text-red-500">{content.headingHighlight}</span>
                </>
              )}
              {content.headingAfter && <> {content.headingAfter}</>}
            </h1>
          </Rise>

          <Rise delay={0.16}>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-grey-300 sm:text-[19px]">
              {content.subcopy}
            </p>
          </Rise>

          {/* Both buttons off in Studio → the row and its top margin go with
              them, so the intro runs straight into the trust strip. */}
          {(primaryCta ?? phoneCtaLabel) && (
            <Rise delay={0.24}>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                {primaryCta && (
                  <Button
                    href={primaryCta.href}
                    size="lg"
                    withArrow
                    className="sm:min-w-[220px]"
                  >
                    {primaryCta.label}
                  </Button>
                )}
                {phoneCtaLabel && (
                  <Button
                    href={site.phoneHref}
                    variant="phone"
                    size="lg"
                    withPhoneIcon
                  >
                    {phoneCtaLabel}
                  </Button>
                )}
              </div>
            </Rise>
          )}

          {/* Emptied in Studio → the divider rule and its spacing go with it,
              so the badge (or the buttons) simply ends the column. */}
          {trustIndicators.length > 0 && (
            <Rise delay={0.32}>
              <ul className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:flex-wrap sm:gap-x-8">
                {trustIndicators.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 text-[14px] font-semibold text-white/90"
                  >
                    <Icon aria-hidden="true" className="size-[18px] text-red-500" />
                    {label}
                  </li>
                ))}
              </ul>
            </Rise>
          )}

          {showExperienceBadge && (
            <Rise delay={0.4}>
              <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-white/12 bg-white/5 px-6 py-4 backdrop-blur-sm">
                <span className="flex size-12 items-center justify-center rounded-xl bg-red-600">
                  <BadgeIcon aria-hidden="true" className="size-6 text-white" />
                </span>
                <div>
                  <p className="font-heading text-[26px] leading-none font-extrabold text-white">
                    {site.yearsInBusiness} Years
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-grey-300">
                    {content.experienceBadgeLabel}
                  </p>
                </div>
              </div>
            </Rise>
          )}
        </div>

        {/* Conversion card */}
        <Rise delay={0.2} className="lg:w-full lg:max-w-[520px] lg:justify-self-end">
          <EmergencyContactForm
            site={site}
            heading={content.formHeading}
            intro={content.formIntro}
            submitLabel={content.formSubmitLabel}
          />
        </Rise>
      </Container>

      {/* Soft curved transition into the trust bar */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="relative block h-10 w-full text-white sm:h-16"
      >
        <path d="M0 64h1440V22C1200 2 960 0 720 12S240 44 0 30v34Z" fill="currentColor" />
      </svg>
    </section>
  );
}
