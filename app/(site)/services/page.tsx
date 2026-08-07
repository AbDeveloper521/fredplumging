import type { Metadata } from "next";
import { getServicesIndexPage } from "@/sanity/lib/getServicesIndexPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Plumbing Services | Fred's Plumbing",
  description: "Commercial, multi-family, emergency, drain and sewer, and preventive maintenance plumbing services across Dallas–Fort Worth.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [sections, data] = await Promise.all([
    getServicesIndexPage(),
    getSectionData(),
  ]);

  // FAQPage schema uses the exact strings a Q&A section renders — relevant
  // only if the owner adds one in Studio.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <SectionRenderer
        sections={sections}
        data={data}
        idPrefix="services"
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
