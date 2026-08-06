import Image from "next/image";
import { CheckCircle2, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { StatCard } from "@/components/ui/StatCard";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { navIcons } from "@/components/layout/navIcons";
import { homePageDefaults, type HomeAboutContent } from "@/data/homePage";
import type { CmsPhoto } from "@/data/services";
import type { SiteContent } from "@/data/site";

/**
 * The brand photo collage: large photo, overlapping small photo, red badge,
 * accent line. Extracted so the /about story section can reuse the exact
 * composition; the homepage section below renders it with its original
 * defaults, pixel-for-pixel unchanged.
 */
export function AboutCollage({
  badgeTitle,
  badgeSubtitle,
  primaryPhoto,
  primaryLabel,
  secondaryPhoto,
  secondaryLabel,
  /** Matches the section background so the overlap frame blends in. */
  frameClass = "border-offwhite",
}: {
  badgeTitle: string;
  badgeSubtitle: string;
  primaryPhoto?: CmsPhoto;
  primaryLabel: string;
  secondaryPhoto?: CmsPhoto;
  secondaryLabel: string;
  frameClass?: string;
}) {
  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-2xl shadow-(--shadow-card-lg)"
        // 4:3 by design; the editor's "Frame shape" override travels on the
        // resolved photo's ratio. The overlapping secondary stays fixed —
        // its frame is part of the composition.
        style={{ aspectRatio: primaryPhoto?.ratio ?? 4 / 3 }}
      >
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={primaryPhoto.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder label={primaryLabel} icon={Users} />
        )}
      </div>
      {/* Overlapping secondary image */}
      <div
        className={`absolute -bottom-8 -right-3 hidden w-[46%] overflow-hidden rounded-2xl border-4 shadow-(--shadow-card-lg) sm:block lg:-right-8 ${frameClass}`}
      >
        <div className="relative aspect-[4/3]">
          {secondaryPhoto ? (
            <Image
              src={secondaryPhoto.url}
              alt={secondaryPhoto.alt}
              fill
              sizes="(min-width: 1024px) 23vw, 46vw"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder label={secondaryLabel} tone="steel" showCaption={false} />
          )}
        </div>
      </div>
      {/* Experience badge */}
      <div className="absolute -top-5 -left-3 rounded-xl bg-red-600 px-5 py-3.5 text-white shadow-[0_12px_28px_rgb(211_33_39/0.4)] lg:-left-6">
        <p className="font-heading text-2xl leading-none font-extrabold">
          {badgeTitle}
        </p>
        <p className="mt-1 text-xs font-semibold tracking-wide uppercase opacity-90">
          {badgeSubtitle}
        </p>
      </div>
      {/* Decorative accent line */}
      <div
        aria-hidden="true"
        className="absolute -bottom-4 left-10 hidden h-px w-40 bg-gradient-to-r from-red-500 to-transparent sm:block"
      />
    </div>
  );
}

export function AboutSection({
  site,
  content = homePageDefaults.about,
  titleId = "about-heading",
}: {
  site: SiteContent;
  content?: HomeAboutContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  // An unset metric value means "the years-in-business figure" — derived
  // from Site Settings so it can never quietly go stale.
  const metrics = content.metrics.map((metric) => ({
    value: metric.value ?? site.yearsInBusiness,
    label: metric.label,
    icon: navIcons[metric.icon],
  }));
  const paragraphs = content.description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section aria-labelledby={titleId} className="bg-offwhite py-16 sm:py-24 lg:py-28">
      <Container>
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Image composition */}
          <Reveal className="relative">
            <AboutCollage
              badgeTitle={`Since ${site.foundedYear}`}
              badgeSubtitle={content.badgeSubtitle}
              primaryPhoto={content.primaryPhoto}
              primaryLabel={content.primaryPhotoSubject}
              secondaryPhoto={content.secondaryPhoto}
              secondaryLabel={content.secondaryPhotoSubject}
            />
          </Reveal>

          {/* Copy */}
          <div>
            <Reveal>
              <SectionHeading
                titleId={titleId}
                eyebrow={content.eyebrow}
                title={content.heading}
              />
              {/* Blank-line breaks in the Studio text field become real
                  paragraphs — the heritage band carries two. */}
              <div className="mt-5 space-y-4">
                {paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-[17px] leading-relaxed text-grey-500"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>

            {content.highlights.length > 0 && (
              <Reveal delay={0.1}>
                <ul className="mt-8 space-y-3.5">
                  {content.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[16px] font-semibold text-navy-900">
                      <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-red-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal delay={0.18}>
              <div className="mt-10">
                <Button href="/about" variant="dark" withArrow>
                  Learn More
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Metrics row — only when the section carries metrics */}
        {metrics.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-grey-300/60 pt-12 sm:mt-24 lg:grid-cols-4">
              {metrics.map((metric) => (
                <StatCard
                  key={metric.label}
                  value={metric.value}
                  label={metric.label}
                  icon={metric.icon}
                />
              ))}
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
