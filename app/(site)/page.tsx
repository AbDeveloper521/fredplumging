import { getSite } from "@/sanity/lib/getSite";
import { getHomePage } from "@/sanity/lib/getHomePage";
import { getFaqs } from "@/sanity/lib/getFaqs";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { getServices } from "@/sanity/lib/getServices";
import { getIndustries } from "@/sanity/lib/getIndustries";
import { getTrustLogos } from "@/sanity/lib/getTrustLogos";
import { HomeSectionRenderer } from "@/components/sections/HomeSectionRenderer";

export default async function HomePage() {
  const [
    site,
    sections,
    faqs,
    testimonials,
    profile,
    services,
    industries,
    trustLogos,
  ] = await Promise.all([
    getSite(),
    getHomePage(),
    getFaqs(),
    getTestimonials(),
    getReviewSettings(),
    getServices(),
    getIndustries(),
    getTrustLogos(),
  ]);

  // The homepage is an ordered section stack (reorder/hide/duplicate in the
  // Studio). Collections still gate their sections: an empty collection
  // hides its band. Industries stays fetched even though the default stack
  // omits "Who We Serve" — the owner can re-add that section in Studio.
  return (
    <HomeSectionRenderer
      sections={sections}
      site={site}
      services={services}
      industries={industries}
      testimonials={testimonials}
      profile={profile}
      trustLogos={trustLogos}
      faqs={faqs}
    />
  );
}
