import { getHomePage } from "@/sanity/lib/getHomePage";
import { getSectionData } from "@/sanity/lib/getSectionData";
import type { ServiceFaqSection } from "@/data/serviceSections";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { FaqJsonLd } from "@/components/seo/JsonLd";

export default async function HomePage() {
  const [sections, data] = await Promise.all([getHomePage(), getSectionData()]);

  // FAQPage schema uses the exact strings a Q&A section renders — same rule
  // as every other page, relevant only if the owner adds one in Studio.
  const faqSection = sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  // The homepage is an ordered section stack (reorder/hide/duplicate in the
  // Studio). Collections still gate their sections: an empty collection
  // hides its band.
  return (
    <>
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <SectionRenderer sections={sections} data={data} idPrefix="home" />
    </>
  );
}
