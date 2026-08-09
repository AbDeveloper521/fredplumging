import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { careersPageDefaults, type CareersHeroContent } from "@/data/careersPage";

/**
 * The /about/careers dark hero, per the owner's reference: centred eyebrow,
 * H1, and the hiring-voice paragraphs at a readable measure over an
 * optional Studio-uploaded background photo (service-hero treatment: wide
 * hotspot-aware crop, dark overlay defaulting on; no photo → the standard
 * navy wash). Carries the page's one H1. The wave hands off in the next
 * band's navy.
 */
export function CareersHeroSection({
  content = careersPageDefaults.hero,
  titleId = "careers-hero-heading",
}: {
  content?: CareersHeroContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  // Absent means on — only an explicit Studio opt-out (photo already dark
  // or carrying its own baked-in overlay) turns the gradient off.
  const darkOverlay = content.darkOverlay !== false;

  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-950"
    >
      {content.photo ? (
        <>
          <Image
            src={content.photo.url}
            alt={content.photo.alt}
            fill
            // Above the fold; `priority` is deprecated in Next 16 in favor
            // of loading="eager".
            loading="eager"
            sizes="100vw"
            className="object-cover"
          />
          {darkOverlay && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-950/70 to-navy-950/85"
            />
          )}
        </>
      ) : (
        <>
          <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgb(27_48_73/0.9),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_80%,rgb(211_33_39/0.16),transparent_65%)]"
          />
        </>
      )}

      <Container
        className={cn(
          "relative flex flex-col items-center pt-[120px] pb-16 text-center lg:pt-[190px] lg:pb-24",
          // Readability floor with the overlay off — same as the service
          // hero: a soft navy text-shadow keeps white text legible over an
          // unknown photo, near-invisible over a dark one.
          content.photo &&
            !darkOverlay &&
            "[text-shadow:0_1px_2px_rgb(7_17_31/0.6),0_2px_18px_rgb(7_17_31/0.45)]",
        )}
      >
        <p className="flex items-center gap-3 eyebrow text-red-500">
          <span aria-hidden="true" className="h-px w-8 bg-red-500" />
          {content.eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-red-500" />
        </p>
        <h1
          id={titleId}
          className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
        >
          {content.heading}
        </h1>
        {content.paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className="mt-6 max-w-2xl text-[18px] leading-relaxed text-grey-300"
          >
            {paragraph}
          </p>
        ))}
      </Container>

      {/* Wave hand-off, filled with the next band's navy (the shipped stack
          opens on the dark values band). */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="relative block h-10 w-full text-navy-950 sm:h-16"
      >
        <path
          d="M0 64h1440V22C1200 2 960 0 720 12S240 44 0 30v34Z"
          fill="currentColor"
        />
      </svg>
    </section>
  );
}
