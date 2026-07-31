import { getSite } from "@/sanity/lib/getSite";
import { getHomePage } from "@/sanity/lib/getHomePage";
import { getFaqs } from "@/sanity/lib/getFaqs";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { getServices } from "@/sanity/lib/getServices";
import { getIndustries } from "@/sanity/lib/getIndustries";
import { getTrustLogos } from "@/sanity/lib/getTrustLogos";
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
import { FinalCTASection } from "@/components/sections/FinalCTASection";

export default async function HomePage() {
  const [
    site,
    home,
    faqs,
    testimonials,
    profile,
    services,
    industries,
    trustLogos,
  ] = await Promise.all([
    getSite(),
    getHomePage(),
    getFaqs(),
    getTestimonials(),
    getReviewSettings(),
    getServices(),
    getIndustries(),
    getTrustLogos(),
  ]);

  // Empty collections hide their sections (a successful fetch returning zero
  // documents means the client removed the content on purpose).
  return (
    <>
      <HeroSection site={site} content={home.hero} />
      {trustLogos.length > 0 && <TrustBar logos={trustLogos} />}
      <AboutSection site={site} content={home.about} />
      {services.length > 0 && <ServicesSection services={services} />}
      <EmergencySection site={site} content={home.emergency} />
      {industries.length > 0 && <IndustriesSection industries={industries} />}
      <WhyChooseUsSection site={site} content={home.whyChooseUs} />
      <ProcessSection content={home.process} />
      <ComplianceSection logos={trustLogos} content={home.compliance} />
      {testimonials.length > 0 && (
        <TestimonialsSection
          testimonials={testimonials}
          site={site}
          profile={profile}
        />
      )}
      <CaseStudySection content={home.caseStudy} />
      <ServiceAreaSection site={site} content={home.serviceArea} />
      {faqs.length > 0 && <FAQSection faqs={faqs} />}
      <FinalCTASection site={site} content={home.finalCta} />
    </>
  );
}
