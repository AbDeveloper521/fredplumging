import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { AboutEvolutionContent } from "@/data/aboutPage";

/** The /about dark band: growth/today copy left, one large photo right. */
export function AboutEvolutionSection({
  content,
  titleId,
}: {
  content: AboutEvolutionContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId: string;
}) {
  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_15%_20%,rgb(27_48_73/0.9),transparent_65%)]"
      />
      <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <SectionHeading
              titleId={titleId}
              eyebrow={content.eyebrow}
              title={content.heading}
              theme="dark"
            />
          </Reveal>
          {content.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={0.08 + i * 0.06}>
              <p className="mt-6 text-[17px] leading-relaxed text-grey-300">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.12}>
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10 shadow-(--shadow-card-lg)"
            style={{ aspectRatio: content.photo?.ratio ?? 4 / 3 }}
          >
            {content.photo ? (
              <Image
                src={content.photo.url}
                alt={content.photo.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder label={content.photoSubject} />
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
