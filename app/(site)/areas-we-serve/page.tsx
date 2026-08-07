import type { Metadata } from "next";
import { getAreasIndexPage } from "@/sanity/lib/getAreasIndexPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Areas We Serve | Fred's Plumbing",
  description: "Fred's Plumbing serves commercial and multi-family properties throughout the Dallas–Fort Worth Metroplex.",
  alternates: { canonical: "/areas-we-serve" },
};

export default async function AreasWeServePage() {
  const [sections, data] = await Promise.all([
    getAreasIndexPage(),
    getSectionData(),
  ]);

  // FAQPage schema uses the exact strings a Q&A section renders — relevant
  // only if the owner adds one in Studio.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Areas We Serve", href: "/areas-we-serve" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <SectionRenderer
        sections={sections}
        data={data}
        idPrefix="areas"
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
