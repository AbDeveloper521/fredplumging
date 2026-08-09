import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AboutCollage } from "@/components/sections/AboutSection";
import type { AboutStoryContent } from "@/data/aboutPage";
import type { SiteContent } from "@/data/site";

/**
 * The /about story band: copy left, the shared photo collage right (the small
 * overlapping photo only when one is uploaded). The badge's "Since {year}"
 * title derives from Site Settings — only the line under it is stored copy.
 */
export function AboutStorySection({
  site,
  content,
  titleId,
}: {
  site: SiteContent;
  content: AboutStoryContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId: string;
}) {
  return (
    <section aria-labelledby={titleId} className="bg-white py-16 sm:py-24 lg:py-28">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <SectionHeading
              titleId={titleId}
              eyebrow={content.eyebrow}
              title={content.heading}
            />
          </Reveal>
          {content.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={0.08 + i * 0.06}>
              <p className="mt-6 text-[18px] leading-relaxed text-grey-700">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.12} className="relative">
          <AboutCollage
            badgeTitle={`Since ${site.foundedYear}`}
            badgeSubtitle={content.badgeSubtitle}
            primaryPhoto={content.photoPrimary}
            primaryLabel={content.photoSubjectPrimary}
            secondaryPhoto={content.photoSecondary}
            frameClass="border-white"
          />
        </Reveal>
      </Container>
    </section>
  );
}
