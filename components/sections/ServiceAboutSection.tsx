import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { ServiceAboutSection as AboutData } from "@/data/serviceSections";
import type { CmsPhoto } from "@/data/services";

interface ServiceAboutSectionProps {
  section: AboutData;
  id: string;
}

function CollagePhoto({
  photo,
  fallbackLabel,
  sizes,
  showCaption = true,
}: {
  photo?: CmsPhoto;
  fallbackLabel: string;
  sizes: string;
  showCaption?: boolean;
}) {
  return photo ? (
    <Image
      src={photo.url}
      alt={photo.alt}
      fill
      sizes={sizes}
      className="object-cover"
    />
  ) : (
    <ImagePlaceholder label={fallbackLabel} icon={Users} showCaption={showCaption} />
  );
}

/**
 * The ONE permitted use of the brand collage composition on a service page —
 * image cluster left with the red 24/7 Emergency badge, copy right. Every
 * other section must use its own distinct layout.
 */
export function ServiceAboutSection({ section, id }: ServiceAboutSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-white py-16 sm:py-24 lg:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Image collage — brand continuity anchor */}
          <Reveal className="relative">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-(--shadow-card-lg)">
                <CollagePhoto
                  photo={section.photoPrimary}
                  fallbackLabel={
                    section.photoSubjectPrimary ??
                    "A Fred's Plumbing technician on the job"
                  }
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <div className="absolute -bottom-8 -right-3 hidden w-[46%] overflow-hidden rounded-2xl border-4 border-white shadow-(--shadow-card-lg) sm:block lg:-right-8">
                <div className="relative aspect-[4/3]">
                  <CollagePhoto
                    photo={section.photoSecondary}
                    fallbackLabel={
                      section.photoSubjectSecondary ??
                      "The Fred's Plumbing crew with a branded service van"
                    }
                    sizes="(min-width: 1024px) 23vw, 46vw"
                    showCaption={false}
                  />
                </div>
              </div>
              {/* Red 24/7 Emergency badge */}
              <div className="absolute -top-5 -left-3 flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3.5 text-white shadow-[0_12px_28px_rgb(211_33_39/0.4)] lg:-left-6">
                <Clock aria-hidden="true" className="size-6" />
                <div>
                  <p className="font-heading text-xl leading-none font-extrabold">24/7</p>
                  <p className="mt-1 text-xs font-semibold tracking-wide uppercase opacity-90">
                    Emergency
                  </p>
                </div>
              </div>
              <div
                aria-hidden="true"
                className="absolute -bottom-4 left-10 hidden h-px w-40 bg-gradient-to-r from-red-500 to-transparent sm:block"
              />
            </div>
          </Reveal>

          {/* Copy */}
          <div>
            <Reveal>
              <SectionHeading titleId={`${id}-heading`} title={section.heading} />
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-6 space-y-5">
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-[17px] leading-relaxed text-grey-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            {section.ctaLabel && section.ctaHref && (
              <Reveal delay={0.18}>
                <div className="mt-9">
                  <Button href={section.ctaHref} variant="dark" withArrow>
                    {section.ctaLabel}
                  </Button>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
