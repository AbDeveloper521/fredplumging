import Image from "next/image";
import { Award } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { IconFeature } from "@/components/ui/IconFeature";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { navIcons } from "@/components/layout/navIcons";
import { homePage, type HomeWhyChooseUsContent } from "@/data/homePage";
import type { SiteContent } from "@/data/site";

export function WhyChooseUsSection({
  site,
  content = homePage.whyChooseUs,
}: {
  site: SiteContent;
  content?: HomeWhyChooseUsContent;
}) {
  // {yearsInBusiness} derives from Site Settings so the caption's figure
  // can never quietly age the way the old hardcoded "27+" did.
  const photoCaption = content.photoCaption.replace(
    "{yearsInBusiness}",
    site.yearsInBusiness,
  );
  return (
    <section
      aria-labelledby="why-heading"
      className="bg-white py-16 sm:py-24 lg:py-28"
    >
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* Sticky intro column */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <Reveal>
            <SectionHeading
              titleId="why-heading"
              eyebrow={content.eyebrow}
              title={content.heading}
              description={content.description}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-9">
              <Button href="/contact" withArrow>
                Start a Conversation
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="relative mt-12 hidden overflow-hidden rounded-2xl lg:block">
              <div className="relative aspect-[16/10]">
                {content.photo ? (
                  <Image
                    src={content.photo.url}
                    alt={content.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    label={content.photoSubject}
                    icon={Award}
                    tone="steel"
                  />
                )}
              </div>
              <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-4 py-2.5 backdrop-blur-sm">
                <p className="text-sm font-bold text-navy-900">
                  {photoCaption}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Stacked feature rows */}
        <div className="flex flex-col divide-y divide-grey-100">
          {content.features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.05} className="py-7 first:pt-0">
              <IconFeature
                icon={navIcons[feature.icon]}
                title={feature.title}
                description={feature.description}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
