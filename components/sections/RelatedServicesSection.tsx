import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/ui/ServiceCard";
import type { RelatedServicesSection as RelatedData } from "@/data/serviceSections";
import type { Service } from "@/data/services";

interface RelatedServicesSectionProps {
  section: RelatedData;
  /** Full resolved service list — cards are picked from it by slug. */
  services: Service[];
  /** Slug of the page being rendered, so it never links to itself. Absent
   * on non-service pages, where no card can be a self-link. */
  currentSlug?: string;
  id: string;
}

/**
 * Sibling-service cards (reuses the existing ServiceCard). Slugs that don't
 * resolve to a published service are skipped silently — a renamed service
 * must not leave a dead card.
 */
export function RelatedServicesSection({
  section,
  services,
  currentSlug,
  id,
}: RelatedServicesSectionProps) {
  const related = section.serviceSlugs
    .filter((slug) => slug !== currentSlug)
    .map((slug) => services.find((service) => service.slug === slug))
    .filter((service): service is Service => service !== undefined);

  if (related.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-offwhite py-16 sm:py-24 lg:py-28">
      <Container>
        <Reveal>
          <SectionHeading titleId={`${id}-heading`} title={section.heading} />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.07} className="h-full">
              <ServiceCard service={service} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
