import type { Metadata } from "next";
import { getCareersPage } from "@/sanity/lib/getCareersPage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Careers | Fred's Plumbing",
  description:
    "Plumbing careers in Dallas–Fort Worth: apprentice, journeyman, and emergency service roles with training, steady work, and a team that treats its people well.",
  alternates: { canonical: "/about/careers" },
};

export default async function CareersPage() {
  const [sections, data] = await Promise.all([getCareersPage(), getSectionData()]);

  // FAQPage schema uses the exact strings a Q&A section renders — relevant
  // only if the owner adds one in Studio.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/about/careers" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <SectionRenderer
        sections={sections}
        data={data}
        idPrefix="careers"
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
