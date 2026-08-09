import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TrustLogoStrip } from "@/components/ui/TrustLogoStrip";
import { vendorPlatformLogos, type TrustLogo } from "@/data/navigation";
import { homePageDefaults, type HomeComplianceContent } from "@/data/homePage";

/**
 * Statement band: a centred heading block over the vendor-platform logo
 * strip. Centred rather than left-aligned because the band is now a single
 * full-width column above a centred strip — the same shape as the process,
 * FAQ and trust bands. Left alignment belongs to bands with something
 * sitting beside the heading (services, property types).
 *
 * `content.items` is deliberately not rendered: the checklist, its CTA and
 * the mock status panel were removed from the design. The field survives in
 * the schema so the copy the owner already published isn't destroyed.
 */
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
    // Padding is tighter than the tall content bands: this one is now a
    // heading block and a logo strip, so the old py-28 left it looking empty.
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-950 py-14 sm:py-18 lg:py-20"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_20%,rgb(27_48_73/0.85),transparent_65%)]"
      />

      <Container className="relative">
        <Reveal>
          {/* The heading block takes the full container; the paragraph is
              held to ~70 characters so it doesn't run edge to edge. */}
          <SectionHeading
            titleId={titleId}
            eyebrow={content.eyebrow}
            title={content.heading}
            description={content.description}
            align="center"
            theme="dark"
            className="max-w-4xl"
            descriptionClassName="mx-auto max-w-[38rem]"
          />
        </Reveal>

        {/*
          Vendor-system logos — the same white-tile strip as the light
          sections. White tiles sit deliberately on the navy band and, unlike
          the old white-silhouette treatment (brightness-0 invert), they
          render uploads with baked-in backgrounds correctly instead of as
          blank rectangles. Hidden entirely when no logos exist.
        */}
        {vendors.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-12 border-t border-white/8 pt-9 lg:mt-14">
              <p className="mb-7 flex items-center justify-center gap-3 text-center eyebrow text-white/70">
                <span aria-hidden="true" className="h-px w-8 bg-white/25" />
                Trusted by Property Management Networks:
                <span aria-hidden="true" className="h-px w-8 bg-white/25" />
              </p>
              <TrustLogoStrip logos={vendors} />
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
