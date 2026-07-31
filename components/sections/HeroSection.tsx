import { Award } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmergencyContactForm } from "@/components/forms/EmergencyContactForm";
import { navIcons } from "@/components/layout/navIcons";
import { homePageDefaults, type HomeHeroContent } from "@/data/homePage";
import type { SiteContent } from "@/data/site";

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

  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-950"
    >
      {/*
        Cinematic background composition.
        Swap the gradient stack for /images/hero-commercial-plumbing.webp
        (professional technician at a commercial property, DFW context)
        behind the same navy overlay when photography is available.
      */}
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

      <Container className="relative grid grid-cols-1 gap-14 pt-[120px] pb-20 lg:min-h-[800px] lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pt-[170px] lg:pb-28">
        {/* Message */}
        <div>
          <Rise>
            <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-red-500 uppercase">
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
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-grey-300 sm:text-lg">
              {content.subcopy}
            </p>
          </Rise>

          <Rise delay={0.24}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button href="/contact" size="lg" withArrow className="sm:min-w-[240px]">
                Request Immediate Service
              </Button>
              <Button
                href={site.phoneHref}
                variant="phone"
                size="lg"
                withPhoneIcon
              >
                Call {site.phone}
              </Button>
            </div>
          </Rise>

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

          <Rise delay={0.4}>
            <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-white/12 bg-white/5 px-6 py-4 backdrop-blur-sm">
              <span className="flex size-12 items-center justify-center rounded-xl bg-red-600">
                <Award aria-hidden="true" className="size-6 text-white" />
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
        </div>

        {/* Conversion card */}
        <Rise delay={0.2} className="lg:w-full lg:max-w-[520px] lg:justify-self-end">
          <EmergencyContactForm site={site} />
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
