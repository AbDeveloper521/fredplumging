import type { Metadata } from "next";
import { getSite } from "@/sanity/lib/getSite";
import { getCareersPage } from "@/sanity/lib/getCareersPage";
import { getJobPostings } from "@/sanity/lib/getJobs";
import { getTestimonials } from "@/sanity/lib/getTestimonials";
import { getReviewSettings } from "@/sanity/lib/getReviewSettings";
import { CareersSectionRenderer } from "@/components/sections/CareersSectionRenderer";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Careers | Fred's Plumbing",
  description:
    "Plumbing careers in Dallas–Fort Worth: apprentice, journeyman, and emergency service roles with training, steady work, and a team that treats its people well.",
  alternates: { canonical: "/about/careers" },
};

export default async function CareersPage() {
  // Testimonials/reviews are fetched even though the default stack has no
  // reviews band — the owner can add one in Studio, and the map band needs
  // the reviews profile for its directions link.
  const [site, sections, jobs, testimonials, profile] = await Promise.all([
    getSite(),
    getCareersPage(),
    getJobPostings(),
    getTestimonials(),
    getReviewSettings(),
  ]);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Careers", href: "/about/careers" },
        ]}
      />
      <CareersSectionRenderer
        sections={sections}
        site={site}
        jobs={jobs}
        testimonials={testimonials}
        profile={profile}
      />
    </>
  );
}
