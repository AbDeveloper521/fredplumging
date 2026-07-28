import type { Metadata } from "next";
import { Clock, MapPin, ShieldCheck } from "lucide-react";
import { getSite } from "@/sanity/lib/getSite";
import { getTrustLogos } from "@/sanity/lib/getTrustLogos";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { vendorFaqs } from "@/data/faqs";
import type { ServiceFaqSection as ServiceFaqSectionData } from "@/data/serviceSections";
import { Container } from "@/components/ui/Container";
import { VendorOnboardingSection } from "@/components/sections/VendorOnboardingSection";
import { PartnerPlatformsSection } from "@/components/sections/PartnerPlatformsSection";
import { PartnerCredentialsSection } from "@/components/sections/PartnerCredentialsSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { ServiceFaqSection } from "@/components/sections/ServiceFaqSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Partners & Vendor Compliance | Fred's Plumbing",
  description:
    "Fred's Plumbing is an approved vendor on VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, and RealPage — insurance, licensing, and documentation kept current for fast onboarding across Dallas–Fort Worth.",
  alternates: { canonical: "/about/partners" },
};

/** FAQ section object — same shape the CMS-driven service pages render. */
const faqSection: ServiceFaqSectionData = {
  _type: "serviceFaq",
  _key: "partner-faq",
  heading: "Vendor Onboarding, Answered",
  background: "offwhite",
  faqs: vendorFaqs.map((faq, i) => ({
    _key: `partner-faq-${i + 1}`,
    question: faq.question,
    answer: faq.answer,
  })),
};

export default async function PartnersPage() {
  const [site, trustLogos, testimonials, profile] = await Promise.all([
    getSite(),
    getTrustLogos(),
    getTestimonials(),
    getReviewSettings(),
  ]);
  // The blurb is the switch: strip-only entries (Greystar, TDLR, …) stay out.
  const partners = trustLogos.filter((logo) => Boolean(logo.blurb));

  const credentials = [
    { icon: ShieldCheck, label: `Licensed · ${site.licenseNumber}` },
    { icon: MapPin, label: `${site.yearsInBusiness} years in DFW` },
    { icon: Clock, label: "24/7 dispatch" },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Partners", href: "/about/partners" },
        ]}
      />
      <FaqJsonLd faqs={faqSection.faqs} />

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
            About Us
          </p>
          <h1
            id="page-heading"
            className="mt-6 max-w-3xl text-[34px] leading-[1.08] font-extrabold tracking-tight text-balance text-white sm:text-[44px] lg:text-[52px]"
          >
            Fully Compliant and Approved Across Leading Vendor Systems
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-grey-300">
            Fred&rsquo;s Plumbing is registered and in good standing on the
            vendor-compliance platforms property management companies rely on —
            VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, and RealPage.
            Insurance, licensing, and documentation stay current in every
            system, so onboarding us is a lookup, not a paperwork chase.
          </p>
          <ul className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            {credentials.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-sm font-bold text-white"
              >
                <Icon aria-hidden="true" className="size-4 text-red-500" />
                {label}
              </li>
            ))}
          </ul>
        </Container>

        {/* Same wave as the testimonials hero, filled with the next band's
            navy so the dark hero hands off to the dark onboarding section. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          className="relative block h-10 w-full text-navy-950 sm:h-16"
        >
          <path
            d="M0 64h1440V22C1200 2 960 0 720 12S240 44 0 30v34Z"
            fill="currentColor"
          />
        </svg>
      </section>

      <VendorOnboardingSection />

      <PartnerPlatformsSection partners={partners} id="partner-platforms" />

      <PartnerCredentialsSection />

      <TestimonialsSection
        testimonials={testimonials}
        site={site}
        profile={profile}
        heading="What Property Managers Say About Working With Us"
        titleId="partner-reviews-heading"
        filterTags={["commercial-plumbing", "apartments"]}
        limit={4}
      />

      <ServiceFaqSection section={faqSection} id="partner-faq" />

      <FinalCTASection site={site} />
    </>
  );
}
