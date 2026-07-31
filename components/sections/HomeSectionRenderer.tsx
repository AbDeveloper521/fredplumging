import type { HomeSection } from "@/data/homePage";
import type { SiteContent } from "@/data/site";
import type { Service } from "@/data/services";
import type { Industry } from "@/data/industries";
import type { Testimonial } from "@/data/testimonials";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import type { TrustLogo } from "@/data/navigation";
import type { Faq } from "@/data/faqs";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { AboutSection } from "@/components/sections/AboutSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { EmergencySection } from "@/components/sections/EmergencySection";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ComplianceSection } from "@/components/sections/ComplianceSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CaseStudySection } from "@/components/sections/CaseStudySection";
import { ServiceAreaSection } from "@/components/sections/ServiceAreaSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { LocationMapSection } from "@/components/sections/LocationMapSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";

interface HomeSectionRendererProps {
  sections: HomeSection[];
  site: SiteContent;
  services: Service[];
  industries: Industry[];
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
  trustLogos: TrustLogo[];
  faqs: Faq[];
}

/**
 * Maps the homepage section stack to the section components. Sections can
 * be duplicated in Studio, so every heading id derives from the item's
 * `_key` — never a fixed string. Collection-driven sections keep the
 * existing rule: an empty collection hides the band (a successful fetch
 * returning zero documents means the client removed the content on
 * purpose).
 */
export function HomeSectionRenderer({
  sections,
  site,
  services,
  industries,
  testimonials,
  profile,
  trustLogos,
  faqs,
}: HomeSectionRendererProps) {
  return (
    <>
      {/* Belt-and-braces: the mapper already skips hidden CMS sections. */}
      {sections.filter((section) => section.hidden !== true).map((section) => {
        const id = `home-${section._key}-heading`;
        switch (section._type) {
          case "homeHero":
            return (
              <HeroSection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
          case "homeTrustBar":
            return trustLogos.length > 0 ? (
              <TrustBar
                key={section._key}
                logos={trustLogos}
                tagline={section.tagline}
              />
            ) : null;
          case "homeAbout":
            return (
              <AboutSection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
          case "homeServices":
            return services.length > 0 ? (
              <ServicesSection
                key={section._key}
                services={services}
                content={section}
                titleId={id}
              />
            ) : null;
          case "homeEmergency":
            return (
              <EmergencySection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
          case "homeIndustries":
            return industries.length > 0 ? (
              <IndustriesSection
                key={section._key}
                industries={industries}
                content={section}
                titleId={id}
              />
            ) : null;
          case "homeWhyChooseUs":
            return (
              <WhyChooseUsSection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
          case "homeProcess":
            return (
              <ProcessSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "homeCompliance":
            return (
              <ComplianceSection
                key={section._key}
                logos={trustLogos}
                content={section}
                titleId={id}
              />
            );
          case "homeTestimonials":
            return testimonials.length > 0 ? (
              <TestimonialsSection
                key={section._key}
                testimonials={testimonials}
                site={site}
                profile={profile}
                heading={section.heading}
                titleId={id}
              />
            ) : null;
          case "homeCaseStudy":
            return (
              <CaseStudySection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "homeServiceArea":
            return (
              <ServiceAreaSection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
          case "homeFaq":
            return faqs.length > 0 ? (
              <FAQSection
                key={section._key}
                faqs={faqs}
                content={section}
                titleId={id}
              />
            ) : null;
          case "homeLocationMap":
            return (
              <LocationMapSection
                key={section._key}
                site={site}
                directionsUrl={profile.reviewsUrl}
                titleId={id}
              />
            );
          case "homeFinalCta":
            return (
              <FinalCTASection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
        }
      })}
    </>
  );
}
