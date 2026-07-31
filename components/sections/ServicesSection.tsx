import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ServiceCard } from "@/components/ui/ServiceCard";
import type { Service } from "@/data/services";
import { homePageDefaults, type HomeServicesContent } from "@/data/homePage";

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
  const featured = services.filter((s) => s.featured);
  const supporting = services.filter((s) => !s.featured);

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

        {/* Two featured cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.08}>
              <ServiceCard service={service} featured />
            </Reveal>
          ))}
        </div>

        {/* Four supporting cards */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {supporting.map((service, i) => (
            <Reveal key={service.slug} delay={i * 0.06}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
