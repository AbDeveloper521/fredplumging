import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { chunkBalancedRows } from "@/lib/iconCardRows";
import { cn } from "@/lib/utils";
import type { Service } from "@/data/services";
import { homePageDefaults, type HomeServicesContent } from "@/data/homePage";

/**
 * Card width at `lg`+, keyed by the section's largest row (rows use the same
 * `lg:gap-6` = 1.5rem gaps) — the Icon Card balancing treatment, so a
 * shorter row centres at the same card size instead of stretching.
 */
const CARD_WIDTH_AT_LG: Record<number, string> = {
  1: "lg:w-full",
  2: "lg:w-[calc((100%-1.5rem)/2)]",
  3: "lg:w-[calc((100%-3rem)/3)]",
  4: "lg:w-[calc((100%-4.5rem)/4)]",
};

/** Image `sizes` per largest row — cards are 1/maxRow wide at `lg`+. */
const CARD_SIZES_AT_LG: Record<number, string> = {
  1: "100vw",
  2: "(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw",
  3: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  4: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
};

/**
 * The services grid: uniform photo cards in balanced centred rows (max 4
 * per row at `lg`+ via chunkBalancedRows — five cards show 3 + 2, never a
 * stretched orphan; the old featured/supporting split sized cards by the
 * `featured` flag and broke the moment the service count changed). Below
 * `lg` the cards simply wrap in document order: two per row on tablets,
 * one on phones. Rows keep equal card heights — the card link stretches
 * and "Learn more" is pinned to the card bottom.
 */
export function ServicesSection({
  services,
  content = homePageDefaults.services,
  titleId = "services-heading",
}: {
  services: Service[];
  content?: HomeServicesContent;
  /** Unique per instance — sections can be duplicated in the Studio. */
  titleId?: string;
}) {
  // Chunk with the original index attached so the Reveal stagger keeps
  // counting across row boundaries.
  const rows = chunkBalancedRows(
    services.map((service, index) => ({ service, index })),
  );
  const maxRow = rows[0]?.length ?? 1;

  return (
    <section aria-labelledby={titleId} className="bg-white py-16 sm:py-24 lg:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              titleId={titleId}
              eyebrow={content.eyebrow}
              title={content.heading}
              description={content.description}
            />
          </Reveal>
          <Reveal delay={0.1} className="shrink-0">
            <Button href="/services" variant="secondary" withArrow>
              View All Plumbing Services
            </Button>
          </Reveal>
        </div>

        {/* One flat grid below lg (rows are display:contents so the cards
            wrap 1-per-row / 2-per-row in order); at lg each row becomes its
            own centred flex line. */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:block lg:space-y-6">
          {rows.map((row) => (
            <div
              key={row[0].service.slug}
              className="contents lg:flex lg:justify-center lg:gap-6"
            >
              {row.map(({ service, index }) => (
                <div
                  key={service.slug}
                  className={cn("min-w-0", CARD_WIDTH_AT_LG[maxRow])}
                >
                  <Reveal delay={index * 0.06} className="h-full">
                    <ServiceCard
                      service={service}
                      className="h-full"
                      sizes={CARD_SIZES_AT_LG[maxRow]}
                    />
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
