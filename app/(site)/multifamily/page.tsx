import type { Metadata } from "next";
import { getMultifamilyIndexPage } from "@/sanity/lib/getMultifamilyIndexPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Multifamily Plumbing | Fred's Plumbing",
  description: "Multifamily plumbing services for apartments, condos, assisted living, and nursing homes across Dallas–Fort Worth.",
  alternates: { canonical: "/multifamily" },
};

export default async function MultifamilyPage() {
  const [sections, data] = await Promise.all([
    getMultifamilyIndexPage(),
    getSectionData(),
  ]);

  // FAQPage schema uses the exact strings a Q&A section renders — relevant
  // only if the owner adds one in Studio.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Multifamily", href: "/multifamily" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <SectionRenderer
        sections={sections}
        data={data}
        idPrefix="multifamily"
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
