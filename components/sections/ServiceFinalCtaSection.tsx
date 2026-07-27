import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { FinalCtaSection as FinalCtaData } from "@/data/serviceSections";
import type { SiteContent } from "@/data/site";

interface ServiceFinalCtaSectionProps {
  section: FinalCtaData;
  site: SiteContent;
  id: string;
}

/**
 * Closing band — deliberately distinct from the hero: centered, tighter
 * vertical rhythm, no image, no form.
 */
export function ServiceFinalCtaSection({ section, site, id }: ServiceFinalCtaSectionProps) {
  const phoneCtaLabel = (section.phoneCtaLabel ?? "Call {phone} Now").replace(
    "{phone}",
    site.phone,
  );
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-20 lg:py-24"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_45%_60%_at_50%_0%,rgb(211_33_39/0.14),transparent_65%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-red-600" />

      <Container className="relative max-w-[820px] text-center">
        <Reveal>
          <h2
            id={`${id}-heading`}
            className="text-[30px] leading-[1.12] font-extrabold tracking-tight text-balance text-white sm:text-4xl lg:text-[40px]"
          >
            {section.heading}
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-grey-300">
            {section.body}
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <span className="flex items-center gap-3">
              {section.showAvailabilityDot && (
                <span
                  aria-hidden="true"
                  className="availability-dot size-2 shrink-0 rounded-full bg-red-500"
                />
              )}
              <Button href={site.phoneHref} size="lg" withPhoneIcon>
                {phoneCtaLabel}
              </Button>
            </span>
            <Button
              href={section.secondaryCtaHref}
              variant="outline"
              size="lg"
              withArrow
            >
              {section.secondaryCtaLabel}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
