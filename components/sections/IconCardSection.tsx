import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { navIcons } from "@/components/layout/navIcons";
import { chunkBalancedRows } from "@/lib/iconCardRows";
import { cn } from "@/lib/utils";
import type {
  IconCardColor,
  IconCardSection as IconCardData,
} from "@/data/serviceSections";

interface IconCardSectionProps {
  section: IconCardData;
  id: string;
}

/**
 * Card width at `lg`+, keyed by the section's largest row. Every card in the
 * section shares the width of a largest-row card (rows use the same
 * `lg:gap-6` = 1.5rem gaps), so a shorter row centres at the same card size
 * instead of stretching its cards wider than the row above.
 */
const CARD_WIDTH_AT_LG: Record<number, string> = {
  1: "lg:w-full",
  2: "lg:w-[calc((100%-1.5rem)/2)]",
  3: "lg:w-[calc((100%-3rem)/3)]",
  4: "lg:w-[calc((100%-4.5rem)/4)]",
};

/**
 * Surface + paired text/chip treatments per card colour. Presets only — the
 * pairing is what keeps every combination on brand and readable (navy/red
 * cards get white text and a translucent chip; light cards get ink text and
 * the demo's solid red chip).
 */
const CARD_STYLES: Record<
  IconCardColor,
  {
    surface: string;
    title: string;
    body: string;
    chip: string;
    chipIcon: string;
    cta: string;
    ctaArrow: string;
  }
> = {
  white: {
    surface: "border-grey-300/60 bg-white",
    title: "text-navy-900",
    body: "text-grey-700",
    chip: "bg-red-600",
    chipIcon: "text-white",
    cta: "text-navy-900 hover:text-red-600",
    ctaArrow: "text-red-600",
  },
  offwhite: {
    surface: "border-grey-300/60 bg-offwhite",
    title: "text-navy-900",
    body: "text-grey-700",
    chip: "bg-red-600",
    chipIcon: "text-white",
    cta: "text-navy-900 hover:text-red-600",
    ctaArrow: "text-red-600",
  },
  navy: {
    surface: "border-white/10 bg-navy-900",
    title: "text-white",
    body: "text-grey-300",
    chip: "bg-white/10",
    chipIcon: "text-white",
    cta: "text-white hover:text-red-500",
    ctaArrow: "text-red-500",
  },
  red: {
    surface: "border-white/10 bg-red-600",
    title: "text-white",
    body: "text-white/85",
    chip: "bg-white/15",
    chipIcon: "text-white",
    cta: "text-white hover:text-white/80",
    ctaArrow: "text-white",
  },
};

/**
 * Icon-card band: balanced centred rows of cards (max 4 per row at `lg`+ —
 * see chunkBalancedRows), each card an icon chip + title + description and
 * an optional bottom-pinned link. Below `lg` the row maths steps aside and
 * the cards simply wrap in document order: two per row on tablets, one on
 * phones. Background is a colour band or a photo; a photo always takes the
 * hero's dark wash so cards and heading stay readable.
 */
export function IconCardSection({ section, id }: IconCardSectionProps) {
  const hasPhoto = Boolean(section.photo);
  const dark = hasPhoto || section.background === "dark";
  const defaultColor = section.defaultCardColor ?? "white";
  const hasHeader = Boolean(section.heading ?? section.eyebrow);
  // Chunk with the original index attached so the Reveal stagger keeps
  // counting across row boundaries.
  const rows = chunkBalancedRows(
    section.cards.map((card, index) => ({ card, index })),
  );
  const maxRow = rows[0]?.length ?? 1;

  return (
    <section
      id={id}
      aria-labelledby={section.heading ? `${id}-heading` : undefined}
      className={cn(
        "relative isolate overflow-hidden py-16 sm:py-24 lg:py-28",
        dark ? "bg-navy-950" : "bg-offwhite",
      )}
    >
      {hasPhoto && section.photo ? (
        <>
          <Image
            src={section.photo.url}
            alt={section.photo.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Cards over a raw photo always need the hero's dark wash — no
              Studio toggle here on purpose. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-950/70 to-navy-950/85"
          />
        </>
      ) : dark ? (
        <>
          <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_50%_55%_at_85%_15%,rgb(211_33_39/0.12),transparent_60%)]"
          />
        </>
      ) : null}

      <Container className="relative">
        {hasHeader && (
          <Reveal>
            {section.heading ? (
              <SectionHeading
                titleId={`${id}-heading`}
                eyebrow={section.eyebrow}
                title={section.heading}
                align="center"
                theme={dark ? "dark" : "light"}
                className="max-w-3xl"
              />
            ) : (
              // Eyebrow with no heading — SectionHeading's eyebrow row alone.
              <p
                className={cn(
                  "flex items-center justify-center gap-3 text-center eyebrow",
                  dark ? "text-red-500" : "text-red-600",
                )}
              >
                <span aria-hidden="true" className="h-px w-8 bg-red-500" />
                {section.eyebrow}
                <span aria-hidden="true" className="h-px w-8 bg-red-500" />
              </p>
            )}
          </Reveal>
        )}

        {/* One flat grid below lg (rows are display:contents so the cards
            wrap 1-per-row / 2-per-row in order); at lg each row becomes its
            own centred flex line. */}
        <div
          className={cn(
            "grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:block lg:space-y-6",
            hasHeader && "mt-12",
          )}
        >
          {rows.map((row) => (
            <div
              key={row[0].card._key}
              className="contents lg:flex lg:justify-center lg:gap-6"
            >
              {row.map(({ card, index }) => {
                const Icon = navIcons[card.icon];
                const styles = CARD_STYLES[card.cardColor ?? defaultColor];
                const cta =
                  card.ctaLabel && card.ctaHref
                    ? { label: card.ctaLabel, href: card.ctaHref }
                    : undefined;
                return (
                  <div
                    key={card._key}
                    className={cn("min-w-0", CARD_WIDTH_AT_LG[maxRow])}
                  >
                    <Reveal delay={index * 0.06} className="h-full">
                      <article
                        className={cn(
                          "flex h-full flex-col rounded-2xl border p-7 shadow-card",
                          styles.surface,
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-12 items-center justify-center rounded-xl",
                            styles.chip,
                          )}
                        >
                          <Icon
                            aria-hidden="true"
                            className={cn("size-5", styles.chipIcon)}
                          />
                        </span>
                        <h3
                          className={cn(
                            "mt-5 text-lg font-extrabold tracking-tight",
                            styles.title,
                          )}
                        >
                          {card.title}
                        </h3>
                        <p
                          className={cn(
                            "mt-3 flex-1 text-[15px] leading-relaxed",
                            styles.body,
                          )}
                        >
                          {card.description}
                        </p>
                        {cta && (
                          <Link
                            href={cta.href}
                            className={cn(
                              "group mt-5 inline-flex items-center gap-1.5 self-start text-sm font-bold transition-colors",
                              styles.cta,
                            )}
                          >
                            {cta.label}
                            <ArrowUpRight
                              aria-hidden="true"
                              className={cn(
                                "size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                                styles.ctaArrow,
                              )}
                            />
                          </Link>
                        )}
                      </article>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
