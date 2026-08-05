import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconFeature } from "@/components/ui/IconFeature";
import { navIcons } from "@/components/layout/navIcons";
import type { ServiceTrustSection as TrustData } from "@/data/serviceSections";

interface ServiceTrustSectionProps {
  section: TrustData;
  id: string;
}

/**
 * Compact trust row — condenses the reference page's full-height "Trusted
 * Plumbing Professionals" section into heading + three inline icon features.
 * Vendor-platform logos live on the homepage only (TrustBar + compliance
 * band); the credentials band on service pages is AssociationBadgeStrip.
 */
export function ServiceTrustSection({ section, id }: ServiceTrustSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="bg-offwhite py-16 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            titleId={`${id}-heading`}
            title={section.heading}
            align="center"
            className="max-w-3xl"
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {section.items.map((item, i) => (
            <Reveal key={item._key} delay={i * 0.08}>
              <IconFeature
                icon={navIcons[item.icon]}
                title={item.title}
                description={item.description}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
