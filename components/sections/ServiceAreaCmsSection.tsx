import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { ServiceAreaSection as AreaData } from "@/data/serviceSections";
import type { SiteContent } from "@/data/site";

interface ServiceAreaCmsSectionProps {
  section: AreaData;
  site: SiteContent;
  id: string;
}

const AREA_LINKS = [
  { label: "Plumbing in Dallas", href: "/areas-we-serve/dallas" },
  { label: "Plumbing in Fort Worth", href: "/areas-we-serve/fort-worth" },
];

/**
 * Coverage section: copy + the city list from siteSettings (never hardcoded)
 * with map-pin chips, links into the area pages, one image slot right.
 */
export function ServiceAreaCmsSection({ section, site, id }: ServiceAreaCmsSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-white py-16 sm:py-24 lg:py-28">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <SectionHeading
              titleId={`${id}-heading`}
              title={section.heading}
              description={section.body}
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

          <Reveal delay={0.16}>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {AREA_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-[15px] font-bold text-navy-900 underline decoration-red-600/50 underline-offset-4 transition-colors hover:text-red-600"
                  >
                    {link.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 text-red-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-(--shadow-card-lg)">
            {section.photo ? (
              <Image
                src={section.photo.url}
                alt={section.photo.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder
                label={section.photoSubject ?? "The Dallas–Fort Worth skyline"}
                icon={MapPin}
              />
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
