import Image from "next/image";
import { Clock, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";
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
}: {
  photo?: CmsPhoto;
  fallbackLabel: string;
  sizes: string;
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
    <ImagePlaceholder label={fallbackLabel} icon={Users} />
  );
}

/**
 * About band: one photo with the red 24/7 Emergency badge on the left, copy
 * right. (The small overlapping second photo was removed at the owner's
 * request — the homepage AboutSection still carries the full collage.)
 * A `background: "dark"` variant serves heritage-style second appearances
 * further down the page.
 */
export function ServiceAboutSection({ section, id }: ServiceAboutSectionProps) {
  const dark = section.background === "dark";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative isolate overflow-hidden py-16 sm:py-24 lg:py-28",
        dark ? "bg-navy-900" : "bg-white",
      )}
    >
      {dark && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_85%_15%,rgb(211_33_39/0.12),transparent_60%)]"
        />
      )}
      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Image collage — brand continuity anchor */}
          <Reveal className="relative">
            <div className="relative">
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl shadow-(--shadow-card-lg)",
                  dark && "border border-white/10",
                )}
                // Square by design; the editor's "Frame shape" override
                // travels on the resolved photo's ratio.
                style={{ aspectRatio: section.photoPrimary?.ratio ?? 1 }}
              >
                <CollagePhoto
                  photo={section.photoPrimary}
                  fallbackLabel={
                    section.photoSubjectPrimary ??
                    "A Fred's Plumbing technician on the job"
                  }
                  sizes="(min-width: 1320px) 580px, (min-width: 1024px) 46vw, 100vw"
                />
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
              <SectionHeading
                titleId={`${id}-heading`}
                title={section.heading}
                theme={dark ? "dark" : "light"}
              />
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-6 space-y-5">
                {section.paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={cn(
                      "text-[17px] leading-relaxed",
                      dark ? "text-grey-300" : "text-grey-700",
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            {section.ctaLabel && section.ctaHref && (
              <Reveal delay={0.18}>
                <div className="mt-9">
                  <Button
                    href={section.ctaHref}
                    variant={dark ? "secondary" : "dark"}
                    withArrow
                  >
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
