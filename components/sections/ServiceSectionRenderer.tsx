import type { ServiceSection } from "@/data/serviceSections";
import type { Service } from "@/data/services";
import type { SiteContent } from "@/data/site";
import type { TrustLogo } from "@/data/navigation";
import type { Testimonial } from "@/data/testimonials";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import { ServiceHeroSection, type Breadcrumb } from "./ServiceHeroSection";
import { ServiceAboutSection } from "./ServiceAboutSection";
import { WhatsIncludedSection } from "./WhatsIncludedSection";
import { SignsYouNeedSection } from "./SignsYouNeedSection";
import { ServiceProcessSection } from "./ServiceProcessSection";
import { ComparisonTableSection } from "./ComparisonTableSection";
import { ServiceTrustSection } from "./ServiceTrustSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { ServicePropertyTypesSection } from "./ServicePropertyTypesSection";
import { ServiceFaqSection } from "./ServiceFaqSection";
import { ServiceAreaCmsSection } from "./ServiceAreaCmsSection";
import { TrustLogoStripSection } from "./TrustLogoStripSection";
import { RelatedServicesSection } from "./RelatedServicesSection";
import { ServiceFinalCtaSection } from "./ServiceFinalCtaSection";

/**
 * Stable in-page ids per section type — used for aria-labelledby and as
 * anchor targets (e.g. a What's-Included row linking to #repair-or-replace).
 * A repeated type gets a -2, -3… suffix so ids stay unique.
 */
const SECTION_IDS: Record<ServiceSection["_type"], string> = {
  serviceHero: "service-hero",
  serviceAbout: "about-service",
  whatsIncluded: "whats-included",
  signsYouNeed: "warning-signs",
  processSteps: "how-we-work",
  comparisonTable: "repair-or-replace",
  serviceTrust: "why-trust-us",
  serviceTestimonials: "client-reviews",
  propertyTypes: "property-types",
  serviceFaq: "service-faq",
  serviceArea: "service-area",
  trustLogoStrip: "trust-badges",
  relatedServices: "related-services",
  finalCta: "final-cta",
};

interface ServiceSectionRendererProps {
  sections: ServiceSection[];
  site: SiteContent;
  /** Slug of the service being rendered (self-link guard for related cards). */
  currentSlug: string;
  breadcrumbs: Breadcrumb[];
  services: Service[];
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
  trustLogos: TrustLogo[];
}

/**
 * Renders a service document's ordered section stack. Every section is
 * self-contained (own background, own vertical padding), so any subset in
 * any order renders without layout artifacts.
 */
export function ServiceSectionRenderer({
  sections,
  site,
  currentSlug,
  breadcrumbs,
  services,
  testimonials,
  profile,
  trustLogos,
}: ServiceSectionRendererProps) {
  const seen = new Map<string, number>();

  return (
    <>
      {sections.map((section) => {
        const count = (seen.get(section._type) ?? 0) + 1;
        seen.set(section._type, count);
        const base = SECTION_IDS[section._type];
        const id = count === 1 ? base : `${base}-${count}`;

        switch (section._type) {
          case "serviceHero":
            return (
              <ServiceHeroSection
                key={section._key}
                section={section}
                site={site}
                breadcrumbs={breadcrumbs}
                id={id}
              />
            );
          case "serviceAbout":
            return <ServiceAboutSection key={section._key} section={section} id={id} />;
          case "whatsIncluded":
            return <WhatsIncludedSection key={section._key} section={section} id={id} />;
          case "signsYouNeed":
            return <SignsYouNeedSection key={section._key} section={section} id={id} />;
          case "processSteps":
            return <ServiceProcessSection key={section._key} section={section} id={id} />;
          case "comparisonTable":
            return <ComparisonTableSection key={section._key} section={section} id={id} />;
          case "serviceTrust":
            return (
              <ServiceTrustSection
                key={section._key}
                section={section}
                logos={trustLogos}
                id={id}
              />
            );
          case "serviceTestimonials":
            return (
              <TestimonialsSection
                key={section._key}
                testimonials={testimonials}
                site={site}
                profile={profile}
                heading={section.heading}
                titleId={`${id}-heading`}
                filterTags={section.filterTags}
                limit={section.limit}
              />
            );
          case "propertyTypes":
            return (
              <ServicePropertyTypesSection key={section._key} section={section} id={id} />
            );
          case "serviceFaq":
            return <ServiceFaqSection key={section._key} section={section} id={id} />;
          case "serviceArea":
            return (
              <ServiceAreaCmsSection
                key={section._key}
                section={section}
                site={site}
                id={id}
              />
            );
          case "trustLogoStrip":
            return (
              <TrustLogoStripSection
                key={section._key}
                section={section}
                logos={trustLogos}
                id={id}
              />
            );
          case "relatedServices":
            return (
              <RelatedServicesSection
                key={section._key}
                section={section}
                services={services}
                currentSlug={currentSlug}
                id={id}
              />
            );
          case "finalCta":
            return (
              <ServiceFinalCtaSection
                key={section._key}
                section={section}
                site={site}
                id={id}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
