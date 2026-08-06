import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { AssociationBadgeStrip } from "@/components/sections/AssociationBadgeStrip";
import { LocationMapSection } from "@/components/sections/LocationMapSection";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { cityHref, type CityPageContent } from "@/data/cities";
import type { ServiceFaqSection } from "@/data/serviceSections";
import type { SectionData } from "@/sanity/lib/getSectionData";

interface CityPageProps {
  content: CityPageContent;
  data: SectionData;
}

/**
 * The shared "Areas We Serve" city template: the document's ordered section
 * stack, then — template-rendered, not stack items — the association badge
 * strip and the Google-map band close the page above the footer, exactly as
 * the service pages do. Adding a city is one entry in `data/cities.ts` (or
 * a published `cityPage` document) plus a thin route file that calls
 * `getCityPage(slug)` — no new components.
 */
export function CityPage({ content, data }: CityPageProps) {
  // FAQPage schema uses the exact strings the FAQ section renders — parity
  // with the service pages if the owner adds a Q&A band in Studio.
  const faqSection = content.sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  // A badgeStrip placed in the stack takes over from the automatic strip —
  // same rule as the service pages.
  const stackHasBadgeStrip = content.sections.some(
    (section) => section._type === "badgeStrip",
  );

  return (
    <>
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <SectionRenderer
        sections={content.sections}
        data={data}
        idPrefix="city"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Areas We Serve", href: "/areas-we-serve" },
          { label: content.city, href: cityHref(content.slug) },
        ]}
      />
      {/* Association/certification badges close the content on every city
          page, per the owner's reference — then the map band. */}
      {!stackHasBadgeStrip && <AssociationBadgeStrip logos={data.trustLogos} />}
      <LocationMapSection site={data.site} directionsUrl={data.profile.reviewsUrl} />
    </>
  );
}
