import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { industryHref, type Industry } from "@/data/industries";
import { homePageDefaults, type HomeIndustriesContent } from "@/data/homePage";
import { chunkBalancedRows } from "@/lib/iconCardRows";
import { cn } from "@/lib/utils";

/**
 * Card width at `lg`+, keyed by the section's largest row (rows use the same
 * `lg:gap-5` = 1.25rem gaps) — the shared balancing treatment, so a shorter
 * row centres at the same card size instead of stretching.
 */
const CARD_WIDTH_AT_LG: Record<number, string> = {
  1: "lg:w-full",
  2: "lg:w-[calc((100%-1.25rem)/2)]",
  3: "lg:w-[calc((100%-2.5rem)/3)]",
  4: "lg:w-[calc((100%-3.75rem)/4)]",
};

/**
 * The dark property-types band, per the client's reference homepage: intro
 * copy with a Contact Us button and a photo slot up top, then one card per
 * document in the Property Types collection — photo, name, blurb, link to
 * the detail page — in balanced centred rows (max 4 per row at `lg`+ via
 * chunkBalancedRows; five cards show 3 + 2, never a stretched orphan).
 * Replaces the old tabs/accordion explorer, whose per-type bullet lists the
 * reference layout doesn't carry.
 */
export function IndustriesSection({
  industries,
  content = homePageDefaults.industries,
  titleId = "industries-heading",
}: {
  industries: Industry[];
  content?: HomeIndustriesContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  // Chunk with the original index attached so the Reveal stagger keeps
  // counting across row boundaries.
  const rows = chunkBalancedRows(
    industries.map((industry, index) => ({ industry, index })),
  );
  const maxRow = rows[0]?.length ?? 1;

  return (
    <section
      aria-labelledby={titleId}
      className="relative isolate overflow-hidden bg-navy-900 py-16 sm:py-24 lg:py-28"
    >
      <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_85%_15%,rgb(211_33_39/0.12),transparent_60%)]"
      />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <Reveal>
              <SectionHeading
                titleId={titleId}
                eyebrow={content.eyebrow}
                title={content.heading}
                description={content.description}
                theme="dark"
              />
            </Reveal>
            <Reveal delay={0.12}>
              <div className="mt-9">
                <Button href="/contact" withArrow>
                  Contact Us
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 shadow-(--shadow-card-lg)"
              style={{ aspectRatio: content.photo?.ratio ?? 16 / 10 }}
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
                  icon={Building2}
                  tone="steel"
                />
              )}
            </div>
          </Reveal>
        </div>

        {/* One flat grid below lg (rows are display:contents so the cards
            wrap 1-per-row / 2-per-row in order); at lg each row becomes its
            own centred flex line. */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:block lg:space-y-5">
          {rows.map((row) => (
            <div
              key={row[0].industry.slug}
              className="contents lg:flex lg:justify-center lg:gap-5"
            >
              {row.map(({ industry, index }) => (
                <div
                  key={industry.slug}
                  className={cn("min-w-0", CARD_WIDTH_AT_LG[maxRow])}
                >
                  <Reveal delay={index * 0.06} className="h-full">
                    <Link
                      href={industryHref(industry.slug)}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:border-white/25 hover:bg-white/10"
                    >
                      <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden">
                        {industry.photo ? (
                          <Image
                            src={industry.photo.url}
                            alt={industry.photo.alt}
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover"
                          />
                        ) : (
                          <ImagePlaceholder
                            label={industry.imageAlt}
                            icon={Building2}
                            showCaption={false}
                          />
                        )}
                      </div>
                      <h3 className="text-[17px] font-bold tracking-tight text-white">
                        {industry.title}
                      </h3>
                      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-grey-300">
                        {industry.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-white">
                        Explore {industry.title}
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 text-red-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </Link>
                  </Reveal>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
