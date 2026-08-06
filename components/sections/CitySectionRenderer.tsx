import type { CitySection } from "@/data/cities";
import type { SiteContent } from "@/data/site";
import type { Testimonial } from "@/data/testimonials";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import { ServiceHeroSection, type Breadcrumb } from "./ServiceHeroSection";
import { ServiceAboutSection } from "./ServiceAboutSection";
import { ServicePropertyTypesSection } from "./ServicePropertyTypesSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { IconCardSection } from "./IconCardSection";
import { ServiceFaqSection } from "./ServiceFaqSection";
import { ServiceFinalCtaSection } from "./ServiceFinalCtaSection";
import { CityCommunitiesSection } from "./CityCommunitiesSection";

interface CitySectionRendererProps {
  sections: CitySection[];
  site: SiteContent;
  /** Trail ending at the current city page (last item is not linked). */
  breadcrumbs: Breadcrumb[];
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
}

/**
 * Renders a city page's ordered section stack — shared library sections
 * reuse the exact service-page components, so a band edited in Studio
 * behaves identically on every page that carries it. Sections can be
 * duplicated in Studio, so every DOM id derives from the item's `_key`,
 * never a fixed string.
 */
export function CitySectionRenderer({
  sections,
  site,
  breadcrumbs,
  testimonials,
  profile,
}: CitySectionRendererProps) {
  return (
    <>
      {/* Belt-and-braces: the mapper already skips hidden CMS sections. */}
      {sections.filter((section) => section.hidden !== true).map((section) => {
        const id = `city-${section._key}`;
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
          case "propertyTypes":
            return (
              <ServicePropertyTypesSection
                key={section._key}
                section={section}
                id={id}
              />
            );
          case "serviceAbout":
            return (
              <ServiceAboutSection key={section._key} section={section} id={id} />
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
          case "cityCommunities":
            return (
              <CityCommunitiesSection
                key={section._key}
                section={section}
                id={id}
              />
            );
          case "iconCardSection":
            return <IconCardSection key={section._key} section={section} id={id} />;
          case "serviceFaq":
            return <ServiceFaqSection key={section._key} section={section} id={id} />;
          case "finalCta":
            return (
              <ServiceFinalCtaSection
                key={section._key}
                section={section}
                site={site}
                id={id}
              />
            );
        }
      })}
    </>
  );
}
