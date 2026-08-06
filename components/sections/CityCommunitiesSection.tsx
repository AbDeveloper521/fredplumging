import Image from "next/image";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { CityCommunitiesContent } from "@/data/cities";
import type { CmsPhoto } from "@/data/services";

interface CityCommunitiesSectionProps {
  section: CityCommunitiesContent;
  id: string;
}

function PairPhoto({
  photo,
  subject,
  sizes,
}: {
  photo?: CmsPhoto;
  subject?: string;
  sizes: string;
}) {
  if (!photo && !subject) return null;
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-(--shadow-card-lg)">
      {photo ? (
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <ImagePlaceholder label={subject ?? ""} icon={MapPin} />
      )}
    </div>
  );
}

/**
 * "Proudly Serving …" band: copy plus map-pin chips for the client's own
 * community list (never padded with extra cities), a pair of editable photo
 * slots, and the contact CTA. The photo pair renders only the slots that
 * carry a photo or an intended subject — zero slots collapses the row.
 */
export function CityCommunitiesSection({
  section,
  id,
}: CityCommunitiesSectionProps) {
  const hasPhotos = Boolean(
    section.photoPrimary ??
      section.photoSubjectPrimary ??
      section.photoSecondary ??
      section.photoSubjectSecondary,
  );
  const cta =
    section.ctaLabel && section.ctaHref
      ? { label: section.ctaLabel, href: section.ctaHref }
      : undefined;

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-offwhite py-16 sm:py-24 lg:py-28">
      <Container className="flex flex-col items-center text-center">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            description={section.body}
            align="center"
            className="max-w-3xl"
          />
        </Reveal>

        {section.communities.length > 0 && (
          <Reveal delay={0.1}>
            <ul className="mt-9 flex flex-wrap justify-center gap-2.5">
              {section.communities.map((community) => (
                <li key={community}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-grey-300 bg-white px-4 py-2 text-sm font-semibold text-navy-900">
                    <MapPin aria-hidden="true" className="size-3.5 text-red-600" />
                    {community}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {hasPhotos && (
          <Reveal delay={0.14} className="w-full">
            <div className="mx-auto mt-12 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
              <PairPhoto
                photo={section.photoPrimary}
                subject={section.photoSubjectPrimary}
                sizes="(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw"
              />
              <PairPhoto
                photo={section.photoSecondary}
                subject={section.photoSubjectSecondary}
                sizes="(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw"
              />
            </div>
          </Reveal>
        )}

        {cta && (
          <Reveal delay={0.18}>
            <div className="mt-11">
              <Button href={cta.href} size="lg" withArrow>
                {cta.label}
              </Button>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
