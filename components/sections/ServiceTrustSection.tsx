import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconFeature } from "@/components/ui/IconFeature";
import { TrustLogoStrip } from "@/components/ui/TrustLogoStrip";
import { navIcons } from "@/components/layout/navIcons";
import type { ServiceTrustSection as TrustData } from "@/data/serviceSections";
import type { TrustLogo } from "@/data/navigation";

interface ServiceTrustSectionProps {
  section: TrustData;
  logos: TrustLogo[];
  id: string;
}

/**
 * Compact trust row — condenses the reference page's full-height "Trusted
 * Plumbing Professionals" section into heading + three inline icon features,
 * with the shared trust-logo strip underneath.
 */
export function ServiceTrustSection({ section, logos, id }: ServiceTrustSectionProps) {
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

        {section.showLogos && logos.length > 0 && (
          <Reveal delay={0.15}>
            <div className="mt-14 border-t border-grey-300/60 pt-10">
              <TrustLogoStrip logos={logos} />
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
