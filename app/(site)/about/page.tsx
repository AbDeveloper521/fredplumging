import type { Metadata } from "next";
import { getAboutPage } from "@/sanity/lib/getAboutPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About Us | Fred's Plumbing",
  description:
    "Family and employee owned since 1996, Fred's Plumbing provides multi-family and commercial plumbing across the Dallas–Fort Worth Metroplex — 24/7, 365 days a year.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [sections, data] = await Promise.all([getAboutPage(), getSectionData()]);

  // FAQPage schema uses the exact strings a Q&A section renders — relevant
  // only if the owner adds one in Studio.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <SectionRenderer
        sections={sections}
        data={data}
        idPrefix="about"
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
