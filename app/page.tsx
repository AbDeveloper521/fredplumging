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

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <AboutSection />
      <ServicesSection />
      <EmergencySection />
      <IndustriesSection />
      <WhyChooseUsSection />
      <ProcessSection />
      <ComplianceSection />
      <TestimonialsSection />
      <CaseStudySection />
      <ServiceAreaSection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
