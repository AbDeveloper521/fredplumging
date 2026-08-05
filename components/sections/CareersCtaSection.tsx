import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { careersPageDefaults, type CareersCtaContent } from "@/data/careersPage";
import type { SiteContent } from "@/data/site";

/**
 * Careers-specific closing band. FinalCTASection was considered and rejected
 * here: it embeds QuoteRequestForm — a SALES form asking about property type
 * and service needed — which at the bottom of a careers page reads like an
 * application form that asks the wrong questions. Applications stay
 * mailto-only (no form backend; see JobOpeningsSection), so this band closes
 * with the two routes that actually work: email and phone (both from Site
 * Settings). Retired from the default careers stack — re-addable in Studio.
 */
export function CareersCtaSection({
  site,
  content = careersPageDefaults.cta,
  titleId = "careers-cta-heading",
}: {
  site: SiteContent;
  content?: CareersCtaContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_20%,rgb(27_48_73/0.9),transparent_65%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-red-600" />

      <Container className="relative">
        <Reveal>
          <SectionHeading
            titleId={titleId}
            eyebrow={content.eyebrow}
            title={content.heading}
            description={content.description}
            align="center"
            theme="dark"
          />
        </Reveal>
        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              href={`mailto:${site.email}?subject=${encodeURIComponent("Application — Fred's Plumbing")}`}
              size="lg"
            >
              <span className="inline-flex items-center gap-2.5">
                <Mail aria-hidden="true" className="size-[18px]" />
                Email {site.email}
              </span>
            </Button>
            <Button href={site.phoneHref} variant="phone" size="lg" withPhoneIcon>
              Call {site.phone}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
