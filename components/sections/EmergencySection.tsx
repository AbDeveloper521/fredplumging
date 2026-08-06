import Image from "next/image";
import { Phone, Siren } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { navIcons } from "@/components/layout/navIcons";
import { homePageDefaults, type HomeEmergencyContent } from "@/data/homePage";
import type { SiteContent } from "@/data/site";

export function EmergencySection({
  site,
  content = homePageDefaults.emergency,
  titleId = "emergency-heading",
}: {
  site: SiteContent;
  content?: HomeEmergencyContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  const benefits = content.benefits.map((item) => ({
    icon: navIcons[item.icon],
    label: item.label,
  }));
  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-red-600 py-16 sm:py-24 lg:py-28"
    >
      {/* The reference's alarm-red band: navy shading for depth instead of
          the old navy band's red glow. */}
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0 opacity-40" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_15%_50%,rgb(7_17_31/0.28),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_center,rgb(7_17_31/0.35),transparent_70%)]"
      />

      <Container className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-white uppercase">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-white"
              />
              {content.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              id={titleId}
              className="mt-5 text-[32px] leading-[1.1] font-extrabold tracking-tight text-balance text-white sm:text-4xl lg:text-[46px]"
            >
              {content.heading}
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">
              {content.body}
            </p>
          </Reveal>

          {/* Dominant phone card — white on the red band */}
          <Reveal delay={0.2}>
            <a
              href={site.phoneHref}
              className="group mt-8 inline-flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-(--shadow-card-lg) transition-transform duration-200 hover:-translate-y-0.5 sm:gap-5 sm:px-8 sm:py-5"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-red-600 transition-transform duration-200 group-hover:scale-105 sm:size-14">
                <Phone aria-hidden="true" className="size-6 text-white sm:size-7" />
              </span>
              <span>
                <span className="block text-xs font-bold tracking-[0.14em] text-red-600 uppercase">
                  Give Us a Call!
                </span>
                <span className="font-heading mt-1 block text-3xl font-extrabold tracking-tight text-navy-900 sm:text-[40px]">
                  {site.phone}
                </span>
              </span>
            </a>
          </Reveal>

          <Reveal delay={0.26}>
            <ul className="mt-9 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-[15px] font-semibold text-white"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg border border-white/25 bg-white/10">
                    <Icon aria-hidden="true" className="size-4 text-white" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-10">
              <Button href="/contact" variant="outline" withArrow>
                Request Emergency Service
              </Button>
            </div>
          </Reveal>
        </div>

        {/* Visual */}
        <Reveal delay={0.15}>
          <div className="relative">
            <div
              className="relative max-h-[540px] w-full overflow-hidden rounded-2xl border border-white/10 shadow-(--shadow-card-lg)"
              style={{ aspectRatio: content.photo?.ratio ?? 4 / 5 }}
            >
              {content.photo ? (
                <Image
                  src={content.photo.url}
                  alt={content.photo.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder
                  label={content.photoSubject}
                  icon={Siren}
                  tone="steel"
                />
              )}
            </div>
            <div className="absolute -bottom-5 left-6 flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 shadow-(--shadow-card-lg)">
              <span
                aria-hidden="true"
                className="availability-dot size-2.5 rounded-full bg-red-600"
              />
              <p className="text-sm font-bold text-navy-900">
                {content.photoCaption}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
