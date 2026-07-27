import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { navIcons } from "@/components/layout/navIcons";
import { industryHref } from "@/data/industries";
import { cn } from "@/lib/utils";
import type { PropertyTypesSection as PropertyTypesData } from "@/data/serviceSections";

interface ServicePropertyTypesSectionProps {
  section: PropertyTypesData;
  id: string;
}

type Card = PropertyTypesData["cards"][number];

function CardMedia({ card }: { card: Card }) {
  if (!card.photo && !card.photoSubject) return null;
  return (
    <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden rounded-t-2xl">
      {card.photo ? (
        <Image
          src={card.photo.url}
          alt={card.photo.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      ) : (
        <ImagePlaceholder label={card.photoSubject ?? card.title} showCaption={false} />
      )}
    </div>
  );
}

/**
 * Property-card grid. Two modes per card: a slug makes it a link card into
 * /multifamily/[slug]; no slug makes it informational. Cards with a photo
 * (or an intended photo subject) show the image across the top instead of
 * the icon. Section background is configurable to keep page rhythm.
 */
export function ServicePropertyTypesSection({
  section,
  id,
}: ServicePropertyTypesSectionProps) {
  const background = section.background ?? "dark";
  const dark = background === "dark";

  const cardBase = dark
    ? "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
    : "border-grey-100 bg-white shadow-(--shadow-card) hover:shadow-(--shadow-card-lg)";

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative isolate overflow-hidden py-16 sm:py-24 lg:py-28",
        dark ? "bg-navy-900" : background === "white" ? "bg-white" : "bg-offwhite",
      )}
    >
      {dark && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_85%_15%,rgb(211_33_39/0.12),transparent_60%)]"
        />
      )}
      <Container className="relative">
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            theme={dark ? "dark" : "light"}
          />
        </Reveal>

        <ul
          className={cn(
            "mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2",
            section.cards.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
          )}
        >
          {section.cards.map((card, i) => {
            const Icon = navIcons[card.icon];
            const hasMedia = Boolean(card.photo ?? card.photoSubject);
            const inner = (
              <>
                <CardMedia card={card} />
                {!hasMedia && (
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      dark ? "border border-white/15 bg-white/5" : "bg-red-100",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn("size-5", dark ? "text-red-500" : "text-red-600")}
                    />
                  </span>
                )}
                <h3
                  className={cn(
                    "text-[17px] font-bold tracking-tight",
                    dark ? "text-white" : "text-navy-900",
                    !hasMedia && "mt-5",
                  )}
                >
                  {card.title}
                </h3>
                <p
                  className={cn(
                    "mt-2 flex-1 text-[14px] leading-relaxed",
                    dark ? "text-grey-300" : "text-grey-500",
                  )}
                >
                  {card.blurb}
                </p>
                {card.slug && (
                  <span
                    className={cn(
                      "mt-4 inline-flex items-center gap-1.5 text-sm font-bold",
                      dark ? "text-white" : "text-navy-900",
                    )}
                  >
                    See how we help
                    <ArrowUpRight
                      aria-hidden="true"
                      className={cn(
                        "size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                        dark ? "text-red-500" : "text-red-600",
                      )}
                    />
                  </span>
                )}
              </>
            );

            const cardClasses = cn(
              "flex h-full flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-200",
              cardBase,
            );

            return (
              <li key={card._key}>
                <Reveal delay={i * 0.06} className="h-full">
                  {card.slug ? (
                    <Link href={industryHref(card.slug)} className={cn("group", cardClasses)}>
                      {inner}
                    </Link>
                  ) : (
                    <article className={cardClasses}>{inner}</article>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>

        {section.ctaLabel && section.ctaHref && (
          <Reveal delay={0.15}>
            <div className="mt-11 flex justify-center">
              <Button
                href={section.ctaHref}
                variant="secondary"
                size="lg"
                withArrow
              >
                {section.ctaLabel}
              </Button>
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
