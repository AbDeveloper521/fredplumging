import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { homePageDefaults, type HomeServiceAreaContent } from "@/data/homePage";
import type { SiteContent } from "@/data/site";

/** Stylized, decorative DFW coverage map — replaces a heavy embedded map. */
function DfwMap() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 520 400"
      className="block h-auto w-full"
    >
      {/* Region silhouette */}
      <path
        d="M60 90c40-38 130-58 210-50s170 16 190 70c18 50-8 120-40 160s-110 76-190 70-140-30-160-80S22 126 60 90Z"
        fill="rgb(18 34 56)"
        stroke="rgb(255 255 255 / 0.08)"
        strokeWidth="2"
      />
      {/* Dotted urban texture */}
      <g fill="rgb(255 255 255 / 0.14)">
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 16 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={70 + col * 26}
              cy={80 + row * 22}
              r={((row * 7 + col * 5) % 3) * 0.6 + 0.7}
            />
          )),
        )}
      </g>
      {/* Highway-style connectors */}
      <path
        d="M150 210 Q 260 170 370 195"
        fill="none"
        stroke="rgb(228 42 49 / 0.55)"
        strokeWidth="2.5"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
      {/* Coverage radius */}
      <circle cx="262" cy="200" r="130" fill="none" stroke="rgb(228 42 49 / 0.2)" strokeWidth="1.5" />
      <circle cx="262" cy="200" r="88" fill="none" stroke="rgb(228 42 49 / 0.3)" strokeWidth="1.5" strokeDasharray="4 6" />

      {/* Fort Worth marker */}
      <g transform="translate(150 210)">
        <circle r="22" fill="rgb(228 42 49 / 0.12)" />
        <circle r="7" fill="#E42A31" />
        <circle r="7" fill="none" stroke="rgb(255 255 255 / 0.6)" strokeWidth="1.5" />
        <text y="42" textAnchor="middle" fill="rgb(255 255 255 / 0.85)" fontSize="14" fontWeight="700" fontFamily="inherit">
          Fort Worth
        </text>
      </g>
      {/* Dallas marker */}
      <g transform="translate(370 195)">
        <circle r="26" fill="rgb(228 42 49 / 0.14)" />
        <circle r="8" fill="#E42A31" />
        <circle r="8" fill="none" stroke="rgb(255 255 255 / 0.6)" strokeWidth="1.5" />
        <text y="46" textAnchor="middle" fill="rgb(255 255 255 / 0.85)" fontSize="14" fontWeight="700" fontFamily="inherit">
          Dallas
        </text>
      </g>
    </svg>
  );
}

export function ServiceAreaSection({
  site,
  content = homePageDefaults.serviceArea,
  titleId = "area-heading",
}: {
  site: SiteContent;
  content?: HomeServiceAreaContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className="bg-white py-16 sm:py-24 lg:py-28"
    >
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <SectionHeading
              titleId={titleId}
              eyebrow={content.eyebrow}
              title={content.heading}
              description={content.description}
            />
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {site.serviceAreaCities.map((city) => (
                <li key={city}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-grey-300 bg-offwhite px-4 py-2 text-sm font-semibold text-navy-900">
                    <MapPin aria-hidden="true" className="size-3.5 text-red-600" />
                    {city}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 rounded-xl border-l-4 border-red-600 bg-offwhite p-5">
              <p className="text-[15px] font-medium text-grey-700">
                {content.calloutBody}
              </p>
              <div className="mt-4">
                <Button href="/service-areas" variant="dark" withArrow>
                  Check Your Location
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Map card */}
        <Reveal delay={0.12}>
          <div className="relative overflow-hidden rounded-2xl bg-navy-950 p-6 shadow-(--shadow-card-lg) sm:p-8">
            <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold tracking-[0.12em] text-white/70 uppercase">
                  Coverage Map
                </p>
                <span className="flex items-center gap-2 rounded-full bg-white/8 px-3.5 py-1.5 text-xs font-bold text-white">
                  <span
                    aria-hidden="true"
                    className="availability-dot size-1.5 rounded-full bg-red-500"
                  />
                  Active service area
                </span>
              </div>
              <DfwMap />
              <p className="text-center text-xs font-medium text-white/40">
                Stylized coverage illustration — swap for /images/dfw-service-area.webp
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
