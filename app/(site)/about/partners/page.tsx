import type { Metadata } from "next";
import { getPartnersPage } from "@/sanity/lib/getPartnersPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Partners & Vendor Compliance | Fred's Plumbing",
  description:
    "Fred's Plumbing is an approved vendor on VendorCafe, Compliance Depot, Vendor Nexus, NetVendor, and RealPage — insurance, licensing, and documentation kept current for fast onboarding across Dallas–Fort Worth.",
  alternates: { canonical: "/about/partners" },
};

export default async function PartnersPage() {
  const [sections, data] = await Promise.all([
    getPartnersPage(),
    getSectionData(),
  ]);

  // FAQPage schema uses the exact strings the FAQ section renders — same
  // rule as the service pages.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Partners", href: "/about/partners" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <SectionRenderer
        sections={sections}
        data={data}
        idPrefix="partners"
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
