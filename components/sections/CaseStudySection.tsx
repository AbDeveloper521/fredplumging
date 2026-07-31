import Image from "next/image";
import { Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { navIcons } from "@/components/layout/navIcons";
import { homePageDefaults, type HomeCaseStudyContent } from "@/data/homePage";

export function CaseStudySection({
  content = homePageDefaults.caseStudy,
  titleId = "casestudy-heading",
}: {
  content?: HomeCaseStudyContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  const storyBlocks = content.storyBlocks.map((block) => ({
    icon: navIcons[block.icon],
    label: block.label,
    copy: block.copy,
  }));
  return (
    <section
      aria-labelledby={titleId}
      className="bg-offwhite py-16 sm:py-24 lg:py-28"
    >
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-(--shadow-card-lg)">
              {content.photo ? (
                <Image
                  src={content.photo.url}
                  alt={content.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder label={content.photoSubject} icon={Building2} />
              )}
            </div>
            <div className="absolute -bottom-5 right-6 rounded-xl bg-navy-900 px-5 py-3.5 text-white shadow-(--shadow-card-lg)">
              <p className="text-sm font-bold">{content.photoCardTitle}</p>
              <p className="mt-0.5 text-xs text-grey-300">
                {content.photoCardSubtitle}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <Badge variant="soft" className="mb-5">
              {content.badgeLabel}
            </Badge>
            <SectionHeading
              titleId={titleId}
              eyebrow={content.eyebrow}
              title={content.heading}
            />
          </Reveal>

          <div className="mt-9 space-y-6">
            {storyBlocks.map((block, i) => (
              <Reveal key={block.label} delay={0.08 + i * 0.07}>
                <div className="flex gap-4 rounded-xl border border-grey-100 bg-white p-5 shadow-(--shadow-card)">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-red-100">
                    <block.icon aria-hidden="true" className="size-5 text-red-600" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-extrabold tracking-[0.14em] text-red-600 uppercase">
                      {block.label}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-grey-700">
                      {block.copy}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
