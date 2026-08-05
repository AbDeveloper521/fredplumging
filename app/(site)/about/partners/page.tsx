import type { Metadata } from "next";
import { getSite } from "@/sanity/lib/getSite";
import { getPartnersPage } from "@/sanity/lib/getPartnersPage";
import { getTrustLogos } from "@/sanity/lib/getTrustLogos";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { PartnersSectionRenderer } from "@/components/sections/PartnersSectionRenderer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Partners & Vendor Compliance | Fred's Plumbing",
  description:
    "Fred's Plumbing is an approved vendor on VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, and RealPage — insurance, licensing, and documentation kept current for fast onboarding across Dallas–Fort Worth.",
  alternates: { canonical: "/about/partners" },
};

export default async function PartnersPage() {
  const [site, sections, trustLogos, testimonials, profile] = await Promise.all([
    getSite(),
    getPartnersPage(),
    getTrustLogos(),
    getTestimonials(),
    getReviewSettings(),
  ]);

  // FAQPage schema uses the exact strings the FAQ section renders — same
  // rule as the service pages.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Partners", href: "/about/partners" },
        ]}
      />
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <PartnersSectionRenderer
        sections={sections}
        site={site}
        trustLogos={trustLogos}
        testimonials={testimonials}
        profile={profile}
      />
    </>
  );
}
