import type { LibrarySection } from "@/data/sectionLibrary";
import type { SectionData } from "@/sanity/lib/getSectionData";
import { ServiceHeroSection, type Breadcrumb } from "./ServiceHeroSection";
import { ServiceAboutSection } from "./ServiceAboutSection";
import { WhatsIncludedSection } from "./WhatsIncludedSection";
import { SignsYouNeedSection } from "./SignsYouNeedSection";
import { ServiceProcessSection } from "./ServiceProcessSection";
import { ComparisonTableSection } from "./ComparisonTableSection";
import { ServiceTrustSection } from "./ServiceTrustSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { ServicePropertyTypesSection } from "./ServicePropertyTypesSection";
import { IconCardSection } from "./IconCardSection";
import { ServiceFaqSection } from "./ServiceFaqSection";
import { ServiceAreaCmsSection } from "./ServiceAreaCmsSection";
import { RelatedServicesSection } from "./RelatedServicesSection";
import { ServiceFinalCtaSection } from "./ServiceFinalCtaSection";
import { HeroSection } from "./HeroSection";
import { TrustBar } from "./TrustBar";
import { AboutSection } from "./AboutSection";
import { ServicesSection } from "./ServicesSection";
import { EmergencySection } from "./EmergencySection";
import { IndustriesSection } from "./IndustriesSection";
import { WhyChooseUsSection } from "./WhyChooseUsSection";
import { ProcessSection } from "./ProcessSection";
import { ComplianceSection } from "./ComplianceSection";
import { CaseStudySection } from "./CaseStudySection";
import { ServiceAreaSection } from "./ServiceAreaSection";
import { FAQSection } from "./FAQSection";
import { LocationMapSection } from "./LocationMapSection";
import { FinalCTASection } from "./FinalCTASection";
import { AboutHeroSection } from "./AboutHeroSection";
import { AboutStorySection } from "./AboutStorySection";
import { AboutEvolutionSection } from "./AboutEvolutionSection";
import { ValuesGridSection } from "./ValuesGridSection";
import { PageLinksSection } from "./PageLinksSection";
import { PartnersHeroSection } from "./PartnersHeroSection";
import { VendorOnboardingSection } from "./VendorOnboardingSection";
import { PartnerPlatformsSection } from "./PartnerPlatformsSection";
import { PartnerCredentialsSection } from "./PartnerCredentialsSection";
import { CareersHeroSection } from "./CareersHeroSection";
import { CareerValuesSection } from "./CareerValuesSection";
import { JobOpeningsSection } from "./JobOpeningsSection";
import { CareerTraitsSection } from "./CareerTraitsSection";
import { HiringProcessSection } from "./HiringProcessSection";
import { CareersCtaSection } from "./CareersCtaSection";
import { CityCommunitiesSection } from "./CityCommunitiesSection";
import { AssociationBadgeStrip } from "./AssociationBadgeStrip";

/**
 * Stable in-page ids per section type on the ANCHOR scheme (service and
 * industry pages) — used for aria-labelledby and as anchor targets (e.g. a
 * What's-Included row linking to #repair-or-replace, which published
 * content does). A repeated type gets a -2, -3… suffix so ids stay unique.
 * Non-service types have ids here only so a foreign section added to a
 * service page gets a sensible stable anchor.
 */
const SECTION_IDS: Record<LibrarySection["_type"], string> = {
  serviceHero: "service-hero",
  serviceAbout: "about-service",
  whatsIncluded: "whats-included",
  signsYouNeed: "warning-signs",
  processSteps: "how-we-work",
  comparisonTable: "repair-or-replace",
  serviceTrust: "why-trust-us",
  serviceTestimonials: "client-reviews",
  propertyTypes: "property-types",
  iconCardSection: "icon-cards",
  serviceFaq: "service-faq",
  serviceArea: "service-area",
  trustLogoStrip: "trust-badges",
  // Not "association-badges": the template-rendered strip on service/city
  // pages defaults its own titleId to "association-badges-heading" — a stack
  // copy of the band must not collide with it.
  badgeStrip: "certification-badges",
  relatedServices: "related-services",
  finalCta: "final-cta",
  homeHero: "home-hero",
  homeTrustBar: "trust-bar",
  homeAbout: "about-company",
  homeServices: "services-grid",
  homeEmergency: "emergency",
  homeIndustries: "who-we-serve",
  homeWhyChooseUs: "why-choose-us",
  homeProcess: "how-it-works",
  homeCompliance: "compliance",
  homeTestimonials: "reviews",
  homeCaseStudy: "case-study",
  homeServiceArea: "service-area-map",
  homeFaq: "faq",
  // Not "location-map": the template-rendered map band on service pages
  // defaults its own titleId to "location-map-heading" — a stack copy of
  // the band must not collide with it.
  homeLocationMap: "map-band",
  homeFinalCta: "closing-cta",
  aboutHero: "about-hero",
  aboutStory: "our-story",
  aboutEvolution: "evolution",
  valuesGrid: "values",
  pageLinks: "page-links",
  partnersHero: "partners-hero",
  vendorOnboarding: "vendor-onboarding",
  partnerPlatforms: "platforms",
  partnerCredentials: "credentials",
  careersHero: "careers-hero",
  careerValues: "career-values",
  jobOpenings: "job-openings",
  careerTraits: "traits",
  hiringProcess: "hiring-process",
  careersCta: "careers-cta",
  cityCommunities: "communities",
};

interface SectionRendererProps {
  sections: LibrarySection[];
  /** Site settings + every collection a library section can pull from. */
  data: SectionData;
  /**
   * DOM-id scheme. Absent (service/industry pages): the anchor scheme above.
   * Set ("home", "about", "partners", "careers", "city"): ids derive from
   * each item's `_key` — `${idPrefix}-${_key}` — so duplicated sections
   * can never collide.
   */
  idPrefix?: string;
  /** Trail ending at the current page — heroes render it when present. */
  breadcrumbs?: Breadcrumb[];
  /** Slug of the page being rendered (self-link guard for related cards). */
  currentSlug?: string;
}

/**
 * THE section renderer: maps any page's ordered section stack — drawn from
 * the one shared library — to its components, so a band edited in Studio
 * behaves identically on every page that carries it. Collection-driven
 * sections keep the existing rule: an empty collection hides the band (a
 * successful fetch returning zero documents means the client removed the
 * content on purpose).
 */
export function SectionRenderer({
  sections,
  data,
  idPrefix,
  breadcrumbs = [],
  currentSlug,
}: SectionRendererProps) {
  const {
    site,
    services,
    industries,
    testimonials,
    profile,
    trustLogos,
    faqs,
    jobs,
    cities,
  } = data;
  // The blurb is the switch: strip-only trust logos stay off platform cards.
  const partners = trustLogos.filter((logo) => Boolean(logo.blurb));
  const seen = new Map<string, number>();

  return (
    <>
      {/* Belt-and-braces: the mapper already skips hidden CMS sections. */}
      {sections.filter((section) => section.hidden !== true).map((section) => {
        let id: string;
        if (idPrefix) {
          id = `${idPrefix}-${section._key}`;
        } else {
          const count = (seen.get(section._type) ?? 0) + 1;
          seen.set(section._type, count);
          const base = SECTION_IDS[section._type];
          id = count === 1 ? base : `${base}-${count}`;
        }
        const titleId = `${id}-heading`;

        switch (section._type) {
          // ————— Service library —————
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
            return <ServiceTrustSection key={section._key} section={section} id={id} />;
          case "serviceTestimonials":
            return (
              <TestimonialsSection
                key={section._key}
                testimonials={testimonials}
                site={site}
                profile={profile}
                heading={section.heading}
                titleId={titleId}
                filterTags={section.filterTags}
                limit={section.limit}
              />
            );
          case "propertyTypes":
            return (
              <ServicePropertyTypesSection key={section._key} section={section} id={id} />
            );
          case "iconCardSection":
            return <IconCardSection key={section._key} section={section} id={id} />;
          case "serviceFaq":
            return <ServiceFaqSection key={section._key} section={section} id={id} />;
          case "serviceArea":
            return (
              <ServiceAreaCmsSection
                key={section._key}
                section={section}
                site={site}
                cities={cities}
                id={id}
              />
            );
          case "trustLogoStrip":
            // Retired: renders nothing — the placeable credentials band is
            // the badgeStrip section below.
            return null;
          case "badgeStrip":
            return (
              <AssociationBadgeStrip
                key={section._key}
                logos={trustLogos}
                heading={section.heading}
                titleId={titleId}
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

          // ————— Homepage bands —————
          case "homeHero":
            return (
              <HeroSection key={section._key} site={site} content={section} titleId={titleId} />
            );
          case "homeTrustBar":
            return trustLogos.length > 0 ? (
              <TrustBar key={section._key} logos={trustLogos} tagline={section.tagline} />
            ) : null;
          case "homeAbout":
            return (
              <AboutSection key={section._key} site={site} content={section} titleId={titleId} />
            );
          case "homeServices":
            return services.length > 0 ? (
              <ServicesSection
                key={section._key}
                services={services}
                content={section}
                titleId={titleId}
              />
            ) : null;
          case "homeEmergency":
            return (
              <EmergencySection
                key={section._key}
                site={site}
                content={section}
                titleId={titleId}
              />
            );
          case "homeIndustries":
            return industries.length > 0 ? (
              <IndustriesSection
                key={section._key}
                industries={industries}
                content={section}
                titleId={titleId}
              />
            ) : null;
          case "homeWhyChooseUs":
            return (
              <WhyChooseUsSection
                key={section._key}
                site={site}
                content={section}
                titleId={titleId}
              />
            );
          case "homeProcess":
            return <ProcessSection key={section._key} content={section} titleId={titleId} />;
          case "homeCompliance":
            return (
              <ComplianceSection
                key={section._key}
                logos={trustLogos}
                content={section}
                titleId={titleId}
              />
            );
          case "homeTestimonials":
            return (
              <TestimonialsSection
                key={section._key}
                testimonials={testimonials}
                site={site}
                profile={profile}
                heading={section.heading}
                titleId={titleId}
              />
            );
          case "homeCaseStudy":
            return <CaseStudySection key={section._key} content={section} titleId={titleId} />;
          case "homeServiceArea":
            return (
              <ServiceAreaSection
                key={section._key}
                site={site}
                content={section}
                titleId={titleId}
              />
            );
          case "homeFaq":
            return faqs.length > 0 ? (
              <FAQSection key={section._key} faqs={faqs} content={section} titleId={titleId} />
            ) : null;
          case "homeLocationMap":
            return (
              <LocationMapSection
                key={section._key}
                site={site}
                directionsUrl={profile.reviewsUrl}
                titleId={titleId}
              />
            );
          case "homeFinalCta":
            return (
              <FinalCTASection
                key={section._key}
                site={site}
                content={section}
                titleId={titleId}
              />
            );

          // ————— About bands —————
          case "aboutHero":
            return (
              <AboutHeroSection
                key={section._key}
                site={site}
                content={section}
                titleId={titleId}
              />
            );
          case "aboutStory":
            return (
              <AboutStorySection
                key={section._key}
                site={site}
                content={section}
                titleId={titleId}
              />
            );
          case "aboutEvolution":
            return (
              <AboutEvolutionSection key={section._key} content={section} titleId={titleId} />
            );
          case "valuesGrid":
            return <ValuesGridSection key={section._key} content={section} titleId={titleId} />;
          case "pageLinks":
            return <PageLinksSection key={section._key} content={section} titleId={titleId} />;

          // ————— Partners bands —————
          case "partnersHero":
            return (
              <PartnersHeroSection
                key={section._key}
                site={site}
                content={section}
                titleId={titleId}
              />
            );
          case "vendorOnboarding":
            return (
              <VendorOnboardingSection key={section._key} content={section} titleId={titleId} />
            );
          case "partnerPlatforms":
            return (
              <PartnerPlatformsSection
                key={section._key}
                partners={partners}
                content={section}
                titleId={titleId}
              />
            );
          case "partnerCredentials":
            return (
              <PartnerCredentialsSection
                key={section._key}
                content={section}
                titleId={titleId}
              />
            );

          // ————— Careers bands —————
          case "careersHero":
            return (
              <CareersHeroSection key={section._key} content={section} titleId={titleId} />
            );
          case "careerValues":
            return (
              <CareerValuesSection key={section._key} content={section} titleId={titleId} />
            );
          case "jobOpenings":
            return (
              <JobOpeningsSection
                key={section._key}
                jobs={jobs}
                site={site}
                heading={section.heading}
                applyLabel={section.applyLabel}
                id={id}
              />
            );
          case "careerTraits":
            return (
              <CareerTraitsSection key={section._key} content={section} titleId={titleId} />
            );
          case "hiringProcess":
            return (
              <HiringProcessSection key={section._key} content={section} titleId={titleId} />
            );
          case "careersCta":
            return (
              <CareersCtaSection
                key={section._key}
                site={site}
                content={section}
                titleId={titleId}
              />
            );

          // ————— City bands —————
          case "cityCommunities":
            return (
              <CityCommunitiesSection key={section._key} section={section} id={id} />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
