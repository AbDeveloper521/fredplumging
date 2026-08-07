import "server-only";
import { getSite } from "@/sanity/lib/getSite";
import { getServices } from "@/sanity/lib/getServices";
import { getIndustries } from "@/sanity/lib/getIndustries";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { getTrustLogos } from "@/sanity/lib/getTrustLogos";
import { getFaqs } from "@/sanity/lib/getFaqs";
import { getJobPostings } from "@/sanity/lib/getJobs";
import { getCities } from "@/sanity/lib/getCityPage";
import type { CityLink } from "@/data/cities";
import type { SiteContent } from "@/data/site";
import type { Service } from "@/data/services";
import type { Industry } from "@/data/industries";
import type { Testimonial } from "@/data/testimonials";
import type { GoogleReviewProfile } from "@/data/googleReviews";
import type { TrustLogo } from "@/data/navigation";
import type { Faq } from "@/data/faqs";
import type { JobPosting } from "@/data/jobs";

/**
 * Everything any section in the shared library can need: site settings plus
 * every collection a collection-driven band pulls from. Fetched by all
 * seven page templates so a section built on one page renders with real
 * data on any other — each fetcher is cached and tagged, so this costs
 * cache lookups, not repeat requests.
 */
export interface SectionData {
  site: SiteContent;
  services: Service[];
  industries: Industry[];
  testimonials: Testimonial[];
  profile: GoogleReviewProfile;
  trustLogos: TrustLogo[];
  faqs: Faq[];
  jobs: JobPosting[];
  /** Cities with a page — the coverage band's link list. */
  cities: CityLink[];
}

export async function getSectionData(): Promise<SectionData> {
  const [
    site,
    services,
    industries,
    testimonials,
    profile,
    trustLogos,
    faqs,
    jobs,
    cities,
  ] = await Promise.all([
    getSite(),
    getServices(),
    getIndustries(),
    getTestimonials(),
    getReviewSettings(),
    getTrustLogos(),
    getFaqs(),
    getJobPostings(),
    getCities(),
  ]);
  return {
    site,
    services,
    industries,
    testimonials,
    profile,
    trustLogos,
    faqs,
    jobs,
    cities,
  };
}
