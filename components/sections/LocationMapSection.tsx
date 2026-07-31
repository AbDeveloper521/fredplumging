import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { SiteContent } from "@/data/site";

/**
 * Google-map band shared by the homepage stack and the service pages: copy
 * column on the left, embedded map on the right (stacked on mobile — same
 * two-column rhythm as the ServiceArea and CaseStudy bands). Heading,
 * supporting line and embed URL are edited in Site Settings; an empty or
 * non-embed URL hides the whole band. Plain Maps embed — no API key,
 * nothing billed.
 */
export function LocationMapSection({
  site,
  directionsUrl,
  titleId = "location-map-heading",
}: {
  site: SiteContent;
  /** Public Google listing URL for the "Get Directions" link (optional). */
  directionsUrl?: string;
  titleId?: string;
}) {
  const embedUrl = site.mapEmbedUrl;
  if (!embedUrl) return null;
  if (!embedUrl.startsWith("https://www.google.com/maps/embed")) {
    // A pasted <iframe> tag or arbitrary URL cannot be embedded safely.
    console.warn(
      "[site] mapEmbedUrl is not a Google Maps embed address (must start with " +
        "https://www.google.com/maps/embed) — the map band is hidden. Fix it in " +
        "Site Settings → “Map band — Google Maps embed address”.",
    );
    return null;
  }

  return (
    <section
      aria-labelledby={titleId}
      className="bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <Reveal>
            <SectionHeading
              titleId={titleId}
              title={site.mapHeading}
              description={site.mapDescription}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button href="/contact" withArrow>
                Request Service
              </Button>
              <Button href={site.phoneHref} variant="phone" withPhoneIcon>
                Call {site.phone}
              </Button>
            </div>
          </Reveal>
          {directionsUrl && (
            <Reveal delay={0.16}>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-1 text-sm font-bold text-navy-900 underline-offset-4 hover:text-red-600 hover:underline"
              >
                Get directions on Google Maps
                <ArrowUpRight aria-hidden="true" className="size-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.12}>
          <div className="overflow-hidden rounded-2xl border border-grey-300/60 shadow-card">
            <div className="relative aspect-[4/3] sm:aspect-[16/9]">
              <iframe
                src={embedUrl}
                title="Fred's Plumbing on Google Maps — Dallas–Fort Worth service area"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
