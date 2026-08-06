import type { CareersSection } from "@/data/careersPage";
import type { SiteContent } from "@/data/site";
import type { JobPosting } from "@/data/jobs";
import type { Testimonial } from "@/data/testimonials";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import { CareersHeroSection } from "@/components/sections/CareersHeroSection";
import { CareerValuesSection } from "@/components/sections/CareerValuesSection";
import { JobOpeningsSection } from "@/components/sections/JobOpeningsSection";
import { CareerTraitsSection } from "@/components/sections/CareerTraitsSection";
import { HiringProcessSection } from "@/components/sections/HiringProcessSection";
import { CareersCtaSection } from "@/components/sections/CareersCtaSection";
import { IconCardSection } from "@/components/sections/IconCardSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { LocationMapSection } from "@/components/sections/LocationMapSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";

interface CareersSectionRendererProps {
  sections: CareersSection[];
  site: SiteContent;
  jobs: JobPosting[];
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
}

/**
 * Maps the Careers-page section stack to its components. Sections can be
 * duplicated in Studio, so every DOM id derives from the item's `_key` —
 * never a fixed string. Job cards stay collection-driven (the section item
 * holds only the heading and apply-button label); the JobOpeningsSection
 * keeps its own empty-state
 * card, so an empty collection still renders the band with the mailto
 * route.
 */
export function CareersSectionRenderer({
  sections,
  site,
  jobs,
  testimonials,
  profile,
}: CareersSectionRendererProps) {
  return (
    <>
      {/* Belt-and-braces: the mapper already skips hidden CMS sections. */}
      {sections.filter((section) => section.hidden !== true).map((section) => {
        const id = `careers-${section._key}-heading`;
        switch (section._type) {
          case "careersHero":
            return (
              <CareersHeroSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "careerValues":
            return (
              <CareerValuesSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "jobOpenings":
            return (
              <JobOpeningsSection
                key={section._key}
                jobs={jobs}
                site={site}
                heading={section.heading}
                applyLabel={section.applyLabel}
                id={`careers-${section._key}`}
              />
            );
          case "careerTraits":
            return (
              <CareerTraitsSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "hiringProcess":
            return (
              <HiringProcessSection
                key={section._key}
                content={section}
                titleId={id}
              />
            );
          case "careersCta":
            return (
              <CareersCtaSection
                key={section._key}
                site={site}
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
                id={`careers-${section._key}`}
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
