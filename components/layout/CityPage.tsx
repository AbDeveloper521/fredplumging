import { CitySectionRenderer } from "@/components/sections/CitySectionRenderer";
import { AssociationBadgeStrip } from "@/components/sections/AssociationBadgeStrip";
import { LocationMapSection } from "@/components/sections/LocationMapSection";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { cityHref, type CityPageContent } from "@/data/cities";
import type { ServiceFaqSection } from "@/data/serviceSections";
import type { TrustLogo } from "@/data/navigation";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import type { Testimonial } from "@/data/testimonials";
import type { SiteContent } from "@/data/site";

interface CityPageProps {
  content: CityPageContent;
  site: SiteContent;
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
  trustLogos: TrustLogo[];
}

/**
 * The shared "Areas We Serve" city template: the document's ordered section
 * stack, then — template-rendered, not stack items — the association badge
 * strip and the Google-map band close the page above the footer, exactly as
 * the service pages do. Adding a city is one entry in `data/cities.ts` (or
 * a published `cityPage` document) plus a thin route file that calls
 * `getCityPage(slug)` — no new components.
 */
export function CityPage({
  content,
  site,
  testimonials,
  profile,
  trustLogos,
}: CityPageProps) {
  // FAQPage schema uses the exact strings the FAQ section renders — parity
  // with the service pages if the owner adds a Q&A band in Studio.
  const faqSection = content.sections.find(
    (section): section is ServiceFaqSection => section._type === "serviceFaq",
  );

  return (
    <>
      {faqSection && <FaqJsonLd faqs={faqSection.faqs} />}
      <CitySectionRenderer
        sections={content.sections}
        site={site}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Areas We Serve", href: "/areas-we-serve" },
          { label: content.city, href: cityHref(content.slug) },
        ]}
        testimonials={testimonials}
        profile={profile}
      />
      {/* Association/certification badges close the content on every city
          page, per the owner's reference — then the map band. */}
      <AssociationBadgeStrip logos={trustLogos} />
      <LocationMapSection site={site} directionsUrl={profile.reviewsUrl} />
    </>
  );
}
