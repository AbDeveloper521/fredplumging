import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { TrustLogoStrip } from "@/components/ui/TrustLogoStrip";
import { CityServicesSection } from "@/components/sections/CityServicesSection";
import { CityCommunitiesSection } from "@/components/sections/CityCommunitiesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ServiceAboutSection } from "@/components/sections/ServiceAboutSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import type { CityPageContent } from "@/data/cities";
import { vendorPlatformLogos, type TrustLogo } from "@/data/navigation";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import type { Testimonial } from "@/data/testimonials";
import type { SiteContent } from "@/data/site";

interface CityPageProps {
  content: CityPageContent;
  site: SiteContent;
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
  trustLogos: TrustLogo[];
}

/**
 * The shared "Areas We Serve" city template. Fully data-driven: adding a
 * city is one entry in `data/cities.ts` (or a published `cityPage` document)
 * plus a thin route file that calls `getCityPage(slug)` — no new components.
 * Every band except the hero is individually omittable.
 */
export function CityPage({
  content,
  site,
  testimonials,
  profile,
  trustLogos,
}: CityPageProps) {
  // The closing tile strip is a vendor-platform strip — certification
  // badges belong to the service pages' full-colour band.
  const vendorLogos = vendorPlatformLogos(trustLogos);
  return (
    <>
      {/* Hero — same dark composition as the other page shells. */}
      <section
        aria-labelledby="page-heading"
        className="relative isolate overflow-hidden bg-navy-950"
      >
        <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_10%,rgb(27_48_73/0.9),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_85%_80%,rgb(211_33_39/0.16),transparent_65%)]"
        />

        <Container className="relative pt-[120px] pb-16 lg:pt-[190px] lg:pb-24">
          <p className="flex items-center gap-3 text-[13px] font-bold tracking-[0.14em] text-red-500 uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-red-500" />
            {site.name}
          </p>
          <h1
            id="page-heading"
            className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
          >
            {content.heroHeading}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-grey-300">
            {content.heroIntro}
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button href="/contact" size="lg" withArrow>
              Request Service
            </Button>
            <Button href={site.phoneHref} variant="phone" size="lg" withPhoneIcon>
              Call {site.phone}
            </Button>
          </div>
        </Container>

        {/* Wave hand-off, filled with the next band's off-white. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="relative block h-10 w-full text-offwhite sm:h-16"
        >
          <path
            d="M0 64h1440V22C1200 2 960 0 720 12S240 44 0 30v34Z"
            fill="currentColor"
          />
        </svg>
      </section>

      {content.serviceCards.length > 0 && (
        <CityServicesSection
          id="city-services"
          heading={
            content.servicesHeading ??
            `Reliable Plumbing Services in ${content.city}`
          }
          cards={content.serviceCards}
        />
      )}

      {content.whyChooseHeading && content.whyChooseBody && (
        <section
          aria-labelledby="city-why-heading"
          className="relative isolate overflow-hidden bg-navy-900 py-16 sm:py-20 lg:py-24"
        >
          <div aria-hidden="true" className="bg-grid-dark absolute inset-0" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgb(211_33_39/0.12),transparent_65%)]"
          />
          <Container className="relative">
            <Reveal>
              <SectionHeading
                titleId="city-why-heading"
                title={content.whyChooseHeading}
                description={content.whyChooseBody}
                align="center"
                theme="dark"
                className="max-w-3xl"
              />
            </Reveal>
          </Container>
        </section>
      )}

      <TestimonialsSection
        testimonials={testimonials}
        site={site}
        profile={profile}
        heading={content.reviewsHeading}
        titleId="city-reviews-heading"
      />

      {content.heritageHeading && content.heritageParagraphs.length > 0 && (
        <ServiceAboutSection
          id="city-heritage"
          section={{
            _type: "serviceAbout",
            _key: "city-heritage",
            heading: content.heritageHeading,
            paragraphs: content.heritageParagraphs,
            photoPrimary: content.heritagePhoto,
            photoSubjectPrimary: content.heritagePhotoSubject,
          }}
        />
      )}

      {content.communitiesHeading && content.communitiesBody && (
        <CityCommunitiesSection
          id="city-communities"
          heading={content.communitiesHeading}
          body={content.communitiesBody}
          communities={content.communities}
        />
      )}

      {content.showLogoStrip && vendorLogos.length > 0 && (
        <section
          aria-label="Partner platforms and vendor systems"
          className="border-t border-grey-300/40 bg-white py-12 sm:py-14"
        >
          <Container>
            <Reveal>
              <TrustLogoStrip logos={vendorLogos} />
            </Reveal>
          </Container>
        </section>
      )}

      <FinalCTASection site={site} />
    </>
  );
}
