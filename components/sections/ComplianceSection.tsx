import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ComplianceDashboardPanel } from "@/components/ui/ComplianceDashboardPanel";
import { TrustLogoStrip } from "@/components/ui/TrustLogoStrip";
import { vendorPlatformLogos, type TrustLogo } from "@/data/navigation";
import { homePageDefaults, type HomeComplianceContent } from "@/data/homePage";

export function ComplianceSection({
  logos,
  content = homePageDefaults.compliance,
  titleId = "compliance-heading",
}: {
  logos: TrustLogo[];
  content?: HomeComplianceContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  // Vendor platforms only — badges belong to the service-page strip.
  const vendors = vendorPlatformLogos(logos);
  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_20%,rgb(27_48_73/0.85),transparent_65%)]"
      />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <Reveal>
              <SectionHeading
                titleId={titleId}
                eyebrow={content.eyebrow}
                title={content.heading}
                description={content.description}
                theme="dark"
              />
            </Reveal>

            <Reveal delay={0.1}>
              <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
                {content.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-[15px] font-semibold text-white/90"
                  >
                    <CheckCircle2 aria-hidden="true" className="size-[18px] shrink-0 text-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10">
                <Button href="/contact" withArrow>
                  Discuss Vendor Requirements
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Compliance dashboard-style visual */}
          <Reveal delay={0.15}>
            <ComplianceDashboardPanel />
          </Reveal>
        </div>

        {/*
          Vendor-system logos — the same white-tile strip as the light
          sections. White tiles sit deliberately on the navy band and, unlike
          the old white-silhouette treatment (brightness-0 invert), they
          render uploads with baked-in backgrounds correctly instead of as
          blank rectangles. Hidden entirely when no logos exist.
        */}
        {vendors.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-16 border-t border-white/8 pt-10 lg:mt-20">
              <TrustLogoStrip logos={vendors} />
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
