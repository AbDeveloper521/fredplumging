import { getSite } from "@/sanity/lib/getSite";
import { getFaqs } from "@/sanity/lib/getFaqs";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
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
  const [site, faqs, testimonials, services, industries, trustLogos] =
    await Promise.all([
      getSite(),
      getFaqs(),
      getTestimonials(),
      getServices(),
      getIndustries(),
      getTrustLogos(),
    ]);

  // Empty collections hide their sections (a successful fetch returning zero
  // documents means the client removed the content on purpose).
  return (
    <>
      <HeroSection site={site} />
      {trustLogos.length > 0 && <TrustBar logos={trustLogos} />}
      <AboutSection site={site} />
      {services.length > 0 && <ServicesSection services={services} />}
      <EmergencySection site={site} />
      {industries.length > 0 && <IndustriesSection industries={industries} />}
      <WhyChooseUsSection />
      <ProcessSection />
      <ComplianceSection logos={trustLogos} />
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} site={site} />
      )}
      <CaseStudySection />
      <ServiceAreaSection site={site} />
      {faqs.length > 0 && <FAQSection faqs={faqs} />}
      <FinalCTASection site={site} />
    </>
  );
}
