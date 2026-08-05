import type { PartnersSection } from "@/data/partnersPage";
import type { SiteContent } from "@/data/site";
import type { TrustLogo } from "@/data/navigation";
import type { Testimonial } from "@/data/testimonials";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import { PartnersHeroSection } from "@/components/sections/PartnersHeroSection";
import { VendorOnboardingSection } from "@/components/sections/VendorOnboardingSection";
import { PartnerPlatformsSection } from "@/components/sections/PartnerPlatformsSection";
import { PartnerCredentialsSection } from "@/components/sections/PartnerCredentialsSection";
import { IconCardSection } from "@/components/sections/IconCardSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ServiceFaqSection } from "@/components/sections/ServiceFaqSection";
import { LocationMapSection } from "@/components/sections/LocationMapSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";

interface PartnersSectionRendererProps {
  sections: PartnersSection[];
  site: SiteContent;
  trustLogos: TrustLogo[];
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
}

/**
 * Maps the Partners-page section stack to its components. Sections can be
 * duplicated in Studio, so every DOM id derives from the item's `_key` —
 * never a fixed string. Collection-driven sections keep the existing rule:
 * an empty collection hides the band.
 */
export function PartnersSectionRenderer({
  sections,
  site,
  trustLogos,
  testimonials,
  profile,
}: PartnersSectionRendererProps) {
  // The blurb is the switch: strip-only entries (Greystar, TDLR, …) stay out.
  const partners = trustLogos.filter((logo) => Boolean(logo.blurb));

  return (
    <>
      {/* Belt-and-braces: the mapper already skips hidden CMS sections. */}
      {sections.filter((section) => section.hidden !== true).map((section) => {
        const id = `partners-${section._key}-heading`;
        switch (section._type) {
          case "partnersHero":
            return (
              <PartnersHeroSection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
          case "vendorOnboarding":
            return (
              <VendorOnboardingSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "partnerPlatforms":
            return (
              <PartnerPlatformsSection
                key={section._key}
                partners={partners}
                content={section}
                titleId={id}
              />
            );
          case "partnerCredentials":
            return (
              <PartnerCredentialsSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "iconCardSection":
            // IconCardSection derives its own `${id}-heading` internally.
            return (
              <IconCardSection
                key={section._key}
                section={section}
                id={`partners-${section._key}`}
              />
            );
          case "serviceTestimonials":
            return testimonials.length > 0 ? (
              <TestimonialsSection
                key={section._key}
                testimonials={testimonials}
                site={site}
                profile={profile}
                heading={section.heading}
                titleId={id}
                filterTags={section.filterTags}
                limit={section.limit}
              />
            ) : null;
          case "serviceFaq":
            return (
              <ServiceFaqSection
                key={section._key}
                section={section}
                id={`partners-${section._key}`}
              />
            );
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
