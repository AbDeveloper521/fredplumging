import type { AboutSection } from "@/data/aboutPage";
import type { SiteContent } from "@/data/site";
import type { Testimonial } from "@/data/testimonials";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import { AboutHeroSection } from "@/components/sections/AboutHeroSection";
import { AboutStorySection } from "@/components/sections/AboutStorySection";
import { AboutEvolutionSection } from "@/components/sections/AboutEvolutionSection";
import { ValuesGridSection } from "@/components/sections/ValuesGridSection";
import { PageLinksSection } from "@/components/sections/PageLinksSection";
import { IconCardSection } from "@/components/sections/IconCardSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { LocationMapSection } from "@/components/sections/LocationMapSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";

interface AboutSectionRendererProps {
  sections: AboutSection[];
  site: SiteContent;
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
}

/**
 * Maps the About-page section stack to its components. Sections can be
 * duplicated in Studio, so every DOM id derives from the item's `_key` —
 * never a fixed string. The shared library types render through the same
 * components the homepage/service stacks use.
 */
export function AboutSectionRenderer({
  sections,
  site,
  testimonials,
  profile,
}: AboutSectionRendererProps) {
  return (
    <>
      {/* Belt-and-braces: the mapper already skips hidden CMS sections. */}
      {sections.filter((section) => section.hidden !== true).map((section) => {
        const id = `about-${section._key}-heading`;
        switch (section._type) {
          case "aboutHero":
            return (
              <AboutHeroSection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
          case "aboutStory":
            return (
              <AboutStorySection
                key={section._key}
                site={site}
                content={section}
                titleId={id}
              />
            );
          case "aboutEvolution":
            return (
              <AboutEvolutionSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "valuesGrid":
            return (
              <ValuesGridSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "pageLinks":
            return (
              <PageLinksSection
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
                id={`about-${section._key}`}
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
